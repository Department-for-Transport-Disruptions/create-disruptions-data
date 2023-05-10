import { NextApiRequest, NextApiResponse } from "next";
import { COOKIES_ID_TOKEN, COOKIES_REFRESH_TOKEN, LOGIN_PAGE_PATH } from "../../constants";
import { globalSignOut } from "../../data/cognito";
import { destroyCookieOnResponseObject, redirectTo, redirectToError } from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";

const signOut = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const session = getSession(req);

        if (session) {
            await globalSignOut(session.username);
        }

        destroyCookieOnResponseObject(COOKIES_ID_TOKEN, res);
        destroyCookieOnResponseObject(COOKIES_REFRESH_TOKEN, res);

        redirectTo(res, LOGIN_PAGE_PATH);
        return;
    } catch (error) {
        const message = "There was a problem signing out.";
        redirectToError(res, message, "api.sign-out", error as Error);
    }
};

export default signOut;
