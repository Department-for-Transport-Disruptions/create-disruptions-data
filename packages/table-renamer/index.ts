import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { Kysely, sql } from "kysely";
import * as logger from "lambda-log";

import { Database, Tables } from "@create-disruptions-data/shared-ts/db/types";
import { getDbClient } from "@create-disruptions-data/shared-ts/utils/db";
import {
    disableTableRenamerParamName,
    putTableRenamerDisableParameter,
} from "@create-disruptions-data/shared-ts/utils/ssm";

const ssm = new SSMClient({ region: "eu-west-2" });

export const main = async () => {
    const { STAGE: stage } = process.env;
    try {
        logger.info("Table Renamer starting... ");

        const dbClient = getDbClient();

        let disableRenamer: string | undefined = "true";

        if (!stage) {
            throw new Error("Stage env not found");
        }

        try {
            const input = {
                Name: `${disableTableRenamerParamName}-${stage}`,
            };
            const command = new GetParameterCommand(input);
            const ssmOutput = await ssm.send(command);
            disableRenamer = ssmOutput.Parameter?.Value;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to get parameter from ssm: ${error.stack || ""}`);
            }

            throw error;
        }

        if (disableRenamer === "false") {
            await checkReferenceDataImportHasCompleted("operator_lines", dbClient);
            await checkReferenceDataImportHasCompleted("operator_public_data", dbClient);
            await checkReferenceDataImportHasCompleted("operators", dbClient);
            await checkReferenceDataImportHasCompleted("stops", dbClient);
            await checkReferenceDataImportHasCompleted("services", dbClient);
            await checkReferenceDataImportHasCompleted("localities", dbClient);
            await checkReferenceDataImportHasCompleted("nptg_admin_areas", dbClient);

            await deleteAndRenameTables(dbClient);
        } else {
            await putTableRenamerDisableParameter(stage, "false", logger);
            throw new Error(
                "The SSM Parameter used to check for errors in the scheduled job has returned TRUE indicating an issue",
            );
        }
    } catch (e) {
        if (stage) await putTableRenamerDisableParameter(stage, "false", logger);
        if (e instanceof Error) {
            logger.error(e);

            return {
                statusCode: 500,
                body: JSON.stringify({
                    error: "There was a problem with the table renamer",
                }),
            };
        }

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "There was a problem with the table renamer",
            }),
        };
    }
};

export const checkReferenceDataImportHasCompleted = async (tableName: Tables, db: Kysely<Database>): Promise<void> => {
    logger.info(`Check if reference data import has completed for table ${tableName}`);
    const [newCount] = await db.selectFrom(`${tableName}_new`).select(db.fn.count("id").as("count")).execute();

    if (newCount.count === 0) {
        throw new Error(`Reference data import has failed with zero rows in ${tableName}New`);
    }

    const [currentCount] = await db.selectFrom(tableName).select(db.fn.count("id").as("count")).execute();

    const percentageResult = (Number(newCount.count) / Number(currentCount.count)) * 100;

    if (percentageResult < 75) {
        throw new Error(
            `Reference data import has not completed, as only ${percentageResult}% of yesterday's data has been imported for table: ${tableName}`,
        );
    }
};

const tables = [
    "stops",
    "operator_lines",
    "operators",
    "operator_public_data",
    "services",
    "service_journey_patterns",
    "service_journey_pattern_links",
    "service_admin_area_codes",
    "localities",
    "vehicle_journeys",
    "tracks",
    "nptg_admin_areas",
];

export const deleteAndRenameTables = async (db: Kysely<Database>): Promise<void> => {
    await db.transaction().execute(async (trx) => {
        // Drop old tables
        for (const table of tables) {
          await db.schema.dropTable(`${table}_old`).ifExists().execute();
        }

        // Rename the current tables to _old
        for (const table of tables) {
          await db.schema.alterTable(table).renameTo(`${table}_old`).execute();
        }

        // Rename the _new tables to the original names
        for (const table of tables) {
            await db.schema.alterTable(`${table}_new`).renameTo(table).execute();
        }
    });
};