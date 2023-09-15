import { PublishStatus, SocialMediaPostStatus } from "@create-disruptions-data/shared-ts/enums";
import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_REVIEW_DISRUPTION_ERRORS,
    DASHBOARD_PAGE_PATH,
    ERROR_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
    VIEW_ALL_TEMPLATES_PAGE_PATH,
} from "../../constants";
import {
    getDisruptionById,
    getOrganisationInfoById,
    insertPublishedDisruptionIntoDynamoAndUpdateDraft,
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

const publish = async (req: NextApiRequest, res: NextApiResponse) => {
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
            logger.error(`Organisation info not found for Org Id ${session.orgId}`);
            redirectTo(res, ERROR_PATH);
            return;
        }

        if (!draftDisruption || (draftDisruption && Object.keys(draftDisruption).length === 0)) {
            logger.error(`Disruption ${validatedBody.data.disruptionId} not found to publish`);
            redirectTo(res, ERROR_PATH);

            return;
        }

        const validatedDisruptionBody = publishDisruptionSchema.safeParse(draftDisruption);

        if (!validatedDisruptionBody.success) {
            setCookieOnResponseObject(
                COOKIES_REVIEW_DISRUPTION_ERRORS,
                JSON.stringify(flattenZodErrors(validatedDisruptionBody.error)),
                res,
            );

            redirectToWithQueryParams(
                req,
                res,
                template ? ["template"] : [],
                `${REVIEW_DISRUPTION_PAGE_PATH}/${validatedBody.data.disruptionId}`,
            );
            return;
        }

        await insertPublishedDisruptionIntoDynamoAndUpdateDraft(
            draftDisruption,
            session.orgId,
            canPublish(session) || draftDisruption.template ? PublishStatus.published : PublishStatus.pendingApproval,
            session.name,
            draftDisruption.template
                ? undefined
                : canPublish(session)
                ? "Disruption created and published"
                : "Disruption submitted for review",
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
            const message = "There was a problem creating a disruption.";
            redirectToError(res, message, "api.publish", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default publish;
