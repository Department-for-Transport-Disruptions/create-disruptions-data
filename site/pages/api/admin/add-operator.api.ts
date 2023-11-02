import { NextApiRequest, NextApiResponse } from "next";
import { ADD_OPERATOR_PAGE_PATH, COOKIES_ADD_OPERATOR_ERRORS, USER_MANAGEMENT_PAGE_PATH } from "../../../constants";
import { createOperatorSubOrganisation, listOperatorsForOrg } from "../../../data/dynamo";
import { addOperatorSchema } from "../../../schemas/add-operator.schema";
import { Operator } from "../../../schemas/consequence.schema";
import { flattenZodErrors } from "../../../utils";
import {
    destroyCookieOnResponseObject,
    redirectTo,
    redirectToError,
    setCookieOnResponseObject,
} from "../../../utils/apiUtils";
import { getSession } from "../../../utils/apiUtils/auth";

export const formatAddOperatorBody = (body: object) => {
    const nocCodes = Object.entries(body)
        .filter((item) => item[0].startsWith("nocCodes"))
        .map((arr: string[]) => {
            const [, values] = arr;
            return JSON.parse(values) as Pick<Operator, "id" | "operatorPublicName" | "nocCode">;
        });

    const cleansedBody = Object.fromEntries(Object.entries(body).filter((item) => !item[0].startsWith("nocCodes")));

    return {
        ...cleansedBody,
        nocCodes,
    };
};

const addOperator = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = getSession(req);

        if (!session) {
            throw new Error("No session found");
        }

        const cleansedBody = formatAddOperatorBody(req.body as object);

        const validatedBody = addOperatorSchema.safeParse({ ...cleansedBody, orgId: session.orgId });
        if (!validatedBody.success) {
            setCookieOnResponseObject(
                COOKIES_ADD_OPERATOR_ERRORS,
                JSON.stringify({
                    inputs: cleansedBody as object,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );

            redirectTo(res, ADD_OPERATOR_PAGE_PATH);
            return;
        }

        const existingOperators = await listOperatorsForOrg(validatedBody.data.orgId);
        if (existingOperators && existingOperators?.length > 0) {
            const operatorAlreadyExists = existingOperators.some(
                (operator) => operator.name.toLowerCase() === validatedBody.data.operatorName.toLowerCase(),
            );
            if (operatorAlreadyExists) {
                setCookieOnResponseObject(
                    COOKIES_ADD_OPERATOR_ERRORS,
                    JSON.stringify({
                        inputs: cleansedBody as object,
                        errors: [
                            {
                                errorMessage: "An operator with this name already exists.",
                                id: "operatorName",
                            },
                        ],
                    }),
                    res,
                );

                redirectTo(res, ADD_OPERATOR_PAGE_PATH);
                return;
            }
        }

        const nocCodesList = validatedBody.data.nocCodes.map((operator) => {
            return operator.nocCode;
        });

        await createOperatorSubOrganisation(validatedBody.data.orgId, validatedBody.data.operatorName, nocCodesList);

        destroyCookieOnResponseObject(COOKIES_ADD_OPERATOR_ERRORS, res);
        redirectTo(res, USER_MANAGEMENT_PAGE_PATH);
        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem while adding an operator.";
            redirectToError(res, message, "api.add-operator", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default addOperator;
