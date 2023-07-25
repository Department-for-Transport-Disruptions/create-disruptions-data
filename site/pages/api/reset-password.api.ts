import { NextApiRequest, NextApiResponse } from "next";
import { COOKIES_RESET_PASSWORD_ERRORS, RESET_PASSWORD_PAGE_PATH } from "../../constants";
import { resetUserPassword } from "../../data/cognito";
import { resetPasswordSchemaRefined } from "../../schemas/reset-password.schema";
import { flattenZodErrors } from "../../utils";
import {
    destroyCookieOnResponseObject,
    redirectTo,
    redirectToError,
    setCookieOnResponseObject,
} from "../../utils/apiUtils";
import logger from "../../utils/logger";

const resetPassword = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const validatedBody = resetPasswordSchemaRefined.safeParse(req.body);
        if (!validatedBody.success) {
            setCookieOnResponseObject(
                COOKIES_RESET_PASSWORD_ERRORS,
                JSON.stringify({
                    inputs: req.body as object,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );
            redirectTo(res, RESET_PASSWORD_PAGE_PATH);
            return;
        }
        const { email, key, newPassword } = validatedBody.data;

        await resetUserPassword(key, newPassword, email);

        logger.info("", {
            context: "api.reset-password",
            message: "reset password successful",
        });

        destroyCookieOnResponseObject(COOKIES_RESET_PASSWORD_ERRORS, res);

        redirectTo(res, `${RESET_PASSWORD_PAGE_PATH}${validatedBody.success ? "?success=true" : ""}`);
        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem with resetting your password.";
            redirectToError(res, message, "api.reset-password", e);

            return;
        }

        redirectToError(res);
        return;
    }
};

export default resetPassword;
