import { UserNotFoundException } from "@aws-sdk/client-cognito-identity-provider";
import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_RESET_PASSWORD_ERRORS,
    RESET_PASSWORD_CONFIRMATION_PAGE_PATH,
    FORGOT_PASSWORD_PAGE_PATH,
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

const {
    COGNITO_CLIENT_ID: cognitoClientId,
    COGNITO_CLIENT_SECRET: cognitoClientSecret,
    COGNITO_USER_POOL_ID: userPoolId,
} = process.env;

if (!cognitoClientSecret || !cognitoClientId || !userPoolId) {
    throw new Error("Cognito env vars not set");
}

const resetPassword = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const validatedBody = forgotPasswordSchema.safeParse(req.body);

        if (!validatedBody.success) {
            setCookieOnResponseObject(
                COOKIES_RESET_PASSWORD_ERRORS,
                JSON.stringify({
                    inputs: req.body as object,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );
            //TODO DEANNA change to reset password page
            redirectTo(res, FORGOT_PASSWORD_PAGE_PATH);
            return;
        }
        const { email } = validatedBody.data;
        await initiateResetPassword(email);
        logger.info("", {
            context: "api.reset-password",
            message: "reset password flow successfully initiated",
        });
        destroyCookieOnResponseObject(COOKIES_RESET_PASSWORD_ERRORS, res);
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
            const message = "There was a problem with resetting your password.";
            redirectToError(res, message, "api.reset-password", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default resetPassword;
