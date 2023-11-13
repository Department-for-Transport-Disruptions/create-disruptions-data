import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies } from "nookies";
import { COOKIES_TWITTER_CODE_VERIFIER, COOKIES_TWITTER_STATE, SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH } from "../../constants";
import { addTwitterAccount } from "../../data/twitter";
import { redirectTo, redirectToError } from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";

const twitterCallback = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = getSession(req);

        if (!session || !(session.isOrgAdmin || session.isOperatorUser)) {
            throw new Error("Not authorised");
        }

        const { code, state } = req.query;
        const cookies = parseCookies({ req });

        const savedState = cookies[COOKIES_TWITTER_STATE];
        const codeVerifier = cookies[COOKIES_TWITTER_CODE_VERIFIER];

        if (!code || !state || !savedState || !codeVerifier) {
            throw new Error("Missing required data");
        }

        if (state !== savedState) {
            throw new Error("States do not match");
        }

        await addTwitterAccount(code.toString(), codeVerifier, session.orgId, session.name, session.operatorOrgId);

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
