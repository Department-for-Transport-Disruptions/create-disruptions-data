import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies } from "nookies";
import { COOKIES_DISRUPTION_DETAIL_REFERER, ERROR_PATH } from "../../constants";
import { deleteDisruptionsInEdit } from "../../data/dynamo";
import { publishSchema } from "../../schemas/publish.schema";
import { cleardownCookies, redirectTo, redirectToError } from "../../utils/apiUtils";

const cancelChanges = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const validatedBody = publishSchema.safeParse(req.body);

        if (!validatedBody.success) {
            redirectTo(res, ERROR_PATH);
            return;
        }

        const disruptionId = validatedBody.data.disruptionId;

        await deleteDisruptionsInEdit(disruptionId);
        const cookies = parseCookies({ req });
        const ddCookieReferer = cookies[COOKIES_DISRUPTION_DETAIL_REFERER];

        cleardownCookies(req, res);

        redirectTo(res, ddCookieReferer ? ddCookieReferer : "/dashboard");
        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem creating a disruption.";
            redirectToError(res, message, "api.publish", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default cancelChanges;
