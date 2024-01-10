import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { notEmpty } from "@create-disruptions-data/shared-ts/utils";
import { getAllDisruptionsForOrg } from "@create-disruptions-data/shared-ts/utils/dynamo";
import { DynamoDBStreamEvent } from "aws-lambda";
import * as logger from "lambda-log";
import { randomUUID } from "crypto";

const s3Client = new S3Client({ region: "eu-west-2" });

const generateDisruptionsAndWriteToS3 = async (orgId: string, tableName: string, disruptionsBucketName: string) => {
    const disruptions = await getAllDisruptionsForOrg(orgId, tableName, logger);

    await s3Client.send(
        new PutObjectCommand({
            Bucket: disruptionsBucketName,
            Key: `${orgId}/disruptions.json`,
            ContentType: "application/json",
            Body: JSON.stringify(disruptions),
        }),
    );
};

export const main = async (event: DynamoDBStreamEvent) => {
    try {
        logger.options.dev = process.env.NODE_ENV !== "production";
        logger.options.debug = process.env.ENABLE_DEBUG_LOGS === "true" || process.env.NODE_ENV !== "production";

        logger.options.meta = {
            id: randomUUID(),
        };

        const { DISRUPTIONS_TABLE_NAME: disruptionsTableName, ORG_DISRUPTIONS_BUCKET_NAME: orgDisruptionsBucketName } =
            process.env;

        if (!disruptionsTableName || !orgDisruptionsBucketName) {
            throw new Error("Dynamo table names not set");
        }

        logger.info("Starting Org Disruptions Generator...");

        const orgIds = [...new Set(event.Records.map((record) => record.dynamodb?.Keys?.PK?.S).filter(notEmpty))];

        await Promise.all(
            orgIds.map((id) => generateDisruptionsAndWriteToS3(id, disruptionsTableName, orgDisruptionsBucketName)),
        );
    } catch (e) {
        if (e instanceof Error) {
            logger.error(e);

            throw e;
        }

        throw e;
    }
};
