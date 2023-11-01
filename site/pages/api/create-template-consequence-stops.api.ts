import { StopsConsequence } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { stopsConsequenceSchema } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { NextApiRequest, NextApiResponse } from "next";
import { formatCreateConsequenceStopsBody } from "./create-consequence-stops.api";
import {
    COOKIES_TEMPLATE_CONSEQUENCE_STOPS_ERRORS,
    CREATE_TEMPLATE_CONSEQUENCE_STOPS_PATH,
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

const createTemplateConsequenceStops = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const { addAnotherConsequence, draft } = req.query;

        const formattedBody = formatCreateConsequenceStopsBody(req.body as object);

        const validatedBody = stopsConsequenceSchema.safeParse(formattedBody);

        const session = getSession(req);

        if (!session) {
            throw new Error("No session found");
        }

        if (!validatedBody.success) {
            const body = req.body as StopsConsequence;

            if (!body.disruptionId || !body.consequenceIndex) {
                throw new Error("No disruptionId or consequenceIndex found");
            }

            setCookieOnResponseObject(
                COOKIES_TEMPLATE_CONSEQUENCE_STOPS_ERRORS,
                JSON.stringify({
                    inputs: formattedBody,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );

            redirectTo(res, `${CREATE_TEMPLATE_CONSEQUENCE_STOPS_PATH}/${body.disruptionId}/${body.consequenceIndex}`);
            return;
        }

        const template = await upsertConsequence(validatedBody.data, session.orgId, session.isOrgStaff, true);
        destroyCookieOnResponseObject(COOKIES_TEMPLATE_CONSEQUENCE_STOPS_ERRORS, res);

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
            const message = "There was a problem adding a consequence stops template.";
            redirectToError(res, message, "api.create-template-consequence-stops", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default createTemplateConsequenceStops;
