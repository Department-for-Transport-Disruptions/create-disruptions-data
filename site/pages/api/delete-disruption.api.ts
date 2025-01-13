import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { NextApiRequest, NextApiResponse } from "next";
import {
    DASHBOARD_PAGE_PATH,
    DISRUPTION_DETAIL_PAGE_PATH,
    ERROR_PATH,
    VIEW_ALL_TEMPLATES_PAGE_PATH,
} from "../../constants";
import { deletePublishedDisruption, getDisruptionById } from "../../data/db";
import { redirectTo, redirectToError } from "../../utils/apiUtils";
import { canPublish, getSession } from "../../utils/apiUtils/auth";
import logger from "../../utils/logger";

const getRedirectPath = (template?: string, returnPath?: string) => {
    if (template) {
        return VIEW_ALL_TEMPLATES_PAGE_PATH;
    }
    if (returnPath?.includes(DISRUPTION_DETAIL_PAGE_PATH) && returnPath?.includes("template")) {
        return returnPath;
    }
    return DASHBOARD_PAGE_PATH;
};

const deleteDisruption = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const body = req.body as { id: string | undefined };
        const id = body?.id;

        const { template, return: returnPath } = req.query;
        const session = getSession(req);

        if (!id || Array.isArray(id) || !session) {
            throw new Error(
                `Insufficient data provided for deleting a disruption by id: ${id ? id.toString() : "undefined"}`,
            );
        }

        const disruption = await getDisruptionById(id, session.orgId);

        if (!disruption) {
            logger.error(`Disruption ${id} not found to delete`);
            redirectTo(res, ERROR_PATH);
            return;
        }

        if (!canPublish(session) && disruption.publishStatus !== PublishStatus.draft) {
            throw new Error(`Insufficient permissions to delete disruption (${id})`);
        }

        await deletePublishedDisruption(disruption.id, session.orgId);

        redirectTo(res, getRedirectPath(template?.toString(), returnPath?.toString()));
        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem deleting the disruption";
            redirectToError(res, message, "api.delete-disruption", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default deleteDisruption;
