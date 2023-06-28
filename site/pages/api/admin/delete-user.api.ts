import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_ID_TOKEN,
    COOKIES_REFRESH_TOKEN,
    LOGIN_PAGE_PATH,
    SYSADMIN_ADD_USERS_PAGE_PATH,
    USER_MANAGEMENT_PAGE_PATH,
} from "../../../constants";
import { deleteUser as deleteCognitoUser, getUserDetails, globalSignOut } from "../../../data/cognito";
import { deleteUser as user } from "../../../schemas/user-management.schema";
import { destroyCookieOnResponseObject, redirectTo, redirectToError } from "../../../utils/apiUtils";
import { getSession } from "../../../utils/apiUtils/auth";

export interface DeleteUserApiRequest extends NextApiRequest {
    body: {
        username: string;
        orgId?: string;
    };
}

const deleteUser = async (req: DeleteUserApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const { username, orgId } = req.body;

        const session = getSession(req);
        if ((session && !session.orgId) || !session || !username) {
            throw Error("Insufficient values provided to delete a user");
        }

        const userDetails = await getUserDetails(username);

        const formattedUserDetails = user.parse(userDetails);

        if (formattedUserDetails.organisation !== session.orgId) {
            throw Error("Users can only delete users within the same organisation");
        }

        await deleteCognitoUser(username);

        if (username === session.username) {
            destroyCookieOnResponseObject(COOKIES_ID_TOKEN, res);
            destroyCookieOnResponseObject(COOKIES_REFRESH_TOKEN, res);

            redirectTo(res, LOGIN_PAGE_PATH);
            return;
        }

        redirectTo(res, orgId ? `${SYSADMIN_ADD_USERS_PAGE_PATH}?orgId=${orgId}` : USER_MANAGEMENT_PAGE_PATH);
        return;
    } catch (error) {
        const message = "There was a problem deleting a user.";
        redirectToError(res, message, "api.delete-user", error as Error);
    }
};

export default deleteUser;
