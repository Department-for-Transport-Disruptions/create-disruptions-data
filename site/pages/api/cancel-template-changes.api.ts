import { NextApiRequest, NextApiResponse } from "next";
import { ERROR_PATH, TEMPLATE_OVERVIEW_PAGE_PATH } from "../../constants";
import { deleteDisruptionsInEdit, deleteDisruptionsInPending, isDisruptionInEdit } from "../../data/dynamo";
import { publishSchema } from "../../schemas/publish.schema";
import { redirectTo, redirectToError } from "../../utils/apiUtils";
import { canPublish, getSession } from "../../utils/apiUtils/auth";

const cancelTemplateChanges = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const validatedBody = publishSchema.safeParse(req.body);
        const session = getSession(req);

        if (!validatedBody.success || !session) {
            redirectTo(res, ERROR_PATH);
            return;
        }

        const templateId = validatedBody.data.disruptionId;
        const isEdited = await isDisruptionInEdit(templateId, session.orgId, true);

        if (!canPublish(session) && !isEdited) {
            await Promise.all([
                deleteDisruptionsInEdit(templateId, session.orgId, true),
                deleteDisruptionsInPending(templateId, session.orgId, true),
            ]);
        } else {
            await deleteDisruptionsInEdit(templateId, session.orgId, true);
        }

        redirectTo(res, `${TEMPLATE_OVERVIEW_PAGE_PATH}/${templateId}`);
        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem cancelling the changes to the template.";
            redirectToError(res, message, "api.cancel-changes-template", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default cancelTemplateChanges;
