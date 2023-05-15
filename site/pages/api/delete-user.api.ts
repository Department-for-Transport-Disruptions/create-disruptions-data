import { NextApiResponse } from "next";
import { deleteAdminUser } from "../../data/cognito";
import { DeleteUserApiRequest } from "../../interfaces";
import { redirectTo, redirectToError } from "../../utils/apiUtils";

const deleteUser = async (req: DeleteUserApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const { username } = req.body;

        await deleteAdminUser(username);

        redirectTo(res, "/admin/user-management");
    } catch (error) {
        const message = "There was a problem deleting a user.";
        redirectToError(res, message, "api.deleteUser", error as Error);
    }
};

export default deleteUser;
