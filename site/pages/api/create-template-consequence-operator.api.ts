import { OperatorConsequence } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { operatorConsequenceSchema } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { NextApiRequest, NextApiResponse } from "next";
import { formatCreateConsequenceBody } from "./create-consequence-operator.api";
import {
    COOKIES_TEMPLATE_CONSEQUENCE_OPERATOR_ERRORS,
    CREATE_TEMPLATE_CONSEQUENCE_OPERATOR_PATH,
    DASHBOARD_PAGE_PATH,
    TEMPLATE_OVERVIEW_PAGE_PATH,
    REVIEW_TEMPLATE_PAGE_PATH,
    TYPE_OF_CONSEQUENCE_TEMPLATE_PAGE_PATH,
} from "../../constants";
import { upsertConsequence } from "../../data/dynamo";
import { flattenZodErrors, getLargestConsequenceIndex } from "../../utils";
import {
    destroyCookieOnResponseObject,
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

const createTemplateConsequenceOperator = async (
    req: OperatorConsequenceRequest,
    res: NextApiResponse,
): Promise<void> => {
    try {
        const session = getSession(req);
        const { addAnotherConsequence, draft } = req.query;

        const formattedBody = formatCreateConsequenceBody(req.body) as OperatorConsequence;

        if (!session) {
            throw new Error("No session found");
        }

        const validatedBody = operatorConsequenceSchema.safeParse(formattedBody);

        if (!validatedBody.success) {
            if (!formattedBody.disruptionId || !formattedBody.consequenceIndex) {
                throw new Error("No disruptionId or consequenceIndex found");
            }

            setCookieOnResponseObject(
                COOKIES_TEMPLATE_CONSEQUENCE_OPERATOR_ERRORS,
                JSON.stringify({
                    inputs: formattedBody,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );

            redirectTo(
                res,
                `${CREATE_TEMPLATE_CONSEQUENCE_OPERATOR_PATH}/${formattedBody.disruptionId}/${formattedBody.consequenceIndex}`,
            );
            return;
        }

        const template = await upsertConsequence(validatedBody.data, session.orgId, session.isOrgStaff, true);
        destroyCookieOnResponseObject(COOKIES_TEMPLATE_CONSEQUENCE_OPERATOR_ERRORS, res);

        const redirectPath =
            template?.publishStatus !== PublishStatus.draft ? TEMPLATE_OVERVIEW_PAGE_PATH : REVIEW_TEMPLATE_PAGE_PATH;

        if (addAnotherConsequence) {
            if (!template) {
                throw new Error("No template found to add another consequence");
            }
            const currentIndex = validatedBody.data.consequenceIndex;
            const largestIndex = getLargestConsequenceIndex(template);
            const nextIndex = currentIndex >= largestIndex ? currentIndex + 1 : largestIndex + 1;

            redirectTo(
                res,
                `${TYPE_OF_CONSEQUENCE_TEMPLATE_PAGE_PATH}/${validatedBody.data.disruptionId}/${nextIndex}`,
            );
            return;
        }

        if (draft) {
            redirectTo(res, DASHBOARD_PAGE_PATH);
            return;
        }
        redirectTo(res, `${redirectPath}/${validatedBody.data.disruptionId}`);
        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem adding a consequence operator template.";
            redirectToError(res, message, "api.create-template-consequence-operator", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default createTemplateConsequenceOperator;
