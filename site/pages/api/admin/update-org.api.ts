import { NextApiRequest, NextApiResponse } from "next";
import { upsertOrganisation } from "../../../data/dynamo";
import { organisationSchema } from "../../../schemas/organisation.schema";
import { getSession } from "../../../utils/apiUtils/auth";
import logger from "../../../utils/logger";

const updateOrg = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = getSession(req);

        if (!session) {
            throw new Error("No session found");
        } else if (!session.isOrgAdmin) {
            throw new Error("Invalid user accessing the page");
        }

        const validatedBody = organisationSchema.safeParse(req.body);

        if (validatedBody.success) {
            if (!validatedBody.data.PK) throw new Error("Orgnaisation ID not passed");
            await upsertOrganisation(validatedBody.data.PK, validatedBody.data);

            res.status(200).json({ success: true });
            return;
        } else {
            throw new Error("Unable to parse data from frontend");
        }
    } catch (e) {
        logger.error("There was a problem while updating org data source");
        res.status(500).json({ success: false });
        return;
    }
};

export default updateOrg;
