import { getDbClient } from "@create-disruptions-data/shared-ts/utils/db";
import { Handler } from "aws-lambda";
import { sql } from "kysely";
import * as logger from "lambda-log";
import { Config } from "sst/node/config";

export const main: Handler = async () => {
    const db = await getDbClient(false, false, "disruptions");

    try {
        const dbName = Config.DB_NAME;

        const nonAlphanumericPattern = /[^a-zA-Z0-9]/;

        if (nonAlphanumericPattern.test(dbName)) {
            throw new Error("Invalid DB Name");
        }

        try {
            await sql`CREATE DATABASE ${sql.table(Config.DB_NAME)}`.execute(db);
        } catch {}
    } catch (e) {
        logger.error("Error creating Database");
        throw e;
    } finally {
        await db.destroy();
    }
};
