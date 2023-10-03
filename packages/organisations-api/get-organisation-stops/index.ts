import { getImpactedStopsInOrganisation } from "@create-disruptions-data/shared-ts/utils/dynamo";
import { APIGatewayEvent } from "aws-lambda";
import * as logger from "lambda-log";
import { randomUUID } from "crypto";

const getOrganisationStops = async (orgId: string) => {
    try {
        const orgList = await getImpactedStopsInOrganisation(orgId, logger);
        return orgList || [];
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
        logger.info("Starting get organisation stops data...");

        const { ORGANISATIONS_TABLE_NAME: orgTableName } = process.env;

        if (!orgTableName) {
            throw new Error("Dynamo table names not set");
        }

        const orgId = event?.pathParameters?.id;

        if (!orgId) {
            throw new Error("An organisation ID must be provided");
        }

        const stops = await getOrganisationStops(orgId);

        logger.info("Successfully retrieved organisations DynamoDB...");

        return {
            statusCode: 200,
            body: JSON.stringify(stops),
        };
    } catch (e) {
        if (e instanceof Error) {
            logger.error(e);

            throw e;
        }

        throw e;
    }
};
