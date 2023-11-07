import { AttributeType, UsernameExistsException } from "@aws-sdk/client-cognito-identity-provider";
import { UserGroups } from "@create-disruptions-data/shared-ts/enums";
import { NextApiRequest, NextApiResponse } from "next";
import { ADD_USER_PAGE_PATH, COOKIES_ADD_USER_ERRORS, USER_MANAGEMENT_PAGE_PATH } from "../../../constants";
import { createUser } from "../../../data/cognito";
import { addUserSchemaRefined } from "../../../schemas/add-user.schema";
import { flattenZodErrors } from "../../../utils";
import {
    redirectToError,
    setCookieOnResponseObject,
    redirectTo,
    destroyCookieOnResponseObject,
    formatAddOrEditUserBody,
} from "../../../utils/apiUtils";
import { getSession } from "../../../utils/apiUtils/auth";

const addUser = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = getSession(req);

        if (!session) {
            throw new Error("No session found");
        }

        const formattedBody = formatAddOrEditUserBody(req.body as object);
        const validatedBody = addUserSchemaRefined.safeParse({
            ...formattedBody,
            orgId: session.orgId,
        });
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

        if (validatedBody.data.group === UserGroups.operators) {
            const operatorAttribute: AttributeType[] = [
                {
                    Name: "custom:operatorOrgId",
                    Value: validatedBody.data.operatorOrg?.operatorOrgId ?? "",
                },
            ];

            await createUser(validatedBody.data, operatorAttribute);
        } else {
            await createUser(validatedBody.data);
        }

        destroyCookieOnResponseObject(COOKIES_ADD_USER_ERRORS, res);
        redirectTo(res, USER_MANAGEMENT_PAGE_PATH);

        return;
    } catch (e) {
        if (e instanceof UsernameExistsException) {
            setCookieOnResponseObject(
                COOKIES_ADD_USER_ERRORS,
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

            redirectTo(res, ADD_USER_PAGE_PATH);
            return;
        }

        if (e instanceof Error) {
            const message = "There was a problem while adding a user.";
            redirectToError(res, message, "api.add-user", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default addUser;
