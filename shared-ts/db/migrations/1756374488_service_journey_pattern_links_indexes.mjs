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
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
    await db.schema
        .dropIndex("idx_service_journey_pattern_link_pattern_id")
        .on("service_journey_pattern_links")
        .execute();
}
