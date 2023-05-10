import { NotAuthorizedException } from "@aws-sdk/client-cognito-identity-provider";
import { NextApiRequest, NextApiResponse } from "next";
import { COOKIES_CHANGE_PASSWORD_ERRORS, CHANGE_PASSWORD_PAGE_PATH } from "../../constants";
import { initiateAuth, updateUserPassword } from "../../data/cognito";
import { changePasswordSchemaRefined } from "../../schemas/change-password.schema";
import { flattenZodErrors } from "../../utils";
import {
    redirectToError,
    setCookieOnResponseObject,
    redirectTo,
    destroyCookieOnResponseObject,
} from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";

const changePassword = async (req: NextApiRequest, res: NextApiResponse) => {
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
            const { currentPassword, newPassword } = validatedBody.data;
            const session = getSession(req);

            if (!session) {
                throw new Error("No session found");
            }

            const authResponse = await initiateAuth(session.email, currentPassword);

            if (authResponse?.AuthenticationResult) {
                await updateUserPassword(newPassword, session.email);
            } else {
                throw new Error("Auth response invalid");
            }
            destroyCookieOnResponseObject(COOKIES_CHANGE_PASSWORD_ERRORS, res);
        }

        redirectTo(res, `${CHANGE_PASSWORD_PAGE_PATH}${validatedBody.success ? "?success=true" : ""}`);
        return;
    } catch (e) {
        if (e instanceof NotAuthorizedException) {
            setCookieOnResponseObject(
                COOKIES_CHANGE_PASSWORD_ERRORS,
                JSON.stringify({
                    inputs: req.body as object,
                    errors: [
                        {
                            errorMessage: "Incorrect current password",
                            id: "",
                        },
                    ],
                }),
                res,
            );

            redirectTo(res, CHANGE_PASSWORD_PAGE_PATH);
            return;
        }

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
