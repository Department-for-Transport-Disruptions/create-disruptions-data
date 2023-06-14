import * as jose from "jose";
import { NextApiRequest, NextApiResponse } from "next";
import { COOKIES_ID_TOKEN, COOKIES_REFRESH_TOKEN, SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH } from "../../constants";
import { getParameter, putParameter } from "../../data/ssm";
import { initiateRefreshAuth } from "../../middleware.api";
import { getSession } from "../../utils/apiUtils/auth";
import { redirectToError, redirectTo, setCookieOnResponseObject } from "../../utils/apiUtils/index";

const hootsuiteCallback = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { code, state } = req.query;

        const idToken = state?.toString() ? await getParameter(`/${state.toString()}/token`) : undefined;
        const refreshToken = state?.toString() ? await getParameter(`/${state.toString()}/refresh-token`) : undefined;

        const clientId = await getParameter(`/social/hootsuite/client_id`);
        const clientSecret = await getParameter(`/social/hootsuite/client_secret`);

        if (!clientId || !clientSecret) {
            throw new Error("clientId and clientSecret must be defined");
        }

        const authKey = `${clientId.Parameter?.Value || ""}:${clientSecret.Parameter?.Value || ""}`;

        const authToken = `Basic ${Buffer.from(authKey).toString("base64")}`;

        if (!idToken?.Parameter?.Value) {
            throw new Error("idToken must be defined");
        }
        const decodedToken = jose.decodeJwt(idToken?.Parameter?.Value);
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

        const tokenResponse = await fetch(`https://platform.hootsuite.com/oauth2/token`, {
            method: "POST",
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code: code?.toString() ?? "",
                redirect_uri: `http://localhost:3000/api/hootsuite-callback`,
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

        const tokenResult = await tokenResponse.json();

        const session = await getSession(req);
        if (!session) {
            throw new Error("Session data not found");
        }

        const userDetailsResponse = await fetch(`https://platform.hootsuite.com/v1/me`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${tokenResult.access_token}`,
            },
        });

        if (!userDetailsResponse.ok) {
            const message = `An error has occured: ${userDetailsResponse.status}`;
            throw new Error(message);
        }

        const userDetails = await userDetailsResponse.json();
        console.log("me", userDetails);

        const userId = userDetails.data.id;
        const key = `/social/${session.orgId}/hootsuite/${userId}`;
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
