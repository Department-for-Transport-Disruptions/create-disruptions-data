import { randomUUID } from "crypto";
import { S3Client } from "@aws-sdk/client-s3";
import { Disruption } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { ptSituationElementSchema, siriSchema } from "@create-disruptions-data/shared-ts/siriTypes.zod";
import { getApiDisruptions, notEmpty } from "@create-disruptions-data/shared-ts/utils";
import { getDate } from "@create-disruptions-data/shared-ts/utils/dates";
import { getPublishedDisruptionsDataFromDynamo } from "@create-disruptions-data/shared-ts/utils/dynamo";
import { fetchAdminAreas } from "@create-disruptions-data/shared-ts/utils/refDataApi";
import { parse } from "js2xmlparser";
import * as logger from "lambda-log";
import xmlFormat from "xml-formatter";
import { getOrganisationInfoById } from "./dynamo";
import { convertToCsv, includeDisruption } from "./util";
import { getS3Client, uploadToS3 } from "./util/awsClient";
import { getPtSituationElementFromSiteDisruption } from "./util/siri";

const s3Client = getS3Client();

const enrichDisruptionsWithOrgInfo = async (disruptions: Disruption[], orgTableName: string) => {
    const orgIds = disruptions
        .map((disruption) => disruption.orgId)
        .filter(notEmpty)
        .filter((value, index, array) => array.indexOf(value) === index);

    const orgInfo = (await Promise.all(orgIds.map(async (id) => getOrganisationInfoById(orgTableName, id)))).filter(
        notEmpty,
    );

    const date = getDate();

    return disruptions
        .map((disruption) => {
            if (!disruption.orgId) {
                return null;
            }

            const org = orgInfo.find((org) => org.id === disruption.orgId);

            if (!org || !includeDisruption(disruption, date)) {
                return null;
            }

            return {
                ...disruption,
                organisation: {
                    id: org.id,
                    name: org.name,
                },
            };
        })
        .filter(notEmpty);
};

const convertJsonToSiri = async (
    disruptions: Awaited<ReturnType<typeof enrichDisruptionsWithOrgInfo>>,
    currentTime: string,
    responseMessageIdentifier: string,
) => {
    const adminAreas = await fetchAdminAreas();
    const ptSituationElements = disruptions.map((disruption) =>
        getPtSituationElementFromSiteDisruption(disruption, adminAreas),
    );

    const parsedPtSituationElements =
        ptSituationElements
            .map((item) => {
                const parseResult = ptSituationElementSchema.safeParse(item);

                if (!parseResult.success) {
                    const disruptionId = item?.SituationNumber;
                    logger.error(`Parse failed for disruption ID: ${disruptionId || "unavailable"}`);
                    logger.error(parseResult.error.stack || "");
                    return null;
                }

                return parseResult.data;
            })
            .filter(notEmpty) ?? [];

    const jsonToXmlObject = {
        ServiceDelivery: {
            ProducerRef: "DepartmentForTransport",
            ResponseTimestamp: currentTime,
            ResponseMessageIdentifier: responseMessageIdentifier,
            SituationExchangeDelivery: {
                ResponseTimestamp: currentTime,
                Situations: {
                    PtSituationElement: parsedPtSituationElements,
                },
            },
        },
    };

    logger.info("Verifying JSON against schema...");
    const verifiedObject = siriSchema.parse(jsonToXmlObject);

    const completeObject = {
        "@": {
            version: "2.0",
            xmlns: "http://www.siri.org.uk/siri",
            "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "xsi:schemaLocation": "http://www.siri.org.uk/siri http://www.siri.org.uk/schema/2.0/xsd/siri.xsd",
        },
        ...verifiedObject,
    };

    return parse("Siri", completeObject, {
        declaration: {
            version: "1.0",
            encoding: "UTF-8",
            standalone: "yes",
        },
        useSelfClosingTagIfEmpty: true,
    });
};

export const generateSiriSxAndUploadToS3 = async (
    s3Client: S3Client,
    disruptionsTableName: string,
    orgTableName: string,
    unvalidatedSiriBucketName: string,
    disruptionsJsonBucketName: string,
    disruptionsCsvBucketName: string,
    responseMessageIdentifier: string,
    currentTime: string,
    cancelFeatureFlag: boolean,
) => {
    logger.info("Scanning DynamoDB table...");

    const disruptions = await getPublishedDisruptionsDataFromDynamo(disruptionsTableName, logger);

    const disruptionsWithOrgInfo = await enrichDisruptionsWithOrgInfo(disruptions, orgTableName);

    const siri = await convertJsonToSiri(disruptionsWithOrgInfo, currentTime, responseMessageIdentifier);
    const apiDisruptions = getApiDisruptions(disruptionsWithOrgInfo);
    const dataCatalogueCsv = await convertToCsv(apiDisruptions, cancelFeatureFlag);

    await Promise.all([
        uploadToS3(
            s3Client,
            xmlFormat(siri, {
                collapseContent: true,
            }),
            `${new Date(currentTime).valueOf()}-unvalidated-siri.xml`,
            unvalidatedSiriBucketName,
            "application/xml",
        ),
        uploadToS3(
            s3Client,
            JSON.stringify(apiDisruptions),
            "disruptions.json",
            disruptionsJsonBucketName,
            "application/json",
        ),
        uploadToS3(s3Client, dataCatalogueCsv, "disruptions.csv", disruptionsCsvBucketName, "text/csv"),
    ]);
};

export const main = async (): Promise<void> => {
    try {
        logger.options.dev = process.env.NODE_ENV !== "production";
        logger.options.debug = process.env.ENABLE_DEBUG_LOGS === "true" || process.env.NODE_ENV !== "production";

        logger.options.meta = {
            id: randomUUID(),
        };

        logger.info("Starting SIRI-SX generator...");

        const {
            DISRUPTIONS_TABLE_NAME: disruptionsTableName,
            ORGANISATIONS_TABLE_NAME: orgTableName,
            SIRI_SX_UNVALIDATED_BUCKET_NAME: unvalidatedBucketName,
            DISRUPTIONS_JSON_BUCKET_NAME: disruptionsJsonBucketName,
            DISRUPTIONS_CSV_BUCKET_NAME: disruptionsCsvBucketName,
            STAGE: stage,
        } = process.env;

        const CANCELLATION_FEATURE_FLAG = !["preprod", "prod"].includes(stage || "development");

        if (!stage) {
            throw new Error("Stage must be set");
        }

        if (!disruptionsTableName || !orgTableName) {
            throw new Error("Dynamo table names not set");
        }

        if (!unvalidatedBucketName || !disruptionsJsonBucketName || !disruptionsCsvBucketName) {
            throw new Error("Bucket names not set");
        }

        const responseMessageIdentifier = randomUUID();
        const currentTime = new Date();

        await generateSiriSxAndUploadToS3(
            s3Client,
            disruptionsTableName,
            orgTableName,
            unvalidatedBucketName,
            disruptionsJsonBucketName,
            disruptionsCsvBucketName,
            responseMessageIdentifier,
            currentTime.toISOString(),
            CANCELLATION_FEATURE_FLAG,
        );

        logger.info("Unvalidated SIRI-SX XML and Disruptions JSON/CSV created and published to S3");
    } catch (e) {
        if (e instanceof Error) {
            logger.error(e);

            throw e;
        }

        throw e;
    }
};
