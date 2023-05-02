import { NextApiRequest, NextApiResponse } from "next";
import { COOKIES_LOGIN_ERRORS, LOGIN_PAGE_PATH } from "../../constants";
import { loginSchema } from "../../schemas/login.schema";
import { flattenZodErrors } from "../../utils";
import {
    redirectToError,
    setCookieOnResponseObject,
    redirectTo,
    destroyCookieOnResponseObject,
} from "../../utils/apiUtils";

const login = (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const validatedBody = loginSchema.safeParse(req.body);
        if (!validatedBody.success) {
            setCookieOnResponseObject(
                COOKIES_LOGIN_ERRORS,
                JSON.stringify({
                    inputs: req.body as object,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );

            redirectTo(res, LOGIN_PAGE_PATH);
            return;
        }

        destroyCookieOnResponseObject(COOKIES_LOGIN_ERRORS, res);

        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem during login.";
            redirectToError(res, message, "api.login", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default login;
