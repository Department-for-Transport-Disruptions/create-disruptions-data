import { UserGroups } from "@create-disruptions-data/shared-ts/enums";
import { NextApiRequest, NextApiResponse } from "next";
import { COOKIES_EDIT_USER_ERRORS, EDIT_USER_PAGE_PATH, USER_MANAGEMENT_PAGE_PATH } from "../../../constants";
import { addUserToGroup, removeUserFromGroup, updateUserCustomAttributes } from "../../../data/cognito";
import { EditUserSchema, editUserSchema, OperatorData } from "../../../schemas/add-user.schema";
import { flattenZodErrors } from "../../../utils";
import {
    redirectToError,
    setCookieOnResponseObject,
    redirectTo,
    destroyCookieOnResponseObject,
} from "../../../utils/apiUtils";
import { getSession } from "../../../utils/apiUtils/auth";

export const formatAddUserBody = (body: object) => {
    const operatorNocCodes = Object.entries(body)
        .filter((item) => item.toString().startsWith("operatorNocCodes"))
        .map((arr: string[]) => {
            const [, values] = arr;
            return JSON.parse(values) as OperatorData;
        });

    const cleansedBody = Object.fromEntries(
        Object.entries(body).filter((item) => !item.toString().startsWith("operatorNocCodes")),
    );

    return {
        ...cleansedBody,
        operatorNocCodes,
    };
};

const editUser = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = getSession(req);

        if (!session) {
            throw new Error("No session found");
        }

        const cleansedBody = formatAddUserBody(req.body as object);

        const validatedBody = editUserSchema.safeParse({ ...cleansedBody, orgId: session.orgId });
        if (!validatedBody.success) {
            const body = req.body as EditUserSchema;

            if (!body.username) {
                throw new Error("No username found");
            }
            setCookieOnResponseObject(
                COOKIES_EDIT_USER_ERRORS,
                JSON.stringify({
                    inputs: req.body as object,
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
            { Name: "custom:nocCodes", Value: "" },
        ];

        if (validatedBody.data.group === UserGroups.operators) {
            const nocCodes = validatedBody.data.operatorNocCodes?.map((operator) => operator.nocCode) ?? [];
            attributesList[2] = { Name: "custom:nocCodes", Value: nocCodes.toString() };
        }

        if (validatedBody.data.initialGroup !== validatedBody.data.group) {
            await removeUserFromGroup(validatedBody.data.username, validatedBody.data.initialGroup);
            await addUserToGroup(validatedBody.data.username, validatedBody.data.group);
        }

        await updateUserCustomAttributes(validatedBody.data.username, attributesList);

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
