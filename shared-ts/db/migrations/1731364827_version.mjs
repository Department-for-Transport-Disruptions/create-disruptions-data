import { Kysely } from "kysely";

/**
 *
 * @param {Kysely} db
 */
export async function up(db) {
    await db.schema.alterTable("disruptions").addColumn("version", "integer").execute();
    await db.schema.alterTable("disruptions_edited").addColumn("version", "integer").execute();
}

/**
 *
 * @param {Kysely} db
 */
export async function down(db) {
    await db.schema.alterTable("disruptions").dropColumn("version").execute();
    await db.schema.alterTable("disruptions_edited").dropColumn("version").execute();
}
