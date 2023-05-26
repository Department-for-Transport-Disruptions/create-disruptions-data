import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies } from "nookies";
import { z } from "zod";
import { COOKIES_HOOTSUITE_STATE, HOOTSUITE_API_BASE, SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH } from "../../constants";
import { getHootsuiteCreds, putParameter } from "../../data/secrets";
import { getHootsuiteRedirectUri } from "../../utils";
import { destroyCookieOnResponseObject, redirectTo, redirectToError } from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";

const hootsuiteCallback = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = getSession(req);

        if (!session) {
            throw new Error("No session found");
        }

        if (!session.isOrgAdmin) {
            throw new Error("Insufficient permissions");
        }

        // After completing the auth request, hootsuite should redirect to here with a code param in the query string
        // It should also contain the state that we set when making the initial auth request

        const { code, state } = req.query;

        const cookies = parseCookies({ req });

        const stateCookieValue = cookies[COOKIES_HOOTSUITE_STATE];

        destroyCookieOnResponseObject(COOKIES_HOOTSUITE_STATE, res);

        // Check that the states match to make sure the request has come from a valid source
        if (stateCookieValue !== state?.toString()) {
            throw new Error("Hootsuite state does not match");
        }

        const hootsuiteCreds = await getHootsuiteCreds();

        // Make a request to the token endpoint using the code that was sent in the query string
        // This should return a response with an access token and a refresh token
        const response = await fetch(`${HOOTSUITE_API_BASE}/oauth2/token`, {
            method: "POST",
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code: code?.toString() ?? "",
                redirect_uri: getHootsuiteRedirectUri(),
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(
                    `
                    ${hootsuiteCreds?.clientId ?? ""}:${hootsuiteCreds?.clientSecret ?? ""}`,
                ).toString("base64")})`,
            },
        });

        const response2 = await fetch(`${HOOTSUITE_API_BASE}/v1/media`, {
            method: "POST",
            body: JSON.stringify({
                sizeBytes: 200000,
                mimeType: "image/png",
            }),
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
            },
        });

        if (!response.ok) {
            throw new Error("Error retrieving hootsuite token");
        }

        // Grab the refresh token from the response
        const tokenData = z
            .object({
                refresh_token: z.string(),
            })
            .parse(await response.json());

        // Save the refresh token to parameter store
        await putParameter(`/social/hootsuite/${session.orgId}`, tokenData.refresh_token, "SecureString");

        redirectTo(res, SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH);
    } catch (error) {
        const message = "There was a problem authenticating against hootsuite.";
        redirectToError(res, message, "api.hootsuite-callback", error as Error);
    }
};

export default hootsuiteCallback;
