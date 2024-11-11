import { CamelCasePlugin, Expression, ExpressionBuilder, Kysely, OperationNode, PostgresDialect, sql } from "kysely";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";
import pg from "pg";
import { Config } from "sst/node/config";
import { Database } from "../db/types";

const { Pool } = pg;

export const getDbClient = (isSite = false, databaseName?: string) => {
    const dialect = new PostgresDialect({
        pool: new Pool({
            connectionString: `postgresql://${encodeURIComponent(Config.DB_USERNAME)}:${encodeURIComponent(Config.DB_PASSWORD)}@${isSite ? Config.DB_SITE_HOST : Config.DB_HOST}:${isSite ? Config.DB_SITE_PORT : Config.DB_PORT}/${databaseName ?? Config.DB_NAME}`,
        }),
    });

    return new Kysely<Database>({
        dialect,
        plugins: [new CamelCasePlugin()],
    });
};

export default class JsonValue<T> implements Expression<T> {
    #value: T;

    constructor(value: T) {
        this.#value = value;
    }

    get expressionType(): T | undefined {
        return undefined;
    }

    toOperationNode(): OperationNode {
        const json = JSON.stringify(this.#value);

        return sql`CAST(${json} AS JSON)`.toOperationNode();
    }
}

export const json = <T>(object: T): string => JSON.stringify(object);

export const withConsequences = (eb: ExpressionBuilder<Database, "disruptions">) =>
    jsonArrayFrom(
        eb.selectFrom("consequences").selectAll().whereRef("consequences.disruptionId", "=", "disruptions.id"),
    ).as("consequences");

export const withEditedConsequences = (eb: ExpressionBuilder<Database, "disruptionsEdited">) =>
    jsonArrayFrom(
        eb
            .selectFrom("consequencesEdited")
            .selectAll()
            .whereRef("consequencesEdited.disruptionId", "=", "disruptionsEdited.id"),
    ).as("consequences");

export const withEditedDisruption = (eb: ExpressionBuilder<Database, "disruptions">) =>
    jsonObjectFrom(
        eb
            .selectFrom("disruptionsEdited")
            .selectAll()
            .select((eb2) => [withEditedConsequences(eb2)])
            .whereRef("disruptionsEdited.id", "=", "disruptions.id"),
    ).as("editedDisruption");
