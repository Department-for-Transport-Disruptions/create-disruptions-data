import { getCurrentAndFutureDisruptions } from "@create-disruptions-data/shared-ts/utils/dynamo";
import * as logger from "lambda-log";
import { randomUUID } from "crypto";

export const main = async (): Promise<{ statusCode: number; body: string }> => {
    try {
        logger.options.dev = process.env.NODE_ENV !== "production";
        logger.options.debug = process.env.ENABLE_DEBUG_LOGS === "true" || process.env.NODE_ENV !== "production";

        logger.options.meta = {
            id: randomUUID(),
        };
        logger.info("Starting get disruptions retriever...");

        const { DISRUPTIONS_TABLE_NAME: disruptionsTableName } = process.env;

        if (!disruptionsTableName) {
            throw new Error("Dynamo table names not set");
        }

        const disruptions = await getCurrentAndFutureDisruptions(disruptionsTableName, logger);

        logger.info(`Successfully retrieved disruptions from DynamoDB...`);

        return {
            statusCode: 200,
            body: JSON.stringify(disruptions),
        };
    } catch (e) {
        if (e instanceof Error) {
            logger.error(e);

            throw e;
        }

        throw e;
    }
};
