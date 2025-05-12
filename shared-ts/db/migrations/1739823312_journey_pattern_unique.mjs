import { Kysely } from "kysely";

/**
 *
 * @param {Kysely} db
 */
export async function up(db) {
    await db.schema
        .createIndex("idx_service_journey_patterns_unique")
        .unique()
        .on("service_journey_patterns")
        .columns(["operator_service_id", "destination_display", "direction", "route_ref", "section_refs"])
        .execute();
}

/**
 *
 * @param {Kysely} db
 */
export async function down(db) {
    await db.schema.dropIndex("idx_service_journey_patterns_unique").on("service_journey_patterns").execute();
}
