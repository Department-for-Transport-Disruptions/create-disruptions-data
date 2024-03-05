import { getNextdoorAuthHeader } from "@create-disruptions-data/shared-ts/utils";
import { getParametersByPath, putParameter } from "@create-disruptions-data/shared-ts/utils/ssm";
import { NextdoorToken, nextdoorTokenSchema } from "@create-disruptions-data/shared-ts/utils/zod";
import * as logger from "lambda-log";
import { randomUUID } from "crypto";

export const nextdoorRedirectUri = `${process.env.DOMAIN_NAME as string}/api/nextdoor-callback`;

export const refreshToken = async (
    refresh_token: string,
    authHeader: string,
): Promise<{ result: NextdoorToken; status: number }> => {
    const tokenRefreshResponse = await fetch("https://auth.nextdoor.com/v2/token", {
        method: "POST",
        body: new URLSearchParams({
            grant_type: "refresh_token",
            redirect_uri: nextdoorRedirectUri,
            refresh_token: refresh_token,
            scope: "openid post:write post:read profile:read agency.boundary:read",
        }),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: authHeader,
        },
    });
    return {
        result: nextdoorTokenSchema.parse(await tokenRefreshResponse.json()),
        status: tokenRefreshResponse.status,
    };
};

export const main = async () => {
    try {
        logger.options.dev = process.env.NODE_ENV !== "production";
        logger.options.debug = process.env.ENABLE_DEBUG_LOGS === "true" || process.env.NODE_ENV !== "production";

        logger.options.meta = {
            id: randomUUID(),
        };

        const socialParameters = await getParametersByPath("/social/nextdoor", logger, true);
        if (!socialParameters || (socialParameters.Parameters && socialParameters.Parameters.length === 0)) {
            logger.info("No social parameters found to refresh");
            return;
        }

        const parametersToRefresh = socialParameters.Parameters?.filter(
            (parameter) =>
                parameter.Name &&
                !parameter.Name.includes("client_id") &&
                !parameter.Name.includes("client_secret") &&
                parameter.Value,
        );

        if (!parametersToRefresh || (parametersToRefresh && parametersToRefresh.length === 0)) {
            logger.info("No nextdoor parameters found to refresh");
            return;
        }

        const authHeader = await getNextdoorAuthHeader();
        if (!authHeader) {
            throw new Error("Failed to get auth header for next door");
            return;
        }

        await Promise.all(
            parametersToRefresh.map(async (parameter) => {
                const tokenRefreshResponse = await refreshToken(parameter.Value || "", authHeader);
                console.log(tokenRefreshResponse);
                const tokenRefreshResult = tokenRefreshResponse.result;
                if (tokenRefreshResponse.status !== 200) {
                    logger.error(
                        `An error has occurred whilst authenticating Nextdoor for: ${parameter.Name} with error: ${tokenRefreshResponse.status} ${tokenRefreshResponse.statusText}...`,
                    );
                    return;
                }
                await putParameter(parameter.Name || "", tokenRefreshResult.accessToken, "SecureString", true, logger);
            }),
        );

        logger.info("Successfully updated nextdoor tokens...");
        return;
    } catch (e) {
        if (e instanceof Error) {
            logger.error(e);

            throw e;
        }

        throw e;
    }
};
