import { NextApiRequest, NextApiResponse } from "next";
import { SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH } from "../../constants";
import { removeSocialAccountFromOrg } from "../../data/dynamo";
import { getHootsuiteSsmKey } from "../../data/hootsuite";
import { getNextdoorSsmKey } from "../../data/nextdoor";
import { deleteParameter } from "../../data/ssm";
import { getTwitterSsmAccessSecretKey, getTwitterSsmAccessTokenKey } from "../../data/twitter";
import { getSession } from "../../utils/apiUtils/auth";
import { redirectToError, redirectTo } from "../../utils/apiUtils/index";

interface RemoveSocialMediaConnectionApiRequest extends NextApiRequest {
    body: {
        profileId: string;
        type: string;
    };
}

const removeSocialMediaConnection = async (req: RemoveSocialMediaConnectionApiRequest, res: NextApiResponse) => {
    try {
        const { profileId, type } = req.body;
        const session = getSession(req);

        if (!session || !(session.isOrgAdmin || session.isOperatorUser)) {
            throw new Error("Not authorised");
        }

        if (!profileId || !type) {
            throw new Error("Profile id and type must be provided");
        }

        if (type !== "Twitter" && type !== "Hootsuite" && type !== "Nextdoor") {
            throw new Error("Invalid type");
        }

        await Promise.all([
            deleteParameter(getTwitterSsmAccessSecretKey(session.orgId, profileId)),
            deleteParameter(getTwitterSsmAccessTokenKey(session.orgId, profileId)),
            deleteParameter(getHootsuiteSsmKey(session.orgId, profileId)),
            deleteParameter(getNextdoorSsmKey(session.orgId, profileId)),
            removeSocialAccountFromOrg(session.orgId, profileId),
        ]);

        redirectTo(res, SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH);
        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem with removing the social media connection.";
            redirectToError(res, message, "api.remove-social-media-connection", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default removeSocialMediaConnection;
