import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_DISRUPTION_DETAIL_ERRORS,
    ERROR_PATH,
    TEMPLATE_OVERVIEW_PAGE_PATH,
    VIEW_ALL_TEMPLATES_PAGE_PATH,
} from "../../constants";
import {
    deleteDisruptionsInEdit,
    getDisruptionById,
    insertPublishedDisruptionIntoDynamoAndUpdateDraft,
    publishEditedConsequencesAndSocialMediaPosts,
    publishEditedConsequencesAndSocialMediaPostsIntoPending,
    publishPendingConsequencesAndSocialMediaPosts,
    deleteDisruptionsInPending,
    updatePendingDisruptionStatus,
    getOrganisationInfoById,
} from "../../data/dynamo";
import { publishDisruptionSchema, publishSchema } from "../../schemas/publish.schema";
import { flattenZodErrors } from "../../utils";
import { cleardownCookies, redirectTo, redirectToError, setCookieOnResponseObject } from "../../utils/apiUtils";
import { canPublish, getSession } from "../../utils/apiUtils/auth";
import logger from "../../utils/logger";

const publishEdit = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const validatedBody = publishSchema.safeParse(req.body);
        const session = getSession(req);

        if (!validatedBody.success || !session) {
            redirectTo(res, ERROR_PATH);
            return;
        }

        const [draftTemplate, orgInfo] = await Promise.all([
            getDisruptionById(validatedBody.data.disruptionId, session.orgId, true),
            getOrganisationInfoById(session.orgId),
        ]);

        if (!orgInfo) {
            logger.error(`Organisation info not found for Org Id ${session.orgId}`);
            redirectTo(res, ERROR_PATH);
            return;
        }
        if (!draftTemplate || Object.keys(draftTemplate).length === 0) {
            logger.error(`Template ${validatedBody.data.disruptionId} not found to publish`);
            redirectTo(res, ERROR_PATH);

            return;
        }

        const validatedDisruptionBody = publishDisruptionSchema.safeParse(draftTemplate);

        if (!validatedDisruptionBody.success) {
            setCookieOnResponseObject(
                COOKIES_DISRUPTION_DETAIL_ERRORS,
                JSON.stringify(flattenZodErrors(validatedDisruptionBody.error)),
                res,
            );

            redirectTo(res, `${TEMPLATE_OVERVIEW_PAGE_PATH}/${validatedBody.data.disruptionId}`);
            return;
        }

        const isEditPendingDsp =
            draftTemplate.publishStatus === PublishStatus.pendingAndEditing ||
            draftTemplate.publishStatus === PublishStatus.editPendingApproval;

        if (isEditPendingDsp) {
            await publishEditedConsequencesAndSocialMediaPostsIntoPending(
                draftTemplate.disruptionId,
                session.orgId,
                true,
            );
        } else {
            await publishEditedConsequencesAndSocialMediaPosts(draftTemplate.disruptionId, session.orgId, true);
        }

        if (isEditPendingDsp)
            await publishPendingConsequencesAndSocialMediaPosts(draftTemplate.disruptionId, session.orgId, true);
        await Promise.all([
            deleteDisruptionsInEdit(draftTemplate.disruptionId, session.orgId, true),
            deleteDisruptionsInPending(draftTemplate.disruptionId, session.orgId, true),
        ]);

        draftTemplate.publishStatus === PublishStatus.pendingAndEditing && !canPublish(session)
            ? await updatePendingDisruptionStatus(
                  { ...draftTemplate, publishStatus: PublishStatus.editPendingApproval },
                  session.orgId,
                  true,
              )
            : await insertPublishedDisruptionIntoDynamoAndUpdateDraft(
                  draftTemplate,
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
            const message = "There was a problem publishing the edited disruption.";
            redirectToError(res, message, "api.publish-edit", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default publishEdit;
