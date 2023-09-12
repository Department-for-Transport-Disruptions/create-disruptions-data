import { NextApiRequest, NextApiResponse } from "next";
import { SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH } from "../../constants";
import { removeSocialAccountFromOrg } from "../../data/dynamo";
import { deleteParameter } from "../../data/ssm";
import { getSession } from "../../utils/apiUtils/auth";
import { redirectToError, redirectTo } from "../../utils/apiUtils/index";

interface RemoveHootsuiteConnectionApiRequest extends NextApiRequest {
    body: {
        profileId: string;
        type: string;
    };
}

const removeHootsuiteConnection = async (req: RemoveHootsuiteConnectionApiRequest, res: NextApiResponse) => {
    try {
        const { profileId, type } = req.body;
        if (!profileId || !type) {
            throw new Error("Profile id and type must be provided");
        }

        if (type !== "Twitter" && type !== "Hootsuite") {
            throw new Error("Invalid type");
        }

        const session = getSession(req);

        if (!session || !session.isOrgAdmin) {
            throw new Error("Session data not found");
        }

        const key = `/social/${session.orgId}/${type.toLowerCase()}/${profileId}/refresh_token`;

        await Promise.all([deleteParameter(key), removeSocialAccountFromOrg(session.orgId, profileId)]);

        redirectTo(res, SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH);
        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem with removing the social media connection.";
            redirectToError(res, message, "api.remove-hootsuite-connection", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default removeHootsuiteConnection;
