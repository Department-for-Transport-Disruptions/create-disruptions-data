import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_CONSEQUENCE_OPERATOR_ERRORS,
    CREATE_CONSEQUENCE_OPERATOR_PATH,
    DISRUPTION_DETAIL_PAGE_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
} from "../../constants";
import { upsertConsequence } from "../../data/dynamo";
import { OperatorConsequence, operatorConsequenceSchema } from "../../schemas/consequence.schema";
import { flattenZodErrors } from "../../utils";
import {
    destroyCookieOnResponseObject,
    getReturnPage,
    redirectTo,
    redirectToError,
    setCookieOnResponseObject,
} from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";

interface OperatorConsequenceRequest extends NextApiRequest {
    body: OperatorConsequence & {
        consequenceOperators: string;
    };
}

const createConsequenceOperator = async (req: OperatorConsequenceRequest, res: NextApiResponse): Promise<void> => {
    try {
        const queryParam = getReturnPage(req);
        const consequenceOperatorsData = req.body.consequenceOperators;
        const session = getSession(req);

        if (!session) {
            throw new Error("No session found");
        }

        const consequenceOperators: string[] =
            !!consequenceOperatorsData && consequenceOperatorsData.includes(",")
                ? consequenceOperatorsData.split(",")
                : !!consequenceOperatorsData
                ? [consequenceOperatorsData]
                : [];

        const consequence: OperatorConsequence = {
            ...req.body,
            consequenceOperators,
        };

        const validatedBody = operatorConsequenceSchema.safeParse(consequence);

        if (!validatedBody.success) {
            if (!consequence.disruptionId || !consequence.consequenceIndex) {
                throw new Error("No disruptionId or consequenceIndex found");
            }

            setCookieOnResponseObject(
                COOKIES_CONSEQUENCE_OPERATOR_ERRORS,
                JSON.stringify({
                    inputs: consequence,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );

            redirectTo(
                res,
                `${CREATE_CONSEQUENCE_OPERATOR_PATH}/${consequence.disruptionId}/${consequence.consequenceIndex}${
                    queryParam ? `?${queryParam}` : ""
                }`,
            );
            return;
        }

        await upsertConsequence(validatedBody.data, session.orgId);
        destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_OPERATOR_ERRORS, res);

        const redirectPath =
            queryParam && decodeURIComponent(queryParam).includes(DISRUPTION_DETAIL_PAGE_PATH)
                ? DISRUPTION_DETAIL_PAGE_PATH
                : REVIEW_DISRUPTION_PAGE_PATH;

        redirectTo(res, `${redirectPath}/${validatedBody.data.disruptionId}`);
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
