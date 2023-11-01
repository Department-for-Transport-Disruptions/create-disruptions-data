import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_REVIEW_TEMPLATE_ERRORS,
    ERROR_PATH,
    REVIEW_TEMPLATE_PAGE_PATH,
    VIEW_ALL_TEMPLATES_PAGE_PATH,
} from "../../constants";
import {
    getDisruptionById,
    getOrganisationInfoById,
    insertPublishedDisruptionIntoDynamoAndUpdateDraft,
} from "../../data/dynamo";
import { publishDisruptionSchema, publishSchema } from "../../schemas/publish.schema";
import { flattenZodErrors } from "../../utils";
import { cleardownCookies, redirectTo, redirectToError, setCookieOnResponseObject } from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";
import logger from "../../utils/logger";

const publishTemplate = async (req: NextApiRequest, res: NextApiResponse) => {
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

        if (!draftTemplate || (draftTemplate && Object.keys(draftTemplate).length === 0)) {
            logger.error(`Template ${validatedBody.data.disruptionId} not found to publish`);
            redirectTo(res, ERROR_PATH);

            return;
        }

        const validatedDisruptionBody = publishDisruptionSchema.safeParse(draftTemplate);

        if (!validatedDisruptionBody.success) {
            setCookieOnResponseObject(
                COOKIES_REVIEW_TEMPLATE_ERRORS,
                JSON.stringify(flattenZodErrors(validatedDisruptionBody.error)),
                res,
            );

            redirectTo(res, `${REVIEW_TEMPLATE_PAGE_PATH}/${validatedBody.data.disruptionId}`);
            return;
        }

        await insertPublishedDisruptionIntoDynamoAndUpdateDraft(
            draftTemplate,
            session.orgId,
            PublishStatus.published,
            session.name,
            undefined,
            true,
        );

        cleardownCookies(req, res);

        redirectTo(res, VIEW_ALL_TEMPLATES_PAGE_PATH);
        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem creating a template.";
            redirectToError(res, message, "api.publish-template", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default publishTemplate;
