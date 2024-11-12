import { CamelCasePlugin, Expression, ExpressionBuilder, Kysely, OperationNode, PostgresDialect, sql } from "kysely";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";
import * as logger from "lambda-log";
import pg from "pg";
import { Config } from "sst/node/config";
import { Database } from "../db/types";
import { Disruption } from "../disruptionTypes";
import { disruptionSchema } from "../disruptionTypes.zod";
import { PublishStatus } from "../enums";
import { makeFilteredArraySchema } from "./zod";

const { Pool } = pg;

export const getDbClient = (isSite = false) => {
    const dialect = new PostgresDialect({
        pool: new Pool({
            connectionString: `postgresql://${encodeURIComponent(Config.DB_USERNAME)}:${encodeURIComponent(Config.DB_PASSWORD)}@${isSite ? Config.DB_SITE_HOST : Config.DB_HOST}:${isSite ? Config.DB_SITE_PORT : Config.DB_PORT}/${Config.DB_NAME}`,
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
        eb
            .selectFrom("consequences")
            .selectAll()
            .whereRef("consequences.disruptionId", "=", "disruptions.id")
            .orderBy("consequences.consequenceIndex asc"),
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

export const getPublishedDisruptionsData = async (): Promise<Disruption[]> => {
    logger.info("Getting disruptions data from database...");

    const dbClient = getDbClient(true);

    const disruptions = await dbClient
        .selectFrom("disruptions")
        .selectAll()
        .select((eb) => [withConsequences(eb)])
        .where("disruptions.publishStatus", "=", PublishStatus.published)
        .execute();

    return makeFilteredArraySchema(disruptionSchema).parse(disruptions);
};

export const getPublishedDisruptionById = async (orgId: string, disruptionId: string): Promise<Disruption | null> => {
    logger.info(`Retrieving disruption ${disruptionId} from database...`);

    const dbClient = getDbClient(true);

    const disruption = await dbClient
        .selectFrom("disruptions")
        .selectAll()
        .select((eb) => [withConsequences(eb)])
        .where("disruptions.id", "=", disruptionId)
        .where("disruptions.orgId", "=", orgId)
        .where("disruptions.publishStatus", "=", PublishStatus.published)
        .executeTakeFirst();

    const parsedDisruption = disruptionSchema.safeParse(disruption);

    if (!parsedDisruption.success) {
        logger.warn(parsedDisruption.error.toString());
        logger.warn(`Invalid disruption ${disruptionId}`);
        return null;
    }

    return parsedDisruption.data;
};

export const getAllDisruptionsForOrg = async (orgId: string): Promise<Disruption[]> => {
    logger.info(`Retrieving all disruptions for org ${orgId}...`);

    const dbClient = getDbClient(true);

    const disruptions = await dbClient
        .selectFrom("disruptions")
        .selectAll()
        .select((eb) => [withConsequences(eb)])
        .where("disruptions.orgId", "=", orgId)
        .execute();

    return makeFilteredArraySchema(disruptionSchema).parse(disruptions);
};

export const getDisruptionsWithRoadworks = async (
    permitReferenceNumbers: string[],
    publishStatus: PublishStatus,
): Promise<Disruption[]> => {
    logger.info("Retrieving all disruptions for given permit reference numbers...");

    const dbClient = getDbClient(true);

    const disruptions = await dbClient
        .selectFrom("disruptions")
        .selectAll()
        .select((eb) => [withConsequences(eb)])
        .where("disruptions.permitReferenceNumber", "in", permitReferenceNumbers)
        .where("disruptions.publishStatus", "=", publishStatus)
        .execute();

    return makeFilteredArraySchema(disruptionSchema).parse(disruptions);
};
