import { NextApiRequest, NextApiResponse } from "next";
import { COOKIES_SOCIAL_MEDIA_ACCOUNT_ERRORS, SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH } from "../../constants";
import { addNextdoorAccount } from "../../data/nextdoor";
import { NoStateOrCodeError, NotAnAgencyAccountError } from "../../errors";
import { getSession } from "../../utils/apiUtils/auth";
import { redirectToError, redirectTo, setCookieOnResponseObject } from "../../utils/apiUtils/index";

const nextdoorCallback = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = getSession(req);

        if (!session || !session.isOrgAdmin) {
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
        if (e instanceof NotAnAgencyAccountError) {
            setCookieOnResponseObject(
                COOKIES_SOCIAL_MEDIA_ACCOUNT_ERRORS,
                JSON.stringify({
                    errors: [
                        {
                            errorMessage: "Only agency accounts can be connected",
                            id: "nextdoor",
                        },
                    ],
                }),
                res,
            );

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
