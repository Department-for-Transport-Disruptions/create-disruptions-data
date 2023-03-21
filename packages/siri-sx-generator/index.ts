import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ptSituationElementSchema, siriSchema } from "@create-disruptions-data/shared-ts/siriTypes.zod";
import { DynamoDBStreamEvent } from "aws-lambda";
import { parse } from "js2xmlparser";
import * as logger from "lambda-log";
import xmlFormat from "xml-formatter";
import { randomUUID } from "crypto";
import { getDdbDocumentClient, getS3Client, uploadToS3 } from "./util/awsClient";

const s3Client = getS3Client();
const ddbDocClient = getDdbDocumentClient();

const notEmpty = <T>(value: T | null | undefined): value is T => {
    return value !== null && value !== undefined;
};

export const generateSiriSxAndUploadToS3 = async (
    s3Client: S3Client,
    ddbDocClient: DynamoDBDocumentClient,
    tableName: string,
    bucketName: string,
    responseMessageIdentifier: string,
    currentTime: string,
) => {
    logger.info(`Scanning DynamoDB table...`);

    try {
        const dbScanData = await ddbDocClient.send(
            new ScanCommand({
                TableName: tableName,
            }),
        );

        const cleanData =
            dbScanData.Items?.map((item) => {
                const parseResult = ptSituationElementSchema.safeParse(item);

                if (!parseResult.success) {
                    const disruptionId = item?.SituationNumber as string;
                    logger.error(`Parse failed for disruption ID: ${disruptionId || "unavailable"}`);
                    logger.error(parseResult.error);
                    return null;
                }

                return parseResult.data;
            }).filter(notEmpty) ?? [];

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
        );
    } catch (e) {
        throw e;
    }
};

export const main = async (event: DynamoDBStreamEvent): Promise<void> => {
    try {
        logger.options.dev = process.env.NODE_ENV !== "production";
        logger.options.debug = process.env.ENABLE_DEBUG_LOGS === "true" || process.env.NODE_ENV !== "production";

        logger.options.meta = {
            id: randomUUID(),
        };

        const { TABLE_NAME: tableName, SIRI_SX_UNVALIDATED_BUCKET_NAME: unvalidatedBucketName } = process.env;

        if (!tableName) {
            throw new Error("TABLE_NAME not set");
        }

        if (!unvalidatedBucketName) {
            throw new Error("SIRI_SX_UNVALIDATED_BUCKET_NAME not set");
        }
        logger.info(`SIRI-SX generation triggered by event ID: ${event.Records[0].eventID || ""}`);

        const responseMessageIdentifier = randomUUID();
        const currentTime = new Date();

        await generateSiriSxAndUploadToS3(
            s3Client,
            ddbDocClient,
            tableName,
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
