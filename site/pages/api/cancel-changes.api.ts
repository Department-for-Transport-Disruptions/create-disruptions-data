import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies } from "nookies";
import { COOKIES_DISRUPTION_DETAIL_REFERER, ERROR_PATH } from "../../constants";
import { deleteDisruptionsInEdit } from "../../data/dynamo";
import { publishSchema } from "../../schemas/publish.schema";
import { cleardownCookies, redirectTo, redirectToError } from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";

const cancelChanges = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const validatedBody = publishSchema.safeParse(req.body);
        const session = getSession(req);

        if (!validatedBody.success || !session) {
            redirectTo(res, ERROR_PATH);
            return;
        }

        const disruptionId = validatedBody.data.disruptionId;

        await deleteDisruptionsInEdit(disruptionId, session.orgId);
        const cookies = parseCookies({ req });
        const ddCookieReferer = cookies[COOKIES_DISRUPTION_DETAIL_REFERER];

        cleardownCookies(req, res);

        redirectTo(res, ddCookieReferer ? ddCookieReferer : "/dashboard");
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
