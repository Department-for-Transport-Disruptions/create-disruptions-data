import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_TEMPLATE_OVERVIEW_ERRORS,
    ERROR_PATH,
    TEMPLATE_OVERVIEW_PAGE_PATH,
    VIEW_ALL_TEMPLATES_PAGE_PATH,
} from "../../constants";
import {
    deleteDisruptionsInEdit,
    getDisruptionById,
    insertPublishedDisruptionIntoDynamoAndUpdateDraft,
    publishEditedConsequencesAndSocialMediaPosts,
    deleteDisruptionsInPending,
    getOrganisationInfoById,
} from "../../data/dynamo";
import { publishDisruptionSchema, publishSchema } from "../../schemas/publish.schema";
import { flattenZodErrors } from "../../utils";
import { cleardownCookies, redirectTo, redirectToError, setCookieOnResponseObject } from "../../utils/apiUtils";
import { canPublish, getSession } from "../../utils/apiUtils/auth";
import logger from "../../utils/logger";

const publishEditTemplate = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const validatedBody = publishSchema.safeParse(req.body);
        const session = getSession(req);

        if (!validatedBody.success || !session) {
            redirectTo(res, ERROR_PATH);
            return;
        }

        const [draftDisruption, orgInfo] = await Promise.all([
            getDisruptionById(validatedBody.data.disruptionId, session.orgId, true),
            getOrganisationInfoById(session.orgId),
        ]);

        if (!orgInfo) {
            logger.error(`Organisation info not found for Org Id ${session.orgId}`);
            redirectTo(res, ERROR_PATH);
            return;
        }
        if (!draftDisruption || Object.keys(draftDisruption).length === 0) {
            logger.error(`Disruption ${validatedBody.data.disruptionId} not found to publish`);
            redirectTo(res, ERROR_PATH);

            return;
        }

        const validatedDisruptionBody = publishDisruptionSchema.safeParse(draftDisruption);

        if (!validatedDisruptionBody.success) {
            setCookieOnResponseObject(
                COOKIES_TEMPLATE_OVERVIEW_ERRORS,
                JSON.stringify(flattenZodErrors(validatedDisruptionBody.error)),
                res,
            );

            redirectTo(res, `${TEMPLATE_OVERVIEW_PAGE_PATH}/${validatedBody.data.disruptionId}`);
            return;
        }

        await publishEditedConsequencesAndSocialMediaPosts(draftDisruption.disruptionId, session.orgId, true);

        await Promise.all([
            deleteDisruptionsInEdit(draftDisruption.disruptionId, session.orgId, true),
            deleteDisruptionsInPending(draftDisruption.disruptionId, session.orgId, true),
        ]);

        await insertPublishedDisruptionIntoDynamoAndUpdateDraft(
            draftDisruption,
            session.orgId,
            canPublish(session) ? PublishStatus.published : PublishStatus.pendingApproval,
            session.name,
            undefined,
            true,
        );

        cleardownCookies(req, res);

        redirectTo(res, VIEW_ALL_TEMPLATES_PAGE_PATH);
        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem publishing the edited template.";
            redirectToError(res, message, "api.publish-edit-template", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default publishEditTemplate;
