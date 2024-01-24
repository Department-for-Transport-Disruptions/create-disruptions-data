import * as logger from "lambda-log";
import { randomUUID } from "crypto";
import { getRecentlyCancelledRoadworks } from "@create-disruptions-data/shared-ts/utils/refDataApi";

export const main = async (): Promise<void> => {
    try {
        logger.options.dev = process.env.NODE_ENV !== "production";
        logger.options.debug = process.env.ENABLE_DEBUG_LOGS === "true" || process.env.NODE_ENV !== "production";

        logger.options.meta = {
            id: randomUUID(),
        };

        logger.info("Checking for cancelled roadworks...");

        const { DISRUPTIONS_TABLE_NAME: disruptionsTableName, ORGANISATIONS_TABLE_NAME: orgTableName } = process.env;

        if (!disruptionsTableName || !orgTableName) {
            throw new Error("Dynamo table names not set");
        }

        const recentlyCancelledRoadworks = await getRecentlyCancelledRoadworks();

        if (!recentlyCancelledRoadworks || recentlyCancelledRoadworks.length === 0) {
            logger.info("No cancelled roadworks in the last 5 minutes...");
            return;
        }

        const cancelledRoadworkIds = recentlyCancelledRoadworks.map((roadwork) => roadwork.permitReferenceNumber);

        console.log(cancelledRoadworkIds);
    } catch (e) {
        if (e instanceof Error) {
            logger.error(e);

            throw e;
        }

        throw e;
    }
};
