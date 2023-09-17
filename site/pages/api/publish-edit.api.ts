import { PublishStatus, SocialMediaPostStatus } from "@create-disruptions-data/shared-ts/enums";
import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_DISRUPTION_DETAIL_ERRORS,
    DASHBOARD_PAGE_PATH,
    DISRUPTION_DETAIL_PAGE_PATH,
    ERROR_PATH,
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
import {
    cleardownCookies,
    publishSocialMedia,
    redirectTo,
    redirectToError,
    redirectToWithQueryParams,
    setCookieOnResponseObject,
} from "../../utils/apiUtils";
import { canPublish, getSession } from "../../utils/apiUtils/auth";
import logger from "../../utils/logger";

const publishEdit = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const validatedBody = publishSchema.safeParse(req.body);
        const session = getSession(req);
        const { template } = req.query;

        if (!validatedBody.success || !session) {
            redirectTo(res, ERROR_PATH);
            return;
        }

        const [draftDisruption, orgInfo] = await Promise.all([
            getDisruptionById(validatedBody.data.disruptionId, session.orgId, template === "true"),
            getOrganisationInfoById(session.orgId),
        ]);

        if (!orgInfo) {
            logger.error(`Orgnasition info not found for Org Id ${session.orgId}`);
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

            redirectToWithQueryParams(
                req,
                res,
                template ? ["template"] : [],
                `${DISRUPTION_DETAIL_PAGE_PATH}/${validatedBody.data.disruptionId}`,
            );
            return;
        }

        const isEditPendingDsp =
            draftDisruption.publishStatus === PublishStatus.pendingAndEditing ||
            draftDisruption.publishStatus === PublishStatus.editPendingApproval;

        if (isEditPendingDsp) {
            await publishEditedConsequencesAndSocialMediaPostsIntoPending(
                draftDisruption.disruptionId,
                session.orgId,
                template === "true",
            );
        } else {
            await publishEditedConsequencesAndSocialMediaPosts(
                draftDisruption.disruptionId,
                session.orgId,
                template === "true",
            );
        }

        if (canPublish(session) || draftDisruption.template) {
            if (isEditPendingDsp)
                await publishPendingConsequencesAndSocialMediaPosts(
                    draftDisruption.disruptionId,
                    session.orgId,
                    template === "true",
                );
            await Promise.all([
                deleteDisruptionsInEdit(draftDisruption.disruptionId, session.orgId, template === "true"),
                deleteDisruptionsInPending(draftDisruption.disruptionId, session.orgId, template === "true"),
            ]);
        } else {
            await deleteDisruptionsInEdit(draftDisruption.disruptionId, session.orgId, template === "true");
        }

        isEditPendingDsp && (!canPublish(session) || !draftDisruption.template)
            ? await updatePendingDisruptionStatus(
                  { ...draftDisruption, publishStatus: PublishStatus.editPendingApproval },
                  session.orgId,
                  template === "true",
              )
            : await insertPublishedDisruptionIntoDynamoAndUpdateDraft(
                  draftDisruption,
                  session.orgId,
                  canPublish(session) || draftDisruption.template
                      ? PublishStatus.published
                      : PublishStatus.pendingApproval,
                  session.name,
                  undefined,
                  template === "true",
              );

        if (
            validatedDisruptionBody.data.socialMediaPosts &&
            validatedDisruptionBody.data.socialMediaPosts.length > 0 &&
            canPublish(session) &&
            !draftDisruption.template
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
        redirectTo(res, template ? VIEW_ALL_TEMPLATES_PAGE_PATH : DASHBOARD_PAGE_PATH);
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
