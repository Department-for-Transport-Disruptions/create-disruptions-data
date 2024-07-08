import { UsernameExistsException } from "@aws-sdk/client-cognito-identity-provider";
import { NextApiRequest, NextApiResponse } from "next";
import { COOKIES_ADD_ADMIN_USER_ERRORS, SYSADMIN_ADD_USERS_PAGE_PATH } from "../../../constants";
import { createUser } from "../../../data/cognito";
import { addUserSchema } from "../../../schemas/add-user.schema";
import { orgIdSchema } from "../../../schemas/user-management.schema";
import { flattenZodErrors } from "../../../utils";
import {
    destroyCookieOnResponseObject,
    redirectTo,
    redirectToError,
    setCookieOnResponseObject,
} from "../../../utils/apiUtils";
import { getSession } from "../../../utils/apiUtils/auth";

const createAdminUser = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const session = getSession(req);

        if (!session) {
            throw new Error("No session found");
        }
        if (!session.isSystemAdmin) {
            throw new Error("Invalid user accessing the page");
        }

        const validatedBody = addUserSchema.safeParse(req.body);
        if (!validatedBody.success) {
            setCookieOnResponseObject(
                COOKIES_ADD_ADMIN_USER_ERRORS,
                JSON.stringify({
                    inputs: req.body as object,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );

            redirectToAdminUsersPage(req, res);
            return;
        }

        await createUser(validatedBody.data);

        destroyCookieOnResponseObject(COOKIES_ADD_ADMIN_USER_ERRORS, res);
        redirectTo(res, `${SYSADMIN_ADD_USERS_PAGE_PATH}?orgId=${validatedBody.data.orgId}`);
        return;
    } catch (e) {
        if (e instanceof UsernameExistsException) {
            setCookieOnResponseObject(
                COOKIES_ADD_ADMIN_USER_ERRORS,
                JSON.stringify({
                    inputs: req.body as object,
                    errors: [
                        {
                            errorMessage: "This email address is already in use",
                            id: "email",
                        },
                    ],
                }),
                res,
            );

            redirectToAdminUsersPage(req, res);
            return;
        }

        if (e instanceof Error) {
            const message = "There was a problem while adding an admin user.";
            redirectToError(res, message, "api.sysadmin-users", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

const redirectToAdminUsersPage = (req: NextApiRequest, res: NextApiResponse) => {
    const orgData = orgIdSchema.safeParse(req.body);

    if (orgData.success) {
        redirectTo(res, `${SYSADMIN_ADD_USERS_PAGE_PATH}?orgId=${orgData.data.orgId}`);
        return;
    }
    throw new Error("Org ID not found");
};

export default createAdminUser;
