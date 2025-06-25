import { promises as fs } from "node:fs";
import * as path from "node:path";
import { getDbClient } from "@create-disruptions-data/shared-ts/utils/db";
import { Handler } from "aws-lambda";
import { FileMigrationProvider, Migrator } from "kysely";
import * as logger from "lambda-log";

export const main: Handler = async () => {
    const { ROLLBACK: rollback } = process.env;

    const isRollback = rollback === "true";

    const db = await getDbClient();

    const migrator = new Migrator({
        db,
        provider: new FileMigrationProvider({
            fs,
            path,
            migrationFolder: path.join(__dirname, "./migrations"),
        }),
    });

    const { error, results } = isRollback ? await migrator.migrateDown() : await migrator.migrateToLatest();

    if (results) {
        if (results.length === 0) {
            logger.info("Nothing to do");
        }

        for (const result of results) {
            if (result.status === "Success") {
                logger.info(
                    `${isRollback ? "Rollback of" : "migration "} ${result.migrationName}" was executed successfully`,
                );
            } else if (result.status === "Error") {
                logger.error(
                    `Failed to execute ${isRollback ? "rollback of" : "migration"}  " ${result.migrationName}"`,
                );
            }
        }
    }

    await db.destroy();

    if (error instanceof Error) {
        logger.error(error);
        process.exit(1);
    }

    await db.destroy();
};
