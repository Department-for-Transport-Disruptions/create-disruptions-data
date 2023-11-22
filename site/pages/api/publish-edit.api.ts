import { PublishStatus, SocialMediaPostStatus } from "@create-disruptions-data/shared-ts/enums";
import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_DISRUPTION_DETAIL_ERRORS,
    DASHBOARD_PAGE_PATH,
    DISRUPTION_DETAIL_PAGE_PATH,
    ERROR_PATH,
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
import {
    cleardownCookies,
    publishSocialMedia,
    redirectTo,
    redirectToError,
    setCookieOnResponseObject,
} from "../../utils/apiUtils";
import { canPublish, getSession } from "../../utils/apiUtils/auth";
import { sendDisruptionApprovalEmail } from "../../utils/apiUtils/disruptionApprovalEmailer";
import logger from "../../utils/logger";

const publishEdit = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const validatedBody = publishSchema.safeParse(req.body);
        const session = getSession(req);

        if (!validatedBody.success || !session) {
            redirectTo(res, ERROR_PATH);
            return;
        }

        const [draftDisruption, orgInfo] = await Promise.all([
            getDisruptionById(validatedBody.data.disruptionId, session.orgId),
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
                COOKIES_DISRUPTION_DETAIL_ERRORS,
                JSON.stringify(flattenZodErrors(validatedDisruptionBody.error)),
                res,
            );

            redirectTo(res, `${DISRUPTION_DETAIL_PAGE_PATH}/${validatedBody.data.disruptionId}`);
            return;
        }

        if (session.isOperatorUser && session.operatorOrgId !== validatedDisruptionBody.data.createdByOperatorOrgId) {
            logger.error(
                `Operator with operatorOrgId: ${session.operatorOrgId} is not authorised to edit disruption ${validatedBody.data.disruptionId}`,
            );
            redirectTo(res, ERROR_PATH);
            return;
        }

        const isEditPendingDsp =
            draftDisruption.publishStatus === PublishStatus.pendingAndEditing ||
            draftDisruption.publishStatus === PublishStatus.editPendingApproval;

        if (isEditPendingDsp) {
            await publishEditedConsequencesAndSocialMediaPostsIntoPending(draftDisruption.disruptionId, session.orgId);
        } else {
            await publishEditedConsequencesAndSocialMediaPosts(draftDisruption.disruptionId, session.orgId);
        }

        if (canPublish(session)) {
            if (isEditPendingDsp)
                await publishPendingConsequencesAndSocialMediaPosts(draftDisruption.disruptionId, session.orgId);
            await Promise.all([
                deleteDisruptionsInEdit(draftDisruption.disruptionId, session.orgId),
                deleteDisruptionsInPending(draftDisruption.disruptionId, session.orgId),
            ]);
        } else {
            await deleteDisruptionsInEdit(draftDisruption.disruptionId, session.orgId);
        }

        draftDisruption.publishStatus === PublishStatus.pendingAndEditing && !canPublish(session)
            ? await updatePendingDisruptionStatus(
                  { ...draftDisruption, publishStatus: PublishStatus.editPendingApproval },
                  session.orgId,
              )
            : await insertPublishedDisruptionIntoDynamoAndUpdateDraft(
                  draftDisruption,
                  session.orgId,
                  canPublish(session) ? PublishStatus.published : PublishStatus.pendingApproval,
                  session.name,
                  undefined,
              );

        if (
            validatedDisruptionBody.data.socialMediaPosts &&
            validatedDisruptionBody.data.socialMediaPosts.length > 0 &&
            canPublish(session)
        ) {
            await publishSocialMedia(
                validatedDisruptionBody.data.socialMediaPosts.filter(
                    (post) => post.status === SocialMediaPostStatus.pending,
                ),
                session.orgId,
                session.isOrgStaff,
                canPublish(session),
            );
        }

        cleardownCookies(req, res);

        if (session.isOrgStaff) {
            void sendDisruptionApprovalEmail(
                session.orgId,
                validatedDisruptionBody.data.summary,
                validatedDisruptionBody.data.description,
                session.name,
                validatedDisruptionBody.data.disruptionId,
            );
        }

        redirectTo(res, DASHBOARD_PAGE_PATH);
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
