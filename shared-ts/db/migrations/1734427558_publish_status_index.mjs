import { Kysely } from "kysely";

/**
 *
 * @param {Kysely} db
 */
export async function up(db) {
    await db.schema.createIndex("idx_disruptions_publish_status").on("disruptions").column("publish_status").execute();

    await db.schema
        .createIndex("idx_disruptions_edited_publish_status")
        .on("disruptions_edited")
        .column("publish_status")
        .execute();
}

/**
 *
 * @param {Kysely} db
 */
export async function down(db) {
    await db.schema.dropIndex("idx_disruptions_publish_status").on("disruptions").execute();
    await db.schema.dropIndex("idx_disruptions_edited_publish_status").on("disruptions_edited").execute();
}
