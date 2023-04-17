import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_CONSEQUENCE_OPERATOR_ERRORS,
    CREATE_CONSEQUENCE_OPERATOR_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
} from "../../constants";
import { upsertConsequence } from "../../data/dynamo";
import { OperatorConsequence, operatorConsequenceSchema } from "../../schemas/consequence.schema";
import { flattenZodErrors } from "../../utils";
import {
    destroyCookieOnResponseObject,
    redirectTo,
    redirectToError,
    setCookieOnResponseObject,
} from "../../utils/apiUtils";

const createConsequenceOperator = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const queryParam = req.headers.referer?.split("?")[1] || "";

        const validatedBody = operatorConsequenceSchema.safeParse(req.body);

        if (!validatedBody.success) {
            const body = req.body as OperatorConsequence;

            if (!body.disruptionId || !body.consequenceIndex) {
                throw new Error("No disruptionId or consequenceIndex found");
            }

            setCookieOnResponseObject(
                COOKIES_CONSEQUENCE_OPERATOR_ERRORS,
                JSON.stringify({
                    inputs: body,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );

            queryParam
                ? redirectTo(
                      res,
                      `${CREATE_CONSEQUENCE_OPERATOR_PATH}/${body.disruptionId}/${body.consequenceIndex}?${queryParam}`,
                  )
                : redirectTo(res, `${CREATE_CONSEQUENCE_OPERATOR_PATH}/${body.disruptionId}/${body.consequenceIndex}`);
            return;
        }

        await upsertConsequence(validatedBody.data);
        destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_OPERATOR_ERRORS, res);

        redirectTo(res, `${REVIEW_DISRUPTION_PAGE_PATH}/${validatedBody.data.disruptionId}`);
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
