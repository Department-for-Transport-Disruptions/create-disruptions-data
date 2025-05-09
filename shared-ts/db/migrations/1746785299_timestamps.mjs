import { Kysely } from "kysely";

/**
 *
 * @param {Kysely} db
 */
export async function up(db) {
    await db.schema
        .alterTable("disruptions")
        .alterColumn("validity_start_timestamp", (col) => col.setDataType("timestamptz"))
        .alterColumn("validity_end_timestamp", (col) => col.setDataType("timestamptz"))
        .alterColumn("publish_start_timestamp", (col) => col.setDataType("timestamptz"))
        .alterColumn("publish_end_timestamp", (col) => col.setDataType("timestamptz"))
        .execute();

    await db.schema
        .alterTable("disruptions_edited")
        .alterColumn("validity_start_timestamp", (col) => col.setDataType("timestamptz"))
        .alterColumn("validity_end_timestamp", (col) => col.setDataType("timestamptz"))
        .alterColumn("publish_start_timestamp", (col) => col.setDataType("timestamptz"))
        .alterColumn("publish_end_timestamp", (col) => col.setDataType("timestamptz"))
        .execute();
}

/**
 *
 * @param {Kysely} db
 */
export async function down(db) {
    await db.schema
        .alterTable("disruptions")
        .alterColumn("validity_start_timestamp", (col) => col.setDataType("timestamp"))
        .alterColumn("validity_end_timestamp", (col) => col.setDataType("timestamp"))
        .alterColumn("publish_start_timestamp", (col) => col.setDataType("timestamp"))
        .alterColumn("publish_end_timestamp", (col) => col.setDataType("timestamp"))
        .execute();

    await db.schema
        .alterTable("disruptions_edited")
        .alterColumn("validity_start_timestamp", (col) => col.setDataType("timestamp"))
        .alterColumn("validity_end_timestamp", (col) => col.setDataType("timestamp"))
        .alterColumn("publish_start_timestamp", (col) => col.setDataType("timestamp"))
        .alterColumn("publish_end_timestamp", (col) => col.setDataType("timestamp"))
        .execute();
}
