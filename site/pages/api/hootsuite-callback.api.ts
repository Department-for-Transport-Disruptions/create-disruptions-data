import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies } from "nookies";
import { COOKIES_HOOTSUITE_STATE, SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH } from "../../constants";
import { addHootsuiteAccount } from "../../data/hootsuite";
import { NoStateOrCodeError } from "../../errors";
import { getSession } from "../../utils/apiUtils/auth";
import { redirectTo, redirectToError } from "../../utils/apiUtils/index";

const hootsuiteCallback = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = getSession(req);

        if (!session || !(session.isOrgAdmin || session.isOperatorUser)) {
            throw new Error("Session data not found");
        }

        const { code, state } = req.query;

        if (!state || !code) {
            throw new NoStateOrCodeError();
        }

        const savedState = parseCookies({ req })[COOKIES_HOOTSUITE_STATE];

        if (state !== savedState) {
            throw new Error("States do not match");
        }

        await addHootsuiteAccount(code.toString(), session.orgId, session.name, session.operatorOrgId);

        redirectTo(res, SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH);
        return;
    } catch (e) {
        if (e instanceof NoStateOrCodeError) {
            redirectTo(res, SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH);
            return;
        }
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
