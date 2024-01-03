import { getDisruptionById } from "@create-disruptions-data/shared-ts/utils/dynamo";
import { APIGatewayEvent } from "aws-lambda";
import * as logger from "lambda-log";
import { randomUUID } from "crypto";

const getOrganisationDisruptionById = async (orgId: string, disruptionId: string) => {
    try {
        const disruptionsTableName = process.env.DISRUPTIONS_TABLE_NAME as string;

        const disruption = getDisruptionById(orgId, disruptionId, disruptionsTableName, logger);

        return disruption;
    } catch (e) {
        if (e instanceof Error) {
            logger.error(
                `Error occurred while getting disruption information for organisation: ${orgId}, disruption id: ${disruptionId} - error: `,
                e,
            );
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

        const orgId = event?.pathParameters?.id;
        const disruptionId = event?.pathParameters?.disruptionId;

        if (!orgId) {
            throw new Error("An organisation ID must be provided");
        }

        if (!disruptionId) {
            throw new Error("A disruption ID must be provided");
        }

        logger.info(`Retrieving disruptions data for orgId: (${orgId}) ...`);

        const disruptionData = await getOrganisationDisruptionById(orgId, disruptionId);

        logger.info(`Successfully retrieved organisation: ${orgId}'s stops from DynamoDB...`);

        return {
            statusCode: 200,
            body: JSON.stringify(disruptionData),
        };
    } catch (e) {
        if (e instanceof Error) {
            logger.error(e);
        }

        throw e;
    }
};
