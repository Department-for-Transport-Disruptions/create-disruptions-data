import { decodeJwt } from "jose";
import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_ID_TOKEN,
    COOKIES_REFRESH_TOKEN,
    DOMAIN_NAME,
    HOOTSUITE_URL,
    SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH,
} from "../../constants";
import { getParameter, putParameter } from "../../data/ssm";
import { hootsuiteMeSchema, hootsuiteTokenSchema } from "../../schemas/hootsuite.schema";
import { sessionSchema } from "../../schemas/session.schema";
import { redirectToError, redirectTo, setCookieOnResponseObject } from "../../utils/apiUtils/index";

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

        if (refreshToken?.Parameter?.Value) {
            setCookieOnResponseObject(COOKIES_REFRESH_TOKEN, refreshToken?.Parameter?.Value, res);

            setCookieOnResponseObject(COOKIES_ID_TOKEN, idToken.Parameter.Value, res);
            res.setHeader("Set-Cookie", `${COOKIES_ID_TOKEN}=${idToken.Parameter.Value}; Path=/; HttpOnly`);
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

        const key = `/social/${session.orgId}/hootsuite/${userId}-token`;

        const addedByKey = `/social/${session.orgId}/hootsuite/${userId}-addedUser`;
        await putParameter(key, tokenResult.refresh_token, "SecureString", true);
        await putParameter(addedByKey, session.name?.replace(" ", "_") || session.username, "SecureString", true);
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
