import { decodeJwt } from "jose";
import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_ID_TOKEN,
    COOKIES_REFRESH_TOKEN,
    DOMAIN_NAME,
    HOOTSUITE_URL,
    SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH,
} from "../../constants";
import { deleteParameter, getParameter, getParametersByPath, putParameter } from "../../data/ssm";
import { initiateRefreshAuth } from "../../middleware.api";
import { hootsuiteMeSchema, hootsuiteTokenSchema } from "../../schemas/hootsuite.schema";
import { sessionSchema } from "../../schemas/session.schema";
import { redirectToError, redirectTo, setCookieOnResponseObject, delay } from "../../utils/apiUtils/index";

const hootsuiteCallback = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { code, state } = req.query;

        if (!state || !code) {
            throw new Error("State and code must be provided");
        }

        const [idToken, refreshToken] = await Promise.all([
            getParameter(`/${state.toString()}/token`),
            getParameter(`/${state.toString()}/refresh-token`),
        ]);

        const [clientId, clientSecret] = await Promise.all([
            getParameter(`/social/hootsuite/client_id`),
            getParameter(`/social/hootsuite/client_secret`),
        ]);

        if (!clientId || !clientSecret) {
            throw new Error("clientId and clientSecret must be defined");
        }

        const authKey = `${clientId.Parameter?.Value || ""}:${clientSecret.Parameter?.Value || ""}`;

        const authToken = `Basic ${Buffer.from(authKey).toString("base64")}`;

        if (!idToken?.Parameter?.Value) {
            throw new Error("idToken must be defined");
        }
        const decodedToken = decodeJwt(idToken?.Parameter?.Value);
        const username = (decodedToken["cognito:username"] as string) ?? null;
        if (refreshToken?.Parameter?.Value) {
            setCookieOnResponseObject(COOKIES_REFRESH_TOKEN, refreshToken?.Parameter?.Value, res);

            const refreshResult = await initiateRefreshAuth(username, refreshToken?.Parameter?.Value);
            if (refreshResult.AuthenticationResult?.IdToken) {
                setCookieOnResponseObject(COOKIES_ID_TOKEN, refreshResult.AuthenticationResult.IdToken, res);
                res.setHeader(
                    "Set-Cookie",
                    `${COOKIES_ID_TOKEN}=${refreshResult.AuthenticationResult.IdToken}; Path=/; HttpOnly`,
                );
            }
        }

        const tokenResponse = await fetch(`${HOOTSUITE_URL}oauth2/token`, {
            method: "POST",
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code: code.toString() ?? "",
                redirect_uri: `${DOMAIN_NAME}/api/hootsuite-callback`,
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: authToken,
            },
        });

        if (!tokenResponse.ok) {
            const message = `An error has occured: ${tokenResponse.status}`;
            throw new Error(message);
        }

        const tokenResult = hootsuiteTokenSchema.parse(await tokenResponse.json());

        const session = sessionSchema.parse(decodeJwt(idToken.Parameter.Value));

        if (!session || !session.isOrgAdmin) {
            throw new Error("Session data not found");
        }

        const userDetailsResponse = await fetch(`${HOOTSUITE_URL}v1/me`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${tokenResult.access_token}`,
            },
        });

        if (!userDetailsResponse.ok) {
            const message = `An error has occured: ${userDetailsResponse.status}`;
            throw new Error(message);
        }

        const userDetails = hootsuiteMeSchema.parse(await userDetailsResponse.json());

        const userId: string = userDetails.data.id;

        let refreshTokens = null;
        try {
            refreshTokens = (await getParametersByPath(`/social/${session.orgId}/hootsuite`)) ?? null;
        } catch (e) {}

        const refreshTokenExists = refreshTokens?.Parameters?.filter((rt) => rt.Name?.includes(userId));

        if (refreshTokenExists && refreshTokenExists.length > 0) {
            await Promise.all(
                refreshTokenExists.map(async (refreshToken) =>
                    refreshToken.Name ? await deleteParameter(refreshToken.Name) : "",
                ),
            );
        }

        // delay added to make sure delete actions complete before redirection
        await delay(3000);

        const key = `/social/${session.orgId}/hootsuite/${userId}-${
            session.name?.replace(" ", "_") || session.username
        }`;
        await putParameter(key, tokenResult.refresh_token, "SecureString", true);

        redirectTo(res, SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH);
        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem with hootsuite.";
            redirectToError(res, message, "api.hootsuiteCallback", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default hootsuiteCallback;
