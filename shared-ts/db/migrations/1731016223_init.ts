import { Kysely, sql } from "kysely";
import { Database } from "../types";

export async function up(db: Kysely<Database>): Promise<void> {
    await db.schema
        .createTable("disruptions")
        .addColumn("id", "text", (col) => col.primaryKey())
        .addColumn("display_id", "text", (col) => col.notNull())
        .addColumn("org_id", "text", (col) => col.notNull())
        .addColumn("summary", "text", (col) => col.notNull())
        .addColumn("description", "text", (col) => col.notNull())
        .addColumn("disruption_reason", "text", (col) => col.notNull())
        .addColumn("disruption_type", "text", (col) => col.notNull())
        .addColumn("publish_status", "text", (col) => col.notNull())
        .addColumn("publish_start_date", "text", (col) => col.notNull())
        .addColumn("publish_start_time", "text", (col) => col.notNull())
        .addColumn("publish_end_date", "text")
        .addColumn("publish_end_time", "text")
        .addColumn("disruption_start_date", "text", (col) => col.notNull())
        .addColumn("disruption_start_time", "text", (col) => col.notNull())
        .addColumn("disruption_end_date", "text")
        .addColumn("disruption_end_time", "text")
        .addColumn("disruption_no_end_date_time", "text")
        .addColumn("disruption_repeats", "text")
        .addColumn("disruption_repeats_end_date", "text")
        .addColumn("validity", "json")
        .addColumn("created_by_operator_org_id", "text")
        .addColumn("social_media_posts", "json")
        .addColumn("history", "json", (col) => col.notNull())
        .addColumn("permit_reference_number", "text")
        .addColumn("associated_link", "text")
        .addColumn("template", "boolean", (col) => col.notNull().defaultTo(false))
        .addColumn("creation_time", "timestamp", (col) => col.defaultTo(sql`now()`))
        .addColumn("last_updated", "timestamp", (col) => col.defaultTo(sql`now()`))
        .execute();

    await db.schema
        .createTable("consequences")
        .addColumn("disruption_id", "text", (col) => col.notNull().references("disruptions.id").onDelete("cascade"))
        .addColumn("consequence_index", "integer", (col) => col.notNull())
        .addColumn("consequence_type", "text", (col) => col.notNull())
        .addColumn("description", "text", (col) => col.notNull())
        .addColumn("disruption_delay", "text")
        .addColumn("disruption_direction", "text")
        .addColumn("disruption_severity", "text", (col) => col.notNull())
        .addColumn("remove_from_journey_planners", "text", (col) => col.notNull())
        .addColumn("vehicle_mode", "text", (col) => col.notNull())
        .addColumn("services", "json")
        .addColumn("stops", "json")
        .addColumn("consequence_operators", "json")
        .addColumn("disruption_area", "json")
        .addColumn("journeys", "json")
        .addPrimaryKeyConstraint("pk_disruption_id_consequence_index", ["disruption_id", "consequence_index"])
        .execute();

    await db.schema
        .createTable("disruptions_edited")
        .addColumn("id", "text", (col) => col.primaryKey().references("disruptions.id").onDelete("cascade"))
        .addColumn("display_id", "text", (col) => col.notNull())
        .addColumn("org_id", "text", (col) => col.notNull())
        .addColumn("summary", "text", (col) => col.notNull())
        .addColumn("description", "text", (col) => col.notNull())
        .addColumn("disruption_reason", "text", (col) => col.notNull())
        .addColumn("disruption_type", "text", (col) => col.notNull())
        .addColumn("publish_status", "text", (col) => col.notNull())
        .addColumn("publish_start_date", "text", (col) => col.notNull())
        .addColumn("publish_start_time", "text", (col) => col.notNull())
        .addColumn("publish_end_date", "text")
        .addColumn("publish_end_time", "text")
        .addColumn("disruption_start_date", "text", (col) => col.notNull())
        .addColumn("disruption_start_time", "text", (col) => col.notNull())
        .addColumn("disruption_end_date", "text")
        .addColumn("disruption_end_time", "text")
        .addColumn("disruption_no_end_date_time", "text")
        .addColumn("disruption_repeats", "text")
        .addColumn("disruption_repeats_end_date", "text")
        .addColumn("validity", "json")
        .addColumn("created_by_operator_org_id", "text")
        .addColumn("social_media_posts", "json")
        .addColumn("history", "json", (col) => col.notNull())
        .addColumn("permit_reference_number", "text")
        .addColumn("associated_link", "text")
        .addColumn("template", "boolean", (col) => col.notNull().defaultTo(false))
        .addColumn("creation_time", "timestamp", (col) => col.defaultTo(sql`now()`))
        .addColumn("last_updated", "timestamp", (col) => col.defaultTo(sql`now()`))
        .execute();

    await db.schema
        .createTable("consequences_edited")
        .addColumn("disruption_id", "text", (col) =>
            col.notNull().references("disruptions_edited.id").onDelete("cascade"),
        )
        .addColumn("consequence_index", "integer", (col) => col.notNull())
        .addColumn("consequence_type", "text", (col) => col.notNull())
        .addColumn("description", "text", (col) => col.notNull())
        .addColumn("disruption_delay", "text")
        .addColumn("disruption_direction", "text")
        .addColumn("disruption_severity", "text", (col) => col.notNull())
        .addColumn("remove_from_journey_planners", "text", (col) => col.notNull())
        .addColumn("vehicle_mode", "text", (col) => col.notNull())
        .addColumn("services", "json")
        .addColumn("stops", "json")
        .addColumn("consequence_operators", "json")
        .addColumn("disruption_area", "json")
        .addColumn("journeys", "json")
        .addPrimaryKeyConstraint("pk_disruption_id_consequence_index", ["disruption_id", "consequence_index"])
        .execute();

    await db.schema.createIndex("idx_disruptions_org_id").on("disruptions").column("org_id").execute();
    await db.schema.createIndex("idx_disruptions_edited_org_id").on("disruptions_edited").column("org_id").execute();
    await db.schema
        .createIndex("idx_disruptions_permit_reference_number")
        .on("disruptions")
        .column("permit_reference_number")
        .execute();
    await db.schema
        .createIndex("idx_disruptions_edited_permit_reference_number")
        .on("disruptions_edited")
        .column("permit_reference_number")
        .execute();

    await db.schema.createIndex("idx_consequences_disruption_id").on("consequences").column("disruption_id").execute();
    await db.schema
        .createIndex("idx_consequences_edited_disruption_id")
        .on("consequences_edited")
        .column("disruption_id")
        .execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
    await db.schema.dropTable("consequences_edited").execute();
    await db.schema.dropTable("disruptions_edited").execute();
    await db.schema.dropTable("consequences").execute();
    await db.schema.dropTable("disruptions").execute();
}
