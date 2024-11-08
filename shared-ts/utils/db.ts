import { CamelCasePlugin, Expression, ExpressionBuilder, Kysely, OperationNode, PostgresDialect, sql } from "kysely";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";
import { Pool } from "pg";
import { Config } from "sst/node/config";
import { Database } from "../db/types";

export let dbClient: Kysely<Database> | null = null;

export const getDbClient = () => {
    if (dbClient) {
        return dbClient;
    }

    const dialect = new PostgresDialect({
        pool: new Pool({
            database: "disruptions",
            connectionString: Config.DB_CONNECTION_STRING,
            max: 1,
        }),
    });

    dbClient = new Kysely<Database>({
        dialect,
        plugins: [new CamelCasePlugin()],
    });

    return dbClient;
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
