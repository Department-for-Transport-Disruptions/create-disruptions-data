import { NetworkConsequence } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { networkConsequenceSchema } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_CONSEQUENCE_NETWORK_ERRORS,
    CREATE_CONSEQUENCE_NETWORK_PATH,
    DASHBOARD_PAGE_PATH,
    DISRUPTION_DETAIL_PAGE_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
} from "../../constants";
import { upsertConsequence } from "../../data/dynamo";
import { flattenZodErrors, getQueryParams } from "../../utils";
import {
    destroyCookieOnResponseObject,
    redirectTo,
    redirectToError,
    setCookieOnResponseObject,
} from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";

const createConsequenceNetwork = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const { template, return: returnPath, draft } = req.query;
        const queryParams = getQueryParams(
            template === "true",
            returnPath ? decodeURIComponent(returnPath as string) : "",
        );
        const validatedBody = networkConsequenceSchema.safeParse(req.body);
        const session = getSession(req);

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

            redirectTo(
                res,
                `${CREATE_CONSEQUENCE_NETWORK_PATH}/${body.disruptionId}/${body.consequenceIndex}${queryParams}`,
            );

            return;
        }

        await upsertConsequence(validatedBody.data, session.orgId, session.isOrgStaff, template === "true");
        destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_NETWORK_ERRORS, res);

        const redirectPath = decodeURIComponent(returnPath as string).includes(DISRUPTION_DETAIL_PAGE_PATH)
            ? DISRUPTION_DETAIL_PAGE_PATH
            : REVIEW_DISRUPTION_PAGE_PATH;

        if (draft) {
            redirectTo(res, DASHBOARD_PAGE_PATH);
            return;
        }

        redirectTo(res, `${redirectPath}/${validatedBody.data.disruptionId}${queryParams}`);

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
