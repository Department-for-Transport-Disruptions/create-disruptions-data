import { getOrganisationInfoAndStats } from "@create-disruptions-data/shared-ts/utils/dynamo";
import { APIGatewayEvent } from "aws-lambda";
import * as logger from "lambda-log";
import { randomUUID } from "crypto";

const getOrganisation = async (orgId: string) => {
    try {
        const org = await getOrganisationInfoAndStats(orgId);
        if (!org) {
            throw new Error(`No valid organisation found for ID: ${orgId}`);
        }
        return org;
    } catch (e) {
        if (e instanceof Error) {
            logger.error(e);

            throw e;
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
        logger.info("Starting get organisation retriever...");

        const { ORGANISATIONS_TABLE_NAME: orgTableName } = process.env;

        if (!orgTableName) {
            throw new Error("Dynamo table names not set");
        }

        const orgId = event?.pathParameters?.id;

        if (!orgId) {
            throw new Error("An organisation ID must be provided");
        }

        const organisation = await getOrganisation(orgId);

        logger.info(`Successfully retrieved organisation ${orgId} DynamoDB...`);

        return {
            statusCode: 200,
            body: JSON.stringify(organisation),
        };
    } catch (e) {
        if (e instanceof Error) {
            logger.error(e);

            throw e;
        }

        throw e;
    }
};
