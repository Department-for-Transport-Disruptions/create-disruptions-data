import { UserGroups } from "@create-disruptions-data/shared-ts/enums";
import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_EDIT_USER_ERRORS,
    COOKIES_ID_TOKEN,
    COOKIES_REFRESH_TOKEN,
    EDIT_USER_PAGE_PATH,
    LOGIN_PAGE_PATH,
    USER_MANAGEMENT_PAGE_PATH,
} from "../../../constants";
import { addUserToGroup, removeUserFromGroup, updateUserAttributes } from "../../../data/cognito";
import { EditUserSchema, editUserSchema } from "../../../schemas/add-user.schema";
import { flattenZodErrors } from "../../../utils";
import {
    redirectToError,
    setCookieOnResponseObject,
    redirectTo,
    destroyCookieOnResponseObject,
    formatAddOrEditUserBody,
} from "../../../utils/apiUtils";
import { getSession } from "../../../utils/apiUtils/auth";

const editUser = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = getSession(req);

        if (!session) {
            throw new Error("No session found");
        }

        const cleansedBody = formatAddOrEditUserBody(req.body as object);

        const validatedBody = editUserSchema.safeParse({ ...cleansedBody, orgId: session.orgId });
        if (!validatedBody.success) {
            const body = req.body as EditUserSchema;

            if (!body.username) {
                throw new Error("No username found");
            }

            setCookieOnResponseObject(
                COOKIES_EDIT_USER_ERRORS,
                JSON.stringify({
                    inputs: cleansedBody as object,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );

            redirectTo(res, `${EDIT_USER_PAGE_PATH}/${body.username}`);
            return;
        }

        const attributesList = [
            { Name: "given_name", Value: validatedBody.data.givenName },
            { Name: "family_name", Value: validatedBody.data.familyName },
            { Name: "custom:operatorOrgId", Value: validatedBody.data.operatorOrg?.operatorOrgId ?? "" },
        ];

        await updateUserAttributes(validatedBody.data.username, attributesList);

        if (validatedBody.data.initialGroup !== validatedBody.data.group) {
            await removeUserFromGroup(validatedBody.data.username, validatedBody.data.initialGroup);
            await addUserToGroup(validatedBody.data.username, validatedBody.data.group);
        }

        if (
            session.username === validatedBody.data.username &&
            validatedBody.data.initialGroup !== validatedBody.data.group &&
            validatedBody.data.initialGroup === UserGroups.orgAdmins
        ) {
            destroyCookieOnResponseObject(COOKIES_ID_TOKEN, res);
            destroyCookieOnResponseObject(COOKIES_REFRESH_TOKEN, res);
            redirectTo(res, LOGIN_PAGE_PATH);
            return;
        }

        destroyCookieOnResponseObject(COOKIES_EDIT_USER_ERRORS, res);
        redirectTo(res, USER_MANAGEMENT_PAGE_PATH);
        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem while editing a user.";
            redirectToError(res, message, "api.edit-user", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default editUser;
