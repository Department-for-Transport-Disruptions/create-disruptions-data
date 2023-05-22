import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { NextApiRequest, NextApiResponse } from "next";
import { COOKIES_DISRUPTION_DETAIL_ERRORS, DISRUPTION_DETAIL_PAGE_PATH, ERROR_PATH } from "../../constants";
import {
    deleteDisruptionsInEdit,
    deleteDisruptionsInPending,
    getDisruptionById,
    insertPublishedDisruptionIntoDynamoAndUpdateDraft,
} from "../../data/dynamo";
import { publishDisruptionSchema, publishSchema } from "../../schemas/publish.schema";
import { flattenZodErrors } from "../../utils";
import { cleardownCookies, redirectTo, redirectToError, setCookieOnResponseObject } from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";
import logger from "../../utils/logger";
import { getPtSituationElementFromDraft } from "../../utils/siri";

const reject = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const validatedBody = publishSchema.safeParse(req.body);
        const session = getSession(req);

        if (!validatedBody.success || !session) {
            redirectTo(res, ERROR_PATH);
            return;
        }

        const draftDisruption = await getDisruptionById(validatedBody.data.disruptionId, session.orgId);

        if (!draftDisruption || Object.keys(draftDisruption).length === 0) {
            logger.error(`Disruption ${validatedBody.data.disruptionId} not found to publish`);
            redirectTo(res, ERROR_PATH);

            return;
        }

        const validatedDisruptionBody = publishDisruptionSchema.safeParse(draftDisruption);

        if (!validatedDisruptionBody.success) {
            setCookieOnResponseObject(
                COOKIES_DISRUPTION_DETAIL_ERRORS,
                JSON.stringify(flattenZodErrors(validatedDisruptionBody.error)),
                res,
            );

            redirectTo(res, `${DISRUPTION_DETAIL_PAGE_PATH}/${validatedBody.data.disruptionId}`);
            return;
        }

        await Promise.all([
            deleteDisruptionsInEdit(draftDisruption.disruptionId, session.orgId),
            deleteDisruptionsInPending(draftDisruption.disruptionId, session.orgId),
        ]);

        const isEditPendingDsp =
            draftDisruption.publishStatus === PublishStatus.pendingAndEditing ||
            draftDisruption.publishStatus === PublishStatus.editPendingApproval;

        if (!isEditPendingDsp) {
            await insertPublishedDisruptionIntoDynamoAndUpdateDraft(
                getPtSituationElementFromDraft(draftDisruption),
                draftDisruption,
                session.orgId,
                PublishStatus.rejected,
            );
        }

        cleardownCookies(req, res);

        redirectTo(res, "/dashboard");
        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem rejecting the disruption.";
            redirectToError(res, message, "api.reject", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default reject;
