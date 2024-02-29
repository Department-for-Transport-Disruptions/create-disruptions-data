import { getParameter, getParametersByPath, putParameter } from "@create-disruptions-data/shared-ts/utils/ssm";
import { nextdoorTokenSchema } from "@create-disruptions-data/shared-ts/utils/zod";
import * as logger from "lambda-log";
import { randomUUID } from "crypto";

export const nextdoorRedirectUri = `${process.env.DOMAIN_NAME as string}/api/nextdoor-callback`;

export const getNextdoorClientIdAndSecret = async () => {
    const [nextdoorClientIdKeyParam, nextdoorClientSecretParam] = await Promise.all([
        getParameter("/social/nextdoor/client_id", logger),
        getParameter("/social/nextdoor/client_secret", logger),
    ]);

    const nextdoorClientId = nextdoorClientIdKeyParam.Parameter?.Value ?? "";
    const nextdoorClientSecret = nextdoorClientSecretParam.Parameter?.Value ?? "";

    return { nextdoorClientId, nextdoorClientSecret };
};

export const getNextdoorAuthHeader = async () => {
    const { nextdoorClientId, nextdoorClientSecret } = await getNextdoorClientIdAndSecret();
    const key = `${nextdoorClientId}:${nextdoorClientSecret}`;

    return `Basic ${Buffer.from(key).toString("base64")}`;
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
            logger.info("Failed to get auth header for next door");
            return;
        }

        await Promise.all(
            parametersToRefresh.map(async (parameter) => {
                const tokenRefreshResponse = await fetch("https://auth.nextdoor.com/v2/token", {
                    method: "POST",
                    body: new URLSearchParams({
                        grant_type: "authorization_code",
                        redirect_uri: nextdoorRedirectUri,
                        refresh_token: parameter.Value || "",
                    }),
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        Authorization: authHeader,
                    },
                });
                const tokenRefreshResult = nextdoorTokenSchema.parse(await tokenRefreshResponse.json());
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
