import { NotAuthorizedException, PasswordResetRequiredException } from "@aws-sdk/client-cognito-identity-provider";
import { decodeJwt } from "jose";
import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_ID_TOKEN,
    COOKIES_LOGIN_ERRORS,
    COOKIES_REFRESH_TOKEN,
    DASHBOARD_PAGE_PATH,
    LOGIN_PAGE_PATH,
    SYSADMIN_MANAGE_ORGANISATIONS_PAGE_PATH,
} from "../../constants";
import { initiateAuth } from "../../data/cognito";
import { loginSchema } from "../../schemas/login.schema";
import { sessionSchema } from "../../schemas/session.schema";
import { flattenZodErrors } from "../../utils";
import {
    redirectToError,
    setCookieOnResponseObject,
    redirectTo,
    destroyCookieOnResponseObject,
} from "../../utils/apiUtils";
import logger from "../../utils/logger";

const login = async (req: NextApiRequest, res: NextApiResponse) => {
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

        const { email, password } = validatedBody.data;

        const authResponse = await initiateAuth(email, password);

        if (!authResponse.AuthenticationResult?.IdToken || !authResponse.AuthenticationResult?.RefreshToken) {
            throw new Error("Invalid auth response");
        }

        const { IdToken: idToken, RefreshToken: refreshToken } = authResponse.AuthenticationResult;

        setCookieOnResponseObject(COOKIES_ID_TOKEN, idToken, res);
        setCookieOnResponseObject(COOKIES_REFRESH_TOKEN, refreshToken, res);

        logger.info("", {
            context: "api.login",
            message: "login successful",
        });

        const session = sessionSchema.parse(decodeJwt(idToken));
        destroyCookieOnResponseObject(COOKIES_LOGIN_ERRORS, res);

        if (session?.isSystemAdmin) {
            redirectTo(res, SYSADMIN_MANAGE_ORGANISATIONS_PAGE_PATH);
            return;
        }
        redirectTo(res, DASHBOARD_PAGE_PATH);
        return;
    } catch (e) {
        if (e instanceof NotAuthorizedException) {
            setCookieOnResponseObject(
                COOKIES_LOGIN_ERRORS,
                JSON.stringify({
                    inputs: req.body as object,
                    errors: [
                        {
                            errorMessage: "Incorrect username or password",
                            id: "",
                        },
                    ],
                }),
                res,
            );

            redirectTo(res, LOGIN_PAGE_PATH);
            return;
        }
        if (e instanceof PasswordResetRequiredException) {
            setCookieOnResponseObject(
                COOKIES_LOGIN_ERRORS,
                JSON.stringify({
                    inputs: req.body as object,
                    errors: [
                        {
                            errorMessage: "Password reset required",
                            id: "",
                        },
                    ],
                }),
                res,
            );

            redirectTo(res, LOGIN_PAGE_PATH);
            return;
        }

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
