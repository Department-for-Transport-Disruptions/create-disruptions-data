import Pino, { Logger } from "pino";
import { lambdaRequestTracker, pinoLambdaDestination } from "pino-lambda";
import { z } from "zod";

// Define a custom logger type to allow extra props to be included in logs
type CustomLogger = Logger & {
    filepath?: string;
    subscriptionId?: string;
};

export const logger = Pino(
    {
        mixin: (_mergeObject, _level, customLogger: CustomLogger) => ({
            subscriptionId: customLogger.subscriptionId,
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
