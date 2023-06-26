import { NextApiRequest, NextApiResponse } from "next";
import { SYSADMIN_MANAGE_ORGANISATIONS_PAGE_PATH } from "../../../constants";
import { deleteUsersByAttribute } from "../../../data/cognito";
import { removeOrganisation } from "../../../data/dynamo";
import { redirectTo, redirectToError } from "../../../utils/apiUtils";
import { getSession } from "../../../utils/apiUtils/auth";

export interface DeleteOrgApiRequest extends NextApiRequest {
    body: {
        org: string;
    };
}

const deleteOrg = async (req: DeleteOrgApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const { org } = req.body;

        const session = getSession(req);
        if (!session || !session.isSystemAdmin || !org) {
            throw Error("Insufficient values provided to delete an organisation");
        }

        await deleteUsersByAttribute("custom:orgId", org);
        await removeOrganisation(org);

        redirectTo(res, SYSADMIN_MANAGE_ORGANISATIONS_PAGE_PATH);
        return;
    } catch (error) {
        const message = "There was a problem deleting an organisation.";
        redirectToError(res, message, "api.delete-org", error as Error);
        return;
    }
};

export default deleteOrg;
