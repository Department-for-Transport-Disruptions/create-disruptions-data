import { Kysely, sql } from "kysely";

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
    if (process.env.STAGE !== "local") {
        await sql`CREATE EXTENSION IF NOT EXISTS postgis CASCADE`.execute(db);
    }
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
    if (process.env.STAGE !== "local") {
        await sql`DROP EXTENSION IF EXISTS postgis CASCADE`.execute(db);
    }
}
