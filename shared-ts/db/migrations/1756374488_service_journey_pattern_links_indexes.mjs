import { Kysely } from "kysely";

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
    await db.schema
        .createIndex("idx_service_journey_pattern_link_pattern_id")
        .on("service_journey_pattern_links")
        .column("journey_pattern_id")
        .execute();

    await db.schema
        .createIndex("idx_service_journey_pattern_link_from_atco_code")
        .on("service_journey_pattern_links")
        .column("from_atco_code")
        .execute();

    await db.schema
        .createIndex("idx_service_journey_pattern_link_to_atco_code")
        .on("service_journey_pattern_links")
        .column("to_atco_code")
        .execute();

    await db.schema
        .createIndex("idx_service_journey_pattern_link_from_to_sequence")
        .on("service_journey_pattern_links")
        .columns(["from_atco_code", "to_atco_code", "from_sequence_number"])
        .execute();

    await db.schema
        .createIndex("idx_service_journey_pattern_link_order_in_sequence_pattern_id")
        .on("service_journey_pattern_links")
        .columns(["order_in_sequence", "journey_pattern_id"])
        .execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
    await db.schema.dropIndex("idx_service_journey_pattern_link_pattern_id").execute();
    await db.schema.dropIndex("idx_service_journey_pattern_link_from_atco_code").execute();
    await db.schema.dropIndex("idx_service_journey_pattern_link_to_atco_code").execute();
    await db.schema.dropIndex("idx_service_journey_pattern_link_from_to_sequence").execute();
    await db.schema.dropIndex("idx_service_journey_pattern_link_order_in_sequence_pattern_id").execute();
}
