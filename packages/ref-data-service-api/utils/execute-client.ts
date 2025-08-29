import { Database } from "@create-disruptions-data/shared-ts/db/types";
import { getDbClient } from "@create-disruptions-data/shared-ts/utils/db";
import { logger } from "@create-disruptions-data/shared-ts/utils/logger";
import { APIGatewayEvent, APIGatewayProxyResultV2 } from "aws-lambda";
import { Kysely } from "kysely";
import { ClientError } from "../error";

const dbClient = getDbClient(true);

export const executeClient = async <InputT, ResponseT, FormattedT>(
    event: APIGatewayEvent,
    getQueryInputFunction: (event: APIGatewayEvent) => InputT,
    clientFunction: (client: Kysely<Database>, input: InputT) => Promise<ResponseT>,
    formatterFunction?: (
        clientResponse: ResponseT,
        input?: InputT,
        client?: Kysely<Database>,
    ) => Promise<FormattedT | null>,
): Promise<APIGatewayProxyResultV2> => {
    try {
        logger.path = event.path;
        logger.method = event.httpMethod;
        logger.queryParams = event.queryStringParameters;
        logger.pathParams = event.pathParameters;

        logger.info("Starting request");

        const input = getQueryInputFunction(event);

        logger.debug("Query input", { queryInput: input });

        const result = await clientFunction(dbClient, input);

        logger.info(`${clientFunction.name} called successfully`);

        if (formatterFunction) {
            const formattedResult = await formatterFunction(result, input, dbClient);

            return {
                statusCode: 200,
                body: JSON.stringify(formattedResult),
                headers: {
                    "content-type": "application/json",
                },
            };
        }

        if (!result) {
            return {
                statusCode: 404,
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(result),
            headers: {
                "content-type": "application/json",
            },
        };
    } catch (e) {
        if (e instanceof ClientError) {
            logger.error(e);

            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: e.message,
                }),
            };
        }
        if (e instanceof Error) {
            logger.error(e);

            return {
                statusCode: 500,
                body: JSON.stringify({
                    error: "There was a problem with the service",
                }),
            };
        }

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "There was a problem with the service",
            }),
        };
    }
};

export const executeClientWithoutInput = async <InputT, ResponseT, FormattedT>(
    event: APIGatewayEvent,
    clientFunction: (client: Kysely<Database>) => Promise<ResponseT>,
    formatterFunction?: (
        clientResponse: ResponseT,
        input?: InputT,
        client?: Kysely<Database>,
    ) => Promise<FormattedT | null>,
): Promise<APIGatewayProxyResultV2> => {
    try {
        logger.path = event.path;
        logger.method = event.httpMethod;
        logger.queryParams = event.queryStringParameters;
        logger.pathParams = event.pathParameters;

        logger.info("Starting request without inputs");

        const result = await clientFunction(dbClient);

        logger.info(`${clientFunction.name} called successfully`);

        if (formatterFunction) {
            const formattedResult = await formatterFunction(result, undefined, dbClient);

            return {
                statusCode: 200,
                body: JSON.stringify(formattedResult),
                headers: {
                    "content-type": "application/json",
                },
            };
        }

        if (!result) {
            return {
                statusCode: 404,
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(result),
            headers: {
                "content-type": "application/json",
            },
        };
    } catch (e) {
        if (e instanceof ClientError) {
            logger.error(e);

            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: e.message,
                }),
            };
        }
        if (e instanceof Error) {
            logger.error(e);

            return {
                statusCode: 500,
                body: JSON.stringify({
                    error: "There was a problem with the service",
                }),
            };
        }

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "There was a problem with the service",
            }),
        };
    }
};
