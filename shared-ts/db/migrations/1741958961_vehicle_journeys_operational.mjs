import { Kysely } from "kysely";

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
    await db.schema.alterTable("vehicle_journeys").addColumn("operational_for_today", "boolean").execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
    await db.schema.alterTable("vehicle_journeys").dropColumn("operational_for_today").execute();
}
