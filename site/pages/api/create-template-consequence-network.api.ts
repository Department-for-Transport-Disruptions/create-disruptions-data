import { NetworkConsequence } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { networkConsequenceSchema } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_CONSEQUENCE_NETWORK_ERRORS,
    COOKIES_TEMPLATE_CONSEQUENCE_NETWORK_ERRORS,
    CREATE_TEMPLATE_CONSEQUENCE_NETWORK_PATH,
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

const createTemplateConsequenceNetwork = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const { addAnotherConsequence, draft } = req.query;
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
                COOKIES_TEMPLATE_CONSEQUENCE_NETWORK_ERRORS,
                JSON.stringify({
                    inputs: body,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );

            redirectTo(
                res,
                `${CREATE_TEMPLATE_CONSEQUENCE_NETWORK_PATH}/${body.disruptionId}/${body.consequenceIndex}`,
            );
            return;
        }

        const template = await upsertConsequence(validatedBody.data, session.orgId, session.isOrgStaff, true);
        destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_NETWORK_ERRORS, res);

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

        const redirectPath =
            template?.publishStatus === PublishStatus.draft ? REVIEW_TEMPLATE_PAGE_PATH : TEMPLATE_OVERVIEW_PAGE_PATH;

        redirectTo(res, `${redirectPath}/${validatedBody.data.disruptionId}`);
        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem adding a consequence network template.";
            redirectToError(res, message, "api.create-template-consequence-network", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default createTemplateConsequenceNetwork;
