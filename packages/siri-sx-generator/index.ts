/* eslint-disable @typescript-eslint/no-unused-vars */
import { S3Client } from "@aws-sdk/client-s3";
import {
    Consequence,
    Disruption,
    OperatorConsequence,
    ServicesConsequence,
    StopsConsequence,
    Validity,
} from "@create-disruptions-data/shared-ts/disruptionTypes";
import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { ptSituationElementSchema, siriSchema } from "@create-disruptions-data/shared-ts/siriTypes.zod";
import {
    getSortedDisruptionFinalEndDate,
    notEmpty,
    sortDisruptionsByStartDate,
} from "@create-disruptions-data/shared-ts/utils";
import { getDate, getDatetimeFromDateAndTime } from "@create-disruptions-data/shared-ts/utils/dates";
import { getPublishedDisruptionsDataFromDynamo } from "@create-disruptions-data/shared-ts/utils/dynamo";
import { Dayjs } from "dayjs";
import { parse } from "js2xmlparser";
import { json2csv } from "json-2-csv";
import * as logger from "lambda-log";
import { Config } from "sst/node/config";
import xmlFormat from "xml-formatter";
import { randomUUID } from "crypto";
import { getOrganisationInfoById } from "./dynamo";
import { getS3Client, uploadToS3 } from "./util/awsClient";
import { getPtSituationElementFromSiteDisruption } from "./util/siri";

const s3Client = getS3Client();

const cleanValidityPeriods = (validityPeriods: Validity[]) =>
    validityPeriods.map(({ disruptionNoEndDateTime, ...validity }) => ({
        ...validity,
        disruptionRepeats: validity.disruptionRepeats !== "doesntRepeat" ? validity.disruptionRepeats : undefined,
        disruptionRepeatsEndDate: validity.disruptionRepeatsEndDate || undefined,
    }));

const cleanDisruptionsData = (disruptions: (Disruption & { organisation: { id: string; name: string } })[]) =>
    sortDisruptionsByStartDate(disruptions).map(
        ({
            template,
            orgId,
            publishStatus,
            consequences,
            validity,
            disruptionStartDate,
            disruptionStartTime,
            disruptionEndDate,
            disruptionRepeats,
            disruptionRepeatsEndDate,
            disruptionEndTime,
            disruptionNoEndDateTime,
            ...disruption
        }) => ({
            ...disruption,
            associatedLink: disruption.associatedLink || undefined,
            validity: cleanValidityPeriods([...(validity ?? [])]),
            consequences:
                consequences?.map(({ disruptionId, consequenceIndex, ...consequence }) => ({
                    ...consequence,
                    disruptionDelay: consequence.disruptionDelay || undefined,
                })) ?? [],
        }),
    );

export type CleanedDisruption = Awaited<ReturnType<typeof cleanDisruptionsData>>[0];
export type CleanedConsequence = CleanedDisruption["consequences"][0];

const isOperatorConsequence = (c: unknown): c is OperatorConsequence =>
    (c as Consequence).consequenceType === "operatorWide";

const isServicesConsequence = (c: unknown): c is ServicesConsequence =>
    (c as Consequence).consequenceType === "services";

const isStopsConsequence = (c: unknown): c is StopsConsequence => (c as Consequence).consequenceType === "stops";

export const getAffectedModesList = (consequences: CleanedConsequence[]) =>
    consequences
        .map((c) => c.vehicleMode)
        .filter((item, index, array) => array.indexOf(item) === index)
        .join(";");

export const getAffectedOperatorsList = (consequences: CleanedConsequence[]) =>
    consequences
        .flatMap((c) => {
            if (isOperatorConsequence(c)) {
                return c.consequenceOperators.flatMap((co) => co.operatorNoc);
            }

            return null;
        })
        .filter((item, index, array) => notEmpty(item) && array.indexOf(item) === index)
        .join(";");

export const getAffectedServicesCount = (consequences: CleanedConsequence[]) =>
    consequences
        .flatMap((c) => {
            if (isServicesConsequence(c)) {
                return c.services;
            }

            return null;
        })
        .filter(
            (service, index, array) =>
                notEmpty(service) && array.findIndex((item) => item?.id === service.id) === index,
        ).length || "";

