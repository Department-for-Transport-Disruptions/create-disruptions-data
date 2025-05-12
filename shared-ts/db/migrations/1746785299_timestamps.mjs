import { Kysely, sql } from "kysely";

/**
 *
 * @param {Kysely} db
 */
export async function up(db) {
    await sql`ALTER TABLE disruptions ALTER COLUMN validity_start_timestamp TYPE timestamptz using validity_start_timestamp at time zone 'Europe/London';
            ALTER TABLE disruptions ALTER COLUMN validity_end_timestamp TYPE timestamptz using validity_end_timestamp at time zone 'Europe/London';
            ALTER TABLE disruptions ALTER COLUMN publish_start_timestamp TYPE timestamptz using publish_start_timestamp at time zone 'Europe/London';
            ALTER TABLE disruptions ALTER COLUMN publish_end_timestamp TYPE timestamptz using publish_end_timestamp at time zone 'Europe/London';`.execute(
        db,
    );

    await sql`ALTER TABLE disruptions_edited ALTER COLUMN validity_start_timestamp TYPE timestamptz using validity_start_timestamp at time zone 'Europe/London';
            ALTER TABLE disruptions_edited ALTER COLUMN validity_end_timestamp TYPE timestamptz using validity_end_timestamp at time zone 'Europe/London';
            ALTER TABLE disruptions_edited ALTER COLUMN publish_start_timestamp TYPE timestamptz using publish_start_timestamp at time zone 'Europe/London';
            ALTER TABLE disruptions_edited ALTER COLUMN publish_end_timestamp TYPE timestamptz using publish_end_timestamp at time zone 'Europe/London';`.execute(
        db,
    );
}

/**
 *
 * @param {Kysely} db
 */
export async function down(db) {
    await sql`ALTER TABLE disruptions ALTER COLUMN validity_start_timestamp TYPE timestamp using validity_start_timestamp at time zone 'Europe/London';
            ALTER TABLE disruptions ALTER COLUMN validity_end_timestamp TYPE timestamp using validity_end_timestamp at time zone 'Europe/London';
            ALTER TABLE disruptions ALTER COLUMN publish_start_timestamp TYPE timestamp using publish_start_timestamp at time zone 'Europe/London';
            ALTER TABLE disruptions ALTER COLUMN publish_end_timestamp TYPE timestamp using publish_end_timestamp at time zone 'Europe/London';`.execute(
        db,
    );

    await sql`ALTER TABLE disruptions_edited ALTER COLUMN validity_start_timestamp TYPE timestamp using validity_start_timestamp at time zone 'Europe/London';
            ALTER TABLE disruptions_edited ALTER COLUMN validity_end_timestamp TYPE timestamp using validity_end_timestamp at time zone 'Europe/London';
            ALTER TABLE disruptions_edited ALTER COLUMN publish_start_timestamp TYPE timestamp using publish_start_timestamp at time zone 'Europe/London';
            ALTER TABLE disruptions_edited ALTER COLUMN publish_end_timestamp TYPE timestamp using publish_end_timestamp at time zone 'Europe/London';`.execute(
        db,
    );
}
