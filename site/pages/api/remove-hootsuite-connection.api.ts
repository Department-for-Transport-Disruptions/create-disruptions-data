import { NextApiRequest, NextApiResponse } from "next";
import { SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH } from "../../constants";
import { deleteParameter } from "../../data/ssm";
import { getSession } from "../../utils/apiUtils/auth";
import { redirectToError, redirectTo } from "../../utils/apiUtils/index";

interface RemoveHootsuiteConnectionApiRequest extends NextApiRequest {
    body: {
        profileId: string;
    };
}

const removeHootsuiteConnection = async (req: RemoveHootsuiteConnectionApiRequest, res: NextApiResponse) => {
    try {
        const { profileId } = req.body;
        if (!profileId) {
            throw new Error("Profile id must be provided");
        }

        const session = getSession(req);

        if (!session || !session.isOrgAdmin) {
            throw new Error("Session data not found");
        }

        const key = `/social/${session.orgId}/hootsuite/${profileId}-token`;

        const addedByKey = `/social/${session.orgId}/hootsuite/${profileId}-addedUser`;

        await Promise.all([deleteParameter(key), deleteParameter(addedByKey)]);

        redirectTo(res, SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH);
        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem with removing the hootsuite connection.";
            redirectToError(res, message, "api.remove-hootsuite-connection", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default removeHootsuiteConnection;
