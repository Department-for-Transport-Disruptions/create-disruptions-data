import { randomUUID } from "crypto";
import { getObject } from "@create-disruptions-data/shared-ts/utils/s3";
import { APIGatewayEvent } from "aws-lambda";
import * as logger from "lambda-log";

const getOrganisationDisruptions = async (orgId: string, bucketName: string) => {
    try {
        const disruptions = await getObject(bucketName, `${orgId}/map-disruptions.json`, logger);

        if (!disruptions) {
            return [];
        }

        return JSON.parse(disruptions) as object;
    } catch (e) {
        if (e instanceof Error) {
            logger.error(`Error occurred while retrieving map disruptions file for org: ${orgId} - error: `, e);
        }

        throw e;
    }
};

export const main = async (event: APIGatewayEvent): Promise<{ statusCode: number; body: string }> => {
    try {
        logger.options.dev = process.env.NODE_ENV !== "production";
        logger.options.debug = process.env.ENABLE_DEBUG_LOGS === "true" || process.env.NODE_ENV !== "production";

        logger.options.meta = {
            id: randomUUID(),
        };

        const orgDisruptionsBucketName = process.env.ORG_DISRUPTIONS_BUCKET_NAME;

        if (!orgDisruptionsBucketName) {
            logger.error("ORG_DISRUPTIONS_BUCKET_NAME must be set");

            throw new Error("ORG_DISRUPTIONS_BUCKET_NAME must be set");
        }

        const orgId = event?.pathParameters?.id;

        if (!orgId) {
            throw new Error("An organisation ID must be provided");
        }

        logger.info(`Retrieving disruptions data for orgId: (${orgId}) ...`);

        const disruptionsData = await getOrganisationDisruptions(orgId, orgDisruptionsBucketName);

        logger.info(`Successfully retrieved organisation: ${orgId}'s stops from DynamoDB...`);

        return {
            statusCode: 200,
            body: JSON.stringify(disruptionsData),
        };
    } catch (e) {
        if (e instanceof Error) {
            logger.error(e);
        }

        throw e;
    }
};
