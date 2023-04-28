import { NextApiRequest, NextApiResponse } from "next";
import { REVIEW_DISRUPTION_PAGE_PATH } from "../../constants";
import { removeConsequenceFromDisruption } from "../../data/dynamo";
import { redirectTo, redirectToError } from "../../utils/apiUtils";

const deleteDisruption = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const body = req.body as { id: string | undefined; disruptionId: string | undefined };

        const id = body?.id;
        const disruptionId = body?.disruptionId;

        if (!id || Array.isArray(id)) {
            throw new Error(
                `Insufficient data provided for deleting a consequence by id: ${id ? id.toString() : "undefined"}`,
            );
        }
        if (!disruptionId || Array.isArray(disruptionId)) {
            throw new Error(
                `Disruption id is required, in the correct format, to delete a consequence: ${
                    disruptionId ? disruptionId.toString() : "undefined"
                }`,
            );
        }

        await removeConsequenceFromDisruption(Number(id), disruptionId);

        redirectTo(res, `${REVIEW_DISRUPTION_PAGE_PATH}/${disruptionId}`);
        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem deleting the consequence";
            redirectToError(res, message, "api.delete-consequence", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default deleteDisruption;
