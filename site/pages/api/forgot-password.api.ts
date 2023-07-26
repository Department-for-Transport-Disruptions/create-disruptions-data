import { UserNotFoundException } from "@aws-sdk/client-cognito-identity-provider";
import { NextApiRequest, NextApiResponse } from "next";
import {
    RESET_PASSWORD_CONFIRMATION_PAGE_PATH,
    FORGOT_PASSWORD_PAGE_PATH,
    COOKIES_FORGOT_PASSWORD_ERRORS,
} from "../../constants";
import { initiateResetPassword } from "../../data/cognito";
import { forgotPasswordSchema } from "../../schemas/forgot-password.schema";
import { flattenZodErrors } from "../../utils";
import {
    destroyCookieOnResponseObject,
    redirectTo,
    redirectToError,
    setCookieOnResponseObject,
} from "../../utils/apiUtils";
import logger from "../../utils/logger";

const forgotPassword = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const validatedBody = forgotPasswordSchema.safeParse(req.body);

        if (!validatedBody.success) {
            setCookieOnResponseObject(
                COOKIES_FORGOT_PASSWORD_ERRORS,
                JSON.stringify({
                    inputs: req.body as object,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );
            redirectTo(res, FORGOT_PASSWORD_PAGE_PATH);
            return;
        }
        const { email } = validatedBody.data;
        await initiateResetPassword(email);
        logger.info("", {
            context: "api.forgot-password",
            message: "Reset password flow successfully initiated",
        });
        destroyCookieOnResponseObject(COOKIES_FORGOT_PASSWORD_ERRORS, res);
        redirectTo(res, `${RESET_PASSWORD_CONFIRMATION_PAGE_PATH}?email=${email}`);
        return;
    } catch (e) {
        if (e instanceof UserNotFoundException) {
            logger.warn(`Invalid email used when trying to reset password.`);
            const body = req.body as Record<string, string>;
            redirectTo(res, `${RESET_PASSWORD_CONFIRMATION_PAGE_PATH}?email=${body.email}`);
            return;
        }

        if (e instanceof Error) {
            const message = "There was a problem with initiating the reset password flow.";
            redirectToError(res, message, "api.forgot-password", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default forgotPassword;
