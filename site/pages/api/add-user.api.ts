import { NotAuthorizedException } from "@aws-sdk/client-cognito-identity-provider";
import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_CHANGE_PASSWORD_ERRORS,
    CHANGE_PASSWORD_PAGE_PATH,
    ADD_USER_PAGE_PATH,
    COOKIES_ADD_USER_ERRORS,
    USER_MANAGEMENT_PAGE_PATH,
} from "../../constants";
import { initiateAuth, updateUserPassword } from "../../data/cognito";
import { flattenZodErrors } from "../../utils";
import {
    redirectToError,
    setCookieOnResponseObject,
    redirectTo,
    destroyCookieOnResponseObject,
} from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";
import { addUserSchema } from "../../schemas/add-user.schema";

const addUser = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const validatedBody = addUserSchema.safeParse(req.body);
        if (!validatedBody.success) {
            setCookieOnResponseObject(
                COOKIES_ADD_USER_ERRORS,
                JSON.stringify({
                    inputs: req.body as object,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );

            redirectTo(res, ADD_USER_PAGE_PATH);
            return;
        }

        redirectTo(res, USER_MANAGEMENT_PAGE_PATH);
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
