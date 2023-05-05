import { NextApiRequest, NextApiResponse } from "next";
import { COOKIES_CHANGE_PASSWORD_ERRORS, CHANGE_PASSWORD_PAGE_PATH } from "../../constants";
import { changePasswordSchemaRefined } from "../../schemas/change-password.schema";
import { flattenZodErrors } from "../../utils";
import {
    redirectToError,
    setCookieOnResponseObject,
    redirectTo,
    destroyCookieOnResponseObject,
} from "../../utils/apiUtils";

const changePassword = (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const validatedBody = changePasswordSchemaRefined.safeParse(req.body);
        if (!validatedBody.success) {
            setCookieOnResponseObject(
                COOKIES_CHANGE_PASSWORD_ERRORS,
                JSON.stringify({
                    inputs: req.body as object,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );
        } else {
            destroyCookieOnResponseObject(COOKIES_CHANGE_PASSWORD_ERRORS, res);
        }

        redirectTo(res, `${CHANGE_PASSWORD_PAGE_PATH}${validatedBody.success ? "?success=true" : ""}`);
        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem while changing password.";
            redirectToError(res, message, "api.change-password", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default changePassword;
