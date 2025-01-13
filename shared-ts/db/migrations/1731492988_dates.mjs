import { Kysely } from "kysely";

/**
 *
 * @param {Kysely} db
 */
export async function up(db) {
    await db.schema.alterTable("disruptions").addColumn("validity_start_timestamp", "timestamp").execute();
    await db.schema.alterTable("disruptions").addColumn("validity_end_timestamp", "timestamp").execute();
    await db.schema.alterTable("disruptions").addColumn("publish_start_timestamp", "timestamp").execute();
    await db.schema.alterTable("disruptions").addColumn("publish_end_timestamp", "timestamp").execute();

    await db.schema.alterTable("disruptions_edited").addColumn("validity_start_timestamp", "timestamp").execute();
    await db.schema.alterTable("disruptions_edited").addColumn("validity_end_timestamp", "timestamp").execute();
    await db.schema.alterTable("disruptions_edited").addColumn("publish_start_timestamp", "timestamp").execute();
    await db.schema.alterTable("disruptions_edited").addColumn("publish_end_timestamp", "timestamp").execute();

    await db.schema
        .createIndex("idx_disruptions_validity_start_timestamp")
        .on("disruptions")
        .column("validity_start_timestamp")
        .execute();

    await db.schema
        .createIndex("idx_disruptions_validity_end_timestamp")
        .on("disruptions")
        .column("validity_end_timestamp")
        .execute();

    await db.schema
        .createIndex("idx_disruptions_publish_start_timestamp")
        .on("disruptions")
        .column("publish_start_timestamp")
        .execute();

    await db.schema
        .createIndex("idx_disruptions_publish_end_timestamp")
        .on("disruptions")
        .column("publish_end_timestamp")
        .execute();
}

/**
 *
 * @param {Kysely} db
 */
export async function down(db) {
    await db.schema.alterTable("disruptions").dropColumn("validity_start_timestamp").execute();
    await db.schema.alterTable("disruptions").dropColumn("validity_end_timestamp").execute();
    await db.schema.alterTable("disruptions").dropColumn("publish_start_timestamp").execute();
    await db.schema.alterTable("disruptions").dropColumn("publish_end_timestamp").execute();
}
