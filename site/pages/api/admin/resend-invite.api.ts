import { NextApiRequest, NextApiResponse } from "next";
import { USER_MANAGEMENT_PAGE_PATH } from "../../../constants";
import { createUser, deleteUser as deleteCognitoUser, getUserDetails } from "../../../data/cognito";
import { user } from "../../../schemas/user-management.schema";
import { redirectTo, redirectToError } from "../../../utils/apiUtils";
import { getSession } from "../../../utils/apiUtils/auth";

export interface ResendUserApiRequest extends NextApiRequest {
    body: {
        username: string;
        group: string;
    };
}

const resendInvite = async (req: ResendUserApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const { username, group } = req.body;

        const session = getSession(req);
        if ((session && !session.orgId) || !session || !username || !group) {
            throw Error("Insufficient values provided to resend an invite");
        }

        const userDetails = await getUserDetails(username);

        const validatedBody = user.safeParse({ ...userDetails, group });

        if (!validatedBody.success) {
            throw Error("Insufficient values provided to resend an invite");
        }

        if (validatedBody.data.userStatus !== "FORCE_CHANGE_PASSWORD") {
            throw Error("Users must have a pending status to resend an invite");
        }

        if (validatedBody.data.orgId !== session.orgId) {
            throw Error("Users can only delete users within the same organisation");
        }

        await deleteCognitoUser(username);

        await createUser(validatedBody.data);

        redirectTo(res, USER_MANAGEMENT_PAGE_PATH);
        return;
    } catch (error) {
        const message = "There was a problem resending an invite.";
        redirectToError(res, message, "api.resend-invite", error as Error);
    }
};

export default resendInvite;