export const getAffectedStopsCount = (consequences: CleanedConsequence[]) =>
    consequences
        .flatMap((c) => {
            if (isServicesConsequence(c) || isStopsConsequence(c)) {
                return c.stops;
            }

            return null;
        })
        .filter(
            (stop, index, array) =>
                notEmpty(stop) && array.findIndex((item) => item?.atcoCode === stop.atcoCode) === index,
        ).length || "";

const convertToCsv = async (disruptions: CleanedDisruption[]) => {
    const csvDisruptions = disruptions.map((disruption) => {
        return {
            ...disruption,
            validityStart: getDatetimeFromDateAndTime(
                disruption.validity[0].disruptionStartDate,
                disruption.validity[0].disruptionStartTime,
            ).toISOString(),
            validityEnd: getSortedDisruptionFinalEndDate(disruption)?.toISOString() ?? "",
            publicationStart: getDatetimeFromDateAndTime(
                disruption.publishStartDate,
                disruption.publishStartTime,
            ).toISOString(),
            publicationEnd:
                disruption.publishEndDate && disruption.publishEndTime
                    ? getDatetimeFromDateAndTime(disruption.publishEndDate, disruption.publishEndTime).toISOString()
                    : "",
            planned: disruption.disruptionType === "planned" ? "true" : "false",
            modesAffected: getAffectedModesList(disruption.consequences),
            operatorsAffected: getAffectedOperatorsList(disruption.consequences),
            servicesAffected: getAffectedServicesCount(disruption.consequences),
            stopsAffected: getAffectedStopsCount(disruption.consequences),
        };
    });

    return json2csv(csvDisruptions, {
        keys: [
            {
                field: "organisation.name",
                title: "Organisation",
            },
            {
                field: "disruptionId",
                title: "ID",
            },
            {
                field: "validityStart",
                title: "Validity start",
            },
            {
                field: "validityEnd",
                title: "Validity end",
            },
            {
                field: "publicationStart",
                title: "Publication start",
            },
            {
                field: "publicationEnd",
                title: "Publication end",
            },
            {
                field: "disruptionReason",
                title: "Reason",
            },
            {
                field: "planned",
                title: "Planned",
            },
            {
                field: "modesAffected",
                title: "Modes affected",
            },
            {
                field: "operatorsAffected",
                title: "Operators affected",
            },
            {
                field: "servicesAffected",
                title: "Services affected",
            },
            {
                field: "stopsAffected",
                title: "Stops affected",
            },
        ],
    });
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
    disruptionsTableName: string,
    orgTableName: string,
    unvalidatedSiriBucketName: string,
    disruptionsJsonBucketName: string,
    disruptionsCsvBucketName: string,
    responseMessageIdentifier: string,
    currentTime: string,
) => {
    logger.info(`Scanning DynamoDB table...`);

    try {
        const disruptions = await getPublishedDisruptionsDataFromDynamo(disruptionsTableName, logger);

        const orgIds = disruptions
            .map((disruption) => disruption.orgId)
            .filter(notEmpty)
            .filter((value, index, array) => array.indexOf(value) === index);

        const orgInfo = (await Promise.all(orgIds.map(async (id) => getOrganisationInfoById(orgTableName, id)))).filter(
            notEmpty,
        );

        const date = getDate();

        const disruptionsWithOrgInfo = disruptions
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

        const ptSituationElements = disruptionsWithOrgInfo.map((disruption) =>
            getPtSituationElementFromSiteDisruption(disruption),
        );

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
            unvalidatedSiriBucketName,
            "application/xml",
        );

        const cleanedDisruptions = cleanDisruptionsData(disruptionsWithOrgInfo);

        await uploadToS3(
            s3Client,
            JSON.stringify(cleanedDisruptions),
            "disruptions.json",
            disruptionsJsonBucketName,
            "application/json",
        );

        const csv = await convertToCsv(cleanedDisruptions);

        await uploadToS3(s3Client, csv, "disruptions.csv", disruptionsCsvBucketName, "text/csv");
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
            DISRUPTIONS_JSON_BUCKET_NAME: disruptionsJsonBucketName,
            DISRUPTIONS_CSV_BUCKET_NAME: disruptionsCsvBucketName,
        } = Config;

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
            disruptionsTableName,
            orgTableName,
            unvalidatedBucketName,
            disruptionsJsonBucketName,
            disruptionsCsvBucketName,
            responseMessageIdentifier,
            currentTime.toISOString(),
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
