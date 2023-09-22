import { NetworkConsequence } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { networkConsequenceSchema } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_CONSEQUENCE_NETWORK_ERRORS,
    CREATE_CONSEQUENCE_NETWORK_PATH,
    DASHBOARD_PAGE_PATH,
    DISRUPTION_DETAIL_PAGE_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
} from "../../constants";
import { getDisruptionById, upsertConsequence } from "../../data/dynamo";
import { flattenZodErrors, getLargestConsequenceIndex } from "../../utils";
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

const createConsequenceNetwork = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const queryParam = getReturnPage(req);
        const isFromTemplate = isDisruptionFromTemplate(req);
        const { template, addAnotherConsequence } = req.query;
        const validatedBody = networkConsequenceSchema.safeParse(req.body);
        const session = getSession(req);

        const { draft } = req.query;

        if (!session) {
            throw new Error("No session found");
        }

        if (!validatedBody.success) {
            const body = req.body as NetworkConsequence;

            if (!body.disruptionId || !body.consequenceIndex) {
                throw new Error("No disruptionId or consequenceIndex found");
            }

            setCookieOnResponseObject(
                COOKIES_CONSEQUENCE_NETWORK_ERRORS,
                JSON.stringify({
                    inputs: body,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );

            redirectToWithQueryParams(
                req,
                res,
                template ? ["template"] : [],
                `${CREATE_CONSEQUENCE_NETWORK_PATH}/${body.disruptionId}/${body.consequenceIndex}`,
                queryParam ? [queryParam] : [],
            );
            return;
        }

        const disruption = await upsertConsequence(
            validatedBody.data,
            session.orgId,
            session.isOrgStaff,
            template === "true",
        );
        destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_NETWORK_ERRORS, res);

        const redirectPath =
            (!isFromTemplate || template) &&
            queryParam &&
            decodeURIComponent(queryParam).includes(DISRUPTION_DETAIL_PAGE_PATH)
                ? DISRUPTION_DETAIL_PAGE_PATH
                : REVIEW_DISRUPTION_PAGE_PATH;

        if (addAnotherConsequence) {
            if (!disruption) {
                throw new Error("No disruption found to add another consequence");
            }
            const nextIndex = getLargestConsequenceIndex(disruption) + 1;
            redirectToWithQueryParams(
                req,
                res,
                template ? ["template"] : [],
                `${TYPE_OF_CONSEQUENCE_PAGE_PATH}/${validatedBody.data.disruptionId}/${nextIndex}`,
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
            const message = "There was a problem adding a consequence network.";
            redirectToError(res, message, "api.create-consequence-network", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default createConsequenceNetwork;
