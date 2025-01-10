import { Kysely, sql } from "kysely";

/**
 *
 * @param {Kysely} db
 */
export async function up(db) {
    await db.schema.alterTable("disruptions_edited").dropConstraint("disruptions_edited_id_fkey").execute();

    await sql`
        ALTER TABLE disruptions_edited
        ADD CONSTRAINT disruptions_edited_id_fkey
        FOREIGN KEY (id) REFERENCES disruptions(id)
        ON DELETE CASCADE
        DEFERRABLE;
    `.execute(db);
}

/**
 *
 * @param {Kysely} db
 */
export async function down(db) {
    await db.schema.alterTable("disruptions_edited").dropConstraint("disruptions_edited_id_fkey").execute();
    await sql`
        ALTER TABLE disruptions_edited
        ADD CONSTRAINT disruptions_edited_id_fkey
        FOREIGN KEY (id) REFERENCES disruptions(id)
        ON DELETE CASCADE
        NOT DEFERRABLE;
    `.execute(db);
}
