import { APIGatewayProxyEventPathParameters, APIGatewayProxyEventQueryStringParameters } from "aws-lambda";
import Pino, { Logger } from "pino";
import { lambdaRequestTracker, pinoLambdaDestination } from "pino-lambda";
import { z } from "zod";

// Define a custom logger type to allow extra props to be included in logs
type CustomLogger = Logger & {
    filepath?: string;
    subscriptionId?: string;
    path?: string;
    method?: string;
    pathParams?: APIGatewayProxyEventPathParameters | null;
    queryParams?: APIGatewayProxyEventQueryStringParameters | null;
};

export const logger = Pino(
    {
        mixin: (_mergeObject, _level, customLogger: CustomLogger) => ({
            path: customLogger.path,
            method: customLogger.method,
            subscriptionId: customLogger.subscriptionId,
            pathParams: customLogger.pathParams,
            queryParams: customLogger.queryParams,
        }),
    },
    pinoLambdaDestination(),
) as CustomLogger;

export const withLambdaRequestTracker = lambdaRequestTracker();

/**
 * Set a global error map for Zod so that we can log invalid data for better troubleshooting.
 * Password fields are excluded.
 */
export const errorMapWithDataLogging: Parameters<typeof z.setErrorMap>[0] = (issue, ctx) => {
    const pathContainsPasswordField = issue.path.some((pathItem) => {
        return typeof pathItem === "string" && pathItem.toLowerCase().includes("password");
    });

    if (!pathContainsPasswordField) {
        logger.warn(`Zod error message="${ctx.defaultError}", path="${issue.path.join(".")}", data="${ctx.data}"`);
    }

    return {
        message: ctx.defaultError,
    };
};
