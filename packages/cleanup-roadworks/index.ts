import { Database } from "@create-disruptions-data/shared-ts/db/types";
import { getDbClient } from "@create-disruptions-data/shared-ts/utils/db";
import { logger } from "@create-disruptions-data/shared-ts/utils/logger";
import { Kysely, sql } from "kysely";

/**
 * Remove outdated roadworks from the database. Roadworks are considered outdated if:
 * - The actual end date time is more than 7 days old and the permit status is "closed".
 * - The last updated date time is more than 7 days old and the permit status is "revoked", "refused", "cancelled", or "closed".
 * - The work status is "Works in progress" and both the proposed end date time and last updated date time are more than 2 months old.
 */
export const deleteOldRoadworks = async (dbClient: Kysely<Database>) => {
    await dbClient
        .deleteFrom("roadworks")
        .where((qb) =>
            qb.or([
                qb.and([
                    qb(
                        sql`(TO_DATE(left(actual_end_date_time, 10), 'YYYY-MM-DD') + INTERVAL '7 days')`,
                        "<",
                        sql`CURRENT_DATE`,
                    ),
                    qb("permitStatus", "=", "closed"),
                ]),
                qb.and([
                    qb(
                        sql`(TO_DATE(SUBSTRING(last_updated_date_time, 1, 10), 'YYYY-MM-DD') + INTERVAL '7 days')`,
                        "<",
                        sql`CURRENT_DATE`,
                    ),
                    qb.or([
                        qb("permitStatus", "=", "revoked"),
                        qb("permitStatus", "=", "refused"),
                        qb("permitStatus", "=", "cancelled"),
                        qb("permitStatus", "=", "closed"),
                    ]),
                ]),
                qb.and([
                    qb("workStatus", "=", "Works in progress"),
                    qb.and([
                        qb(
                            sql`TO_TIMESTAMP(SUBSTRING(proposed_end_date_time, 1, 19), 'YYYY-MM-DD"T"HH24:MI:SS')`,
                            "<=",
                            sql`NOW() - INTERVAL '2 months'`,
                        ),
                        qb(
                            sql`TO_TIMESTAMP(SUBSTRING(last_updated_date_time, 1, 19), 'YYYY-MM-DD"T"HH24:MI:SS')`,
                            "<=",
                            sql`NOW() - INTERVAL '2 months'`,
                        ),
                    ]),
                ]),
            ]),
        )
        .execute();
};

export const main = async () => {
    const dbClient = getDbClient(false);

    try {
        logger.info("Starting Cleanup roadworks");

        await deleteOldRoadworks(dbClient);

        logger.info("Cleanup roadworks complete");
    } catch (e) {
        if (e instanceof Error) {
            logger.error(e);

            return {
                statusCode: 500,
                body: JSON.stringify({
                    error: "There was a problem with cleanup roadworks",
                }),
            };
        }

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "There was a problem with cleanup roadworks",
            }),
        };
    }
};
