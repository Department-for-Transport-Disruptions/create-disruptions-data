import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_CONSEQUENCE_OPERATOR_ERRORS,
    COOKIES_CONSEQUENCE_OPERATOR_INFO,
    CREATE_CONSEQUENCE_OPERATOR_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
} from "../../constants";
import { createConsequenceOperatorSchemaRefined } from "../../schemas/create-consequence-operator.schema";
import {
    destroyCookieOnResponseObject,
    redirectTo,
    redirectToError,
    setCookieOnResponseObject,
    flattenZodErrors,
} from "../../utils/apiUtils";

const createConsequenceOperator = (req: NextApiRequest, res: NextApiResponse): void => {
    try {
        const validatedBody = createConsequenceOperatorSchemaRefined.safeParse(req.body);

        console.log("errors---", flattenZodErrors(validatedBody.error));

        if (!validatedBody.success) {
            setCookieOnResponseObject(
                COOKIES_CONSEQUENCE_OPERATOR_ERRORS,
                JSON.stringify({
                    inputs: req.body as object,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );
            destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_OPERATOR_INFO, res);
            redirectTo(res, CREATE_CONSEQUENCE_OPERATOR_PATH);
            return;
        }

        setCookieOnResponseObject(COOKIES_CONSEQUENCE_OPERATOR_INFO, JSON.stringify(validatedBody.data), res);
        destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_OPERATOR_ERRORS, res);

        redirectTo(res, REVIEW_DISRUPTION_PAGE_PATH);
        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem adding a consequence operator.";
            redirectToError(res, message, "api.create-consequence-operator", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default createConsequenceOperator;
