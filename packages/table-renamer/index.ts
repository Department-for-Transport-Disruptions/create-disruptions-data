import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { Kysely, sql } from "kysely";
import * as logger from "lambda-log";

import { Database } from "@create-disruptions-data/shared-ts/db/types";
import { getDbClient } from "@create-disruptions-data/shared-ts/utils/db";
import { disableTableRenamerParamName } from "@create-disruptions-data/shared-ts/utils/ssm";

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
                logger.error(`Failed to get parameter from ssm: ${error.stack || ""}`);
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
            const error = new Error(
                "The SSM Parameter used to check for errors in the scheduled job has returned TRUE indicating an issue",
            );
            logger.error(error);
            throw error;
        }
        logger.info("Table Renamer run successfully completed");
    } catch (e) {
        if (e instanceof Error) {
            logger.error(e, "Error running the Table Renamer");
        }

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "There was a problem with the table renamer",
            }),
        };
    }
};

export const checkReferenceDataImportHasCompleted = async (tableName: string, db: Kysely<Database>): Promise<void> => {
    logger.info(`Check if reference data import has completed for table ${tableName}`);

    const [{ exists: newTableExists }] = await db
        .selectFrom("pg_tables" as keyof Database)
        .where(sql.ref("tablename"), "=", `${tableName}_new`)
        .select(sql<boolean>`EXISTS(SELECT 1)`.as("exists"))
        .execute();

    const newCount = { count: 0 };
    if (newTableExists) {
        const result = await db
            .selectFrom(`${tableName}_new` as keyof Database)
            .select(db.fn.count("id").as("count"))
            .execute();
        newCount.count = Number(result[0]?.count ?? 0);
    }

    if (newCount.count === 0) {
        throw new Error(`Reference data import has failed with zero rows in ${tableName}New`);
    }

    const [{ exists: tableExists }] = await db
        .selectFrom("pg_tables" as keyof Database)
        .where(sql.ref("tablename"), "=", tableName)
        .select(sql<boolean>`EXISTS(SELECT 1)`.as("exists"))
        .execute();

    const currentCount = { count: 0 };
    if (tableExists) {
        const result = await db
            .selectFrom(tableName as keyof Database)
            .select(db.fn.count("id").as("count"))
            .execute();
        currentCount.count = Number(result[0]?.count ?? 0);
    }

    if (currentCount.count === 0) {
        throw new Error(`Reference data import has failed: ${tableName} (original table) contains zero rows.`);
    }

    const percentageResult = (newCount.count / currentCount.count) * 100;

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
    await db.transaction().execute(async (_trx) => {
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
