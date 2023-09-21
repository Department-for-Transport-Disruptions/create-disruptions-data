import { ConsequenceOperators, OperatorConsequence } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { operatorConsequenceSchema } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_CONSEQUENCE_OPERATOR_ERRORS,
    CREATE_CONSEQUENCE_OPERATOR_PATH,
    DASHBOARD_PAGE_PATH,
    DISRUPTION_DETAIL_PAGE_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
} from "../../constants";
import { upsertConsequence } from "../../data/dynamo";
import { flattenZodErrors } from "../../utils";
import {
    destroyCookieOnResponseObject,
    getReturnPage,
    isDisruptionFromTemplate,
    redirectTo,
    redirectToError,
    redirectToWithQueryParams,
    setCookieOnResponseObject,
} from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";

interface OperatorConsequenceRequest extends NextApiRequest {
    body: OperatorConsequence & {
        consequenceOperators: string;
    };
}

export const formatCreateConsequenceBody = (body: object) => {
    const consequenceOperators = Object.entries(body)
        .filter((item) => item.toString().startsWith("consequenceOperators"))
        .map((arr: string[]) => {
            const [, values] = arr;
            return JSON.parse(values) as ConsequenceOperators[];
        });

    const cleansedBody = Object.fromEntries(
        Object.entries(body).filter(
            (item) => !item.toString().startsWith("stop") && !item.toString().startsWith("service"),
        ),
    );

    return {
        ...cleansedBody,
        consequenceOperators: consequenceOperators.flat(),
    };
};

const createConsequenceOperator = async (req: OperatorConsequenceRequest, res: NextApiResponse): Promise<void> => {
    try {
        const queryParam = getReturnPage(req);
        const isFromTemplate = isDisruptionFromTemplate(req);
        const session = getSession(req);
        const { template, addAnotherConsequence } = req.query;

        const { draft } = req.query;

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
                COOKIES_CONSEQUENCE_OPERATOR_ERRORS,
                JSON.stringify({
                    inputs: formattedBody,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );

            redirectToWithQueryParams(
                req,
                res,
                template ? ["template"] : [],
                `${CREATE_CONSEQUENCE_OPERATOR_PATH}/${formattedBody.disruptionId}/${formattedBody.consequenceIndex}`,
                queryParam ? [queryParam] : [],
            );
            return;
        }

        await upsertConsequence(validatedBody.data, session.orgId, session.isOrgStaff, template === "true");
        destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_OPERATOR_ERRORS, res);

        const redirectPath =
            (!isFromTemplate || template) &&
            queryParam &&
            decodeURIComponent(queryParam).includes(DISRUPTION_DETAIL_PAGE_PATH)
                ? DISRUPTION_DETAIL_PAGE_PATH
                : REVIEW_DISRUPTION_PAGE_PATH;

        if (addAnotherConsequence) {
            redirectToWithQueryParams(
                req,
                res,
                template ? ["template"] : [],
                `${TYPE_OF_CONSEQUENCE_PAGE_PATH}/${validatedBody.data.disruptionId}/${
                    validatedBody.data.consequenceIndex + 1
                }`,
                queryParam ? [queryParam] : [],
            );
        }

        if (draft) {
            redirectTo(res, DASHBOARD_PAGE_PATH);
            return;
        }
        redirectToWithQueryParams(
            req,
            res,
            template ? ["template"] : [],
            `${redirectPath}/${validatedBody.data.disruptionId}`,
            queryParam ? [queryParam] : [],
        );
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
