import { putParameter } from "@create-disruptions-data/shared-ts/utils/ssm";
import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies } from "nookies";
import { COOKIES_TWITTER_OAUTH_SECRET, SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH } from "../../constants";
import { addSocialAccountToOrg } from "../../data/dynamo";
import { getTwitterClient, getTwitterSsmAccessSecretKey, getTwitterSsmAccessTokenKey } from "../../data/twitter";
import { redirectTo, redirectToError } from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";

const twitterCallback = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = getSession(req);

        if (!session || !(session.isOrgAdmin || session.isOperatorUser)) {
            throw new Error("Not authorised");
        }

        const { oauth_token: oauthToken, oauth_verifier: oauthVerifier } = req.query;
        const cookies = parseCookies({ req });

        const oauthSecret = cookies[COOKIES_TWITTER_OAUTH_SECRET];

        if (!oauthToken || !oauthVerifier || !oauthSecret) {
            throw new Error("Missing required data");
        }

        const client = await getTwitterClient({
            oauthToken: oauthToken.toString(),
            oauthSecret,
        });

        const { client: authedClient, accessToken, accessSecret } = await client.login(oauthVerifier.toString());

        const twitterDetails = await authedClient.v2.me();

        await addSocialAccountToOrg(
            session.orgId,
            twitterDetails.data.id,
            twitterDetails.data.name,
            session.name,
            "Twitter",
            session.operatorOrgId,
        );

        await Promise.all([
            putParameter(
                getTwitterSsmAccessTokenKey(session.orgId, twitterDetails.data.id),
                accessToken,
                "SecureString",
                true,
            ),
            putParameter(
                getTwitterSsmAccessSecretKey(session.orgId, twitterDetails.data.id),
                accessSecret,
                "SecureString",
                true,
            ),
        ]);

        redirectTo(res, SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH);
        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem with the response from twitter.";
            redirectToError(res, message, "api.twitterCallback", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default twitterCallback;
