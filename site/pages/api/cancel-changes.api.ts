import { NextApiRequest, NextApiResponse } from "next";
import { DISRUPTION_DETAIL_PAGE_PATH, ERROR_PATH } from "../../constants";
import { deleteEditedDisruption, isDisruptionInEdit } from "../../data/db";
import { publishSchema } from "../../schemas/publish.schema";
import { redirectTo, redirectToError, redirectToWithQueryParams } from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";

const cancelChanges = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const validatedBody = publishSchema.safeParse(req.body);
        const session = getSession(req);
        const { template } = req.query;

        if (!validatedBody.success || !session) {
            redirectTo(res, ERROR_PATH);
            return;
        }

        const disruptionId = validatedBody.data.disruptionId;
        const isEdited = await isDisruptionInEdit(disruptionId, session.orgId);

        if (isEdited) {
            await deleteEditedDisruption(disruptionId, session.orgId);
        }

        redirectToWithQueryParams(
            req,
            res,
            template ? ["template"] : [],
            `${DISRUPTION_DETAIL_PAGE_PATH}/${disruptionId}`,
        );
        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem cancelling the changes.";
            redirectToError(res, message, "api.cancel-changes", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default cancelChanges;
