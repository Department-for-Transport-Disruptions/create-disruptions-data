import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Disruption } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { ptSituationElementSchema, siriSchema } from "@create-disruptions-data/shared-ts/siriTypes.zod";
import { getDate, getDatetimeFromDateAndTime } from "@create-disruptions-data/shared-ts/utils/dates";
import { Dayjs } from "dayjs";
import { parse } from "js2xmlparser";
import * as logger from "lambda-log";
import xmlFormat from "xml-formatter";
import { randomUUID } from "crypto";
import { getOrganisationInfoById, getPublishedDisruptionsDataFromDynamo } from "./dynamo";
import { getDdbDocumentClient, getS3Client, uploadToS3 } from "./util/awsClient";
import { getPtSituationElementFromSiteDisruption } from "./util/siri";

const s3Client = getS3Client();
const ddbDocClient = getDdbDocumentClient();

const notEmpty = <T>(value: T | null | undefined): value is T => {
    return value !== null && value !== undefined;
};

export const includeDisruption = (disruption: Disruption, currentDatetime: Dayjs) => {
    if (disruption.publishStatus !== PublishStatus.published) {
        return false;
    }

    if (disruption.publishEndDate && disruption.publishEndTime) {
        const endDatetime = getDatetimeFromDateAndTime(disruption.publishEndDate, disruption.publishEndTime);

        if (currentDatetime.isAfter(endDatetime)) {
            return false;
        }
    }

    return true;
};

export const generateSiriSxAndUploadToS3 = async (
    s3Client: S3Client,
    ddbDocClient: DynamoDBDocumentClient,
    disruptionsTableName: string,
    orgTableName: string,
    bucketName: string,
    responseMessageIdentifier: string,
    currentTime: string,
) => {
    logger.info(`Scanning DynamoDB table...`);

    try {
        const disruptions = await getPublishedDisruptionsDataFromDynamo(disruptionsTableName);

        const orgIds = disruptions
            .map((disruption) => disruption.orgId)
            .filter(notEmpty)
            .filter((value, index, array) => array.indexOf(value) === index);

        const orgInfo = (await Promise.all(orgIds.map(async (id) => getOrganisationInfoById(orgTableName, id)))).filter(
            notEmpty,
        );

        const date = getDate();

        const ptSituationElements = disruptions
            .map((disruption) => {
                if (!disruption.orgId) {
                    return null;
                }

                const orgName = orgInfo
                    .find((org) => org.id === disruption.orgId)
                    ?.name.replace(/[^-._:A-Za-z0-9]/g, "");

                if (!orgName || !includeDisruption(disruption, date)) {
                    return null;
                }

                return getPtSituationElementFromSiteDisruption(disruption, orgName);
            })
            .filter(notEmpty);

        const cleanData =
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
                        PtSituationElement: cleanData,
                    },
                },
            },
        };

        logger.info(`Verifying JSON against schema...`);
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

        const xmlData = parse("Siri", completeObject, {
            declaration: {
                version: "1.0",
                encoding: "UTF-8",
                standalone: "yes",
            },
            useSelfClosingTagIfEmpty: true,
        });

        await uploadToS3(
            s3Client,
            xmlFormat(xmlData, {
                collapseContent: true,
            }),
            `${new Date(currentTime).valueOf()}-unvalidated-siri.xml`,
            bucketName,
            "application/xml",
        );
    } catch (e) {
        throw e;
    }
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
        } = process.env;

        if (!disruptionsTableName || !orgTableName) {
            throw new Error("Dynamo table names not set");
        }

        if (!unvalidatedBucketName) {
            throw new Error("SIRI_SX_UNVALIDATED_BUCKET_NAME not set");
        }

        const responseMessageIdentifier = randomUUID();
        const currentTime = new Date();

        await generateSiriSxAndUploadToS3(
            s3Client,
            ddbDocClient,
            disruptionsTableName,
            orgTableName,
            unvalidatedBucketName,
            responseMessageIdentifier,
            currentTime.toISOString(),
        );

        logger.info("Unvalidated SIRI-SX XML created and published to S3");
    } catch (e) {
        if (e instanceof Error) {
            logger.error(e);

            throw e;
        }

        throw e;
    }
};
