import { SocialMediaPostStatus } from "@create-disruptions-data/shared-ts/enums";
import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_DISRUPTION_DETAIL_ERRORS,
    DASHBOARD_PAGE_PATH,
    DISRUPTION_DETAIL_PAGE_PATH,
    ERROR_PATH,
    VIEW_ALL_TEMPLATES_PAGE_PATH,
} from "../../constants";
import {
    deleteEditedDisruption,
    getDisruptionById,
    publishEditedDisruption,
    publishEditedDisruptionIntoPending,
} from "../../data/db";
import { getOrganisationInfoById } from "../../data/dynamo";
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
import { sendDisruptionApprovalEmail } from "../../utils/apiUtils/disruptionApprovalEmailer";
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
                JSON.stringify({ errors: flattenZodErrors(validatedDisruptionBody.error) }),
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

        if (session.isOperatorUser && session.operatorOrgId !== validatedDisruptionBody.data.createdByOperatorOrgId) {
            logger.error(
                `Operator with operatorOrgId: ${session.operatorOrgId} is not authorised to edit disruption ${validatedBody.data.disruptionId}`,
            );
            redirectTo(res, ERROR_PATH);
            return;
        }

        if (canPublish(session) || draftDisruption.template) {
            await publishEditedDisruption(draftDisruption.id, session.orgId, session.name);
            await deleteEditedDisruption(draftDisruption.id, session.orgId);
        } else {
            await publishEditedDisruptionIntoPending(draftDisruption.id, session.orgId, session.name);
        }

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
            );
        }

        cleardownCookies(req, res);

        if (session.isOrgStaff && !template) {
            void sendDisruptionApprovalEmail(
                session.orgId,
                validatedDisruptionBody.data.summary,
                validatedDisruptionBody.data.description,
                session.name,
                validatedDisruptionBody.data.id,
            );
        }

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
