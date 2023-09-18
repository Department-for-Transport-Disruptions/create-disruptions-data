import { getAllOrganisationsInfo } from "@create-disruptions-data/shared-ts/utils/dynamo";
import * as logger from "lambda-log";
import { randomUUID } from "crypto";

const getOrganisations = async () => {
    try {
        const orgList = await getAllOrganisationsInfo();
        logger.info(JSON.stringify(orgList));
        return orgList || [];
    } catch (e) {
        if (e instanceof Error) {
            logger.error(e);

            throw e;
        }

        throw e;
    }
};

export const main = async (): Promise<{ statusCode: number; body: string }> => {
    try {
        logger.options.dev = process.env.NODE_ENV !== "production";
        logger.options.debug = process.env.ENABLE_DEBUG_LOGS === "true" || process.env.NODE_ENV !== "production";

        logger.options.meta = {
            id: randomUUID(),
        };
        logger.info("Starting get organisations retriever...");

        const { ORGANISATIONS_TABLE_NAME: orgTableName } = process.env;

        if (!orgTableName) {
            throw new Error("Dynamo table names not set");
        }

        const organisations = await getOrganisations();

        logger.info("Successfully retrieved organisations DynamoDB...");

        return {
            statusCode: 200,
            body: JSON.stringify(organisations),
        };
    } catch (e) {
        if (e instanceof Error) {
            logger.error(e);

            throw e;
        }

        throw e;
    }
};
