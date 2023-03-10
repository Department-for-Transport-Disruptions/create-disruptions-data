import { NextApiResponse } from "next";
import { COOKIES_POLICY_COOKIE, COOKIE_PREFERENCES_COOKIE, oneYearInSeconds } from "../../constants";
import { CookiePolicy, CookiesApiRequest } from "../../interfaces";
import { redirectTo, redirectToError, setCookieOnResponseObject } from "../../utils/apiUtils";

const cookies = (req: CookiesApiRequest, res: NextApiResponse): void => {
    try {
        const { tracking } = req.body;

        if (!tracking) {
            redirectTo(res, "/cookies");
            return;
        }

        const cookiePolicy: CookiePolicy = { essential: true, usage: tracking === "on" || false };

        setCookieOnResponseObject(COOKIE_PREFERENCES_COOKIE, "true", res, oneYearInSeconds, false);
        setCookieOnResponseObject(COOKIES_POLICY_COOKIE, JSON.stringify(cookiePolicy), res, oneYearInSeconds, false);

        redirectTo(res, "/cookies?settingsSaved=true");
    } catch (error) {
        const message = "There was a problem saving cookie preferences.";
        redirectToError(res, message, "api.cookies", error as Error);
    }
};

export default cookies;
