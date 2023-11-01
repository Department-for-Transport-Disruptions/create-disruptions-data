import { NextApiRequest, NextApiResponse } from "next";
import { DISRUPTION_DETAIL_PAGE_PATH, ERROR_PATH } from "../../constants";
import { deleteDisruptionsInEdit, deleteDisruptionsInPending, isDisruptionInEdit } from "../../data/dynamo";
import { publishSchema } from "../../schemas/publish.schema";
import { redirectTo, redirectToError } from "../../utils/apiUtils";
import { canPublish, getSession } from "../../utils/apiUtils/auth";

const cancelChanges = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const validatedBody = publishSchema.safeParse(req.body);
        const session = getSession(req);

        if (!validatedBody.success || !session) {
            redirectTo(res, ERROR_PATH);
            return;
        }

        const disruptionId = validatedBody.data.disruptionId;
        const isEdited = await isDisruptionInEdit(disruptionId, session.orgId);

        if (!canPublish(session) && !isEdited) {
            await Promise.all([
                deleteDisruptionsInEdit(disruptionId, session.orgId),
                deleteDisruptionsInPending(disruptionId, session.orgId),
            ]);
        } else {
            await deleteDisruptionsInEdit(disruptionId, session.orgId);
        }

        redirectTo(res, `${DISRUPTION_DETAIL_PAGE_PATH}/${disruptionId}`);
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
