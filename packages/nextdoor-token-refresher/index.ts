import { getNextdoorAuthHeader } from "@create-disruptions-data/shared-ts/utils";
import { getParametersByPath, putParameter } from "@create-disruptions-data/shared-ts/utils/ssm";
import { NextdoorToken, nextdoorTokenSchema } from "@create-disruptions-data/shared-ts/utils/zod";
import * as logger from "lambda-log";
import { randomUUID } from "crypto";

export const nextdoorRedirectUri = `${process.env.DOMAIN_NAME as string}/api/nextdoor-callback`;

export const fetchRefreshToken = async (
    refreshToken: string,
    tokenOwner: string,
    authHeader: string,
): Promise<NextdoorToken | null> => {
    const refreshTokenResponse = await fetch("https://auth.nextdoor.com/v2/token", {
        method: "POST",
        body: new URLSearchParams({
            grant_type: "refresh_token",
            redirect_uri: nextdoorRedirectUri,
            refresh_token: refreshToken,
            scope: "openid post:write post:read profile:read agency.boundary:read",
        }),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: authHeader,
        },
    });

    if (!refreshTokenResponse.ok) {
        logger.error(
            `An error has occurred whilst authenticating Nextdoor for: ${tokenOwner} with error: ${refreshTokenResponse.status}`,
        );
        return null;
    }

    return nextdoorTokenSchema.parse(await refreshTokenResponse.json());
};

export const main = async () => {
    try {
        logger.options.dev = process.env.NODE_ENV !== "production";
        logger.options.debug = process.env.ENABLE_DEBUG_LOGS === "true" || process.env.NODE_ENV !== "production";

        logger.options.meta = {
            id: randomUUID(),
        };

        const socialParameters = await getParametersByPath("/social/nextdoor", logger, true);

        if (
            !socialParameters ||
            (socialParameters.Parameters && socialParameters.Parameters.length === 0) ||
            !socialParameters.Parameters
        ) {
            logger.info("No social parameters found to refresh");
            return;
        }

        const parametersToRefresh = socialParameters.Parameters.filter(
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
        }

        await Promise.all(
            parametersToRefresh.map(async (parameter) => {
                const refreshToken = await fetchRefreshToken(parameter.Value ?? "", parameter.Name ?? "", authHeader);

                if (!refreshToken) {
                    return;
                }

                await putParameter(parameter.Name || "", refreshToken.accessToken, "SecureString", true, logger);
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
