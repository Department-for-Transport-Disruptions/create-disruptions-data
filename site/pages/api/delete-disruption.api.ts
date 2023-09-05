import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { NextApiRequest, NextApiResponse } from "next";
import { ERROR_PATH } from "../../constants";
import { deletePublishedDisruption, getDisruptionById } from "../../data/dynamo";
import { redirectTo, redirectToError } from "../../utils/apiUtils";
import { canPublish, getSession } from "../../utils/apiUtils/auth";
import logger from "../../utils/logger";

const deleteDisruption = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const body = req.body as { id: string | undefined };
        const id = body?.id;

        const session = getSession(req);

        if (!id || Array.isArray(id) || !session) {
            throw new Error(
                `Insufficient data provided for deleting a disruption by id: ${id ? id.toString() : "undefined"}`,
            );
        }

        const disruption = await getDisruptionById(id, session.orgId, req.query.template === "true");

        if (!disruption) {
            logger.error(`Disruption ${id} not found to delete`);
            redirectTo(res, ERROR_PATH);
            return;
        }

        if (!canPublish(session) && disruption.publishStatus !== PublishStatus.draft) {
            throw new Error(`Insufficient permissions to delete disruption (${id})`);
        }

        await deletePublishedDisruption(disruption, id, session.orgId, req.query.template === "true");

        redirectTo(res, "/dashboard");
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
