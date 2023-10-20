import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { NextApiRequest, NextApiResponse } from "next";
import { ERROR_PATH, VIEW_ALL_TEMPLATES_PAGE_PATH } from "../../constants";
import { deletePublishedDisruption, getDisruptionById, getTemplateById } from "../../data/dynamo";
import { redirectTo, redirectToError } from "../../utils/apiUtils";
import { canPublish, getSession } from "../../utils/apiUtils/auth";
import logger from "../../utils/logger";

const deleteTemplate = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const body = req.body as { id: string | undefined };
        const id = body?.id;

        const session = getSession(req);

        if (!id || Array.isArray(id) || !session) {
            throw new Error(
                `Insufficient data provided for deleting a template by id: ${id ? id.toString() : "undefined"}`,
            );
        }

        const template = await getTemplateById(id, session.orgId);

        if (!template) {
            logger.error(`Template ${id} not found to delete`);
            redirectTo(res, ERROR_PATH);
            return;
        }

        if (!canPublish(session) && template.publishStatus !== PublishStatus.draft) {
            throw new Error(`Insufficient permissions to delete template (${id})`);
        }

        await deletePublishedDisruption(template, id, session.orgId, true);

        redirectTo(res, VIEW_ALL_TEMPLATES_PAGE_PATH);
        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem deleting the template";
            redirectToError(res, message, "api.delete-template", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default deleteTemplate;
