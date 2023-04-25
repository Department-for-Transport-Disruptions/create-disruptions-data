import { NextApiRequest, NextApiResponse } from "next";
import { ERROR_PATH } from "../../constants";
import { deletePublishedDisruption, getDisruptionById } from "../../data/dynamo";
import { redirectTo, redirectToError } from "../../utils/apiUtils";
import logger from "../../utils/logger";

const deleteDisruption = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const body = req.body as { id: string | undefined };

        const id = body?.id;

        if (!id || Array.isArray(id)) {
            throw new Error(
                `Insufficient data provided for deleting a disruption by id: ${id ? id.toString() : "undefined"}`,
            );
        }

        const disruption = await getDisruptionById(id);

        if (!disruption) {
            logger.error(`Disruption ${id} not found to delete`);
            redirectTo(res, ERROR_PATH);
            return;
        }

        await deletePublishedDisruption(disruption, id);

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
