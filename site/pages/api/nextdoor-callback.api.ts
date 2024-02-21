import { NextApiRequest, NextApiResponse } from "next";
import { SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH } from "../../constants";
import { addNextdoorAccount } from "../../data/nextdoor";
import { NoStateOrCodeError } from "../../errors";
import { getSession } from "../../utils/apiUtils/auth";
import { redirectToError, redirectTo } from "../../utils/apiUtils/index";

const nextdoorCallback = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = getSession(req);

        if (!session || !(session.isOrgAdmin || session.isOperatorUser)) {
            throw new Error("Session data not found");
        }

        const { code } = req.query;

        if (!code) {
            throw new NoStateOrCodeError();
        }

        await addNextdoorAccount(code.toString(), session.orgId, session.name, session.operatorOrgId);

        redirectTo(res, SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH);
        return;
    } catch (e) {
        if (e instanceof NoStateOrCodeError) {
            redirectTo(res, SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH);
            return;
        }
        if (e instanceof Error) {
            const message = "There was a problem with nextdoor.";
            redirectToError(res, message, "api.nextdoorCallback", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default nextdoorCallback;
