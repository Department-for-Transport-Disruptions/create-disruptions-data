import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { updateUserCustomAttribute } from "../../../data/cognito";
import { getSession } from "../../../utils/apiUtils/auth";
import logger from "../../../utils/logger";

export const updateEmailPreferenceSchema = z.object({
    username: z.string(),
    disruptionEmailPreference: z.string(),
});

const updateEmailPreference = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = getSession(req);

        if (!session) {
            throw new Error("No session found");
        } else if (!session.isOrgAdmin) {
            throw new Error("Invalid user accessing the page");
        }

        const validatedBody = updateEmailPreferenceSchema.safeParse(req.body);

        if (validatedBody.success) {
            await updateUserCustomAttribute(
                validatedBody.data.username,
                "custom:disruptionEmailPref",
                validatedBody.data.disruptionEmailPreference,
            );
            res.status(200).json({ success: true });
            return;
        } else {
            throw new Error(`Unable to parse data from frontend`);
        }
    } catch (e) {
        logger.error(`There was a problem while updating user email preference`);
        res.status(500).json({ success: false });
        return;
    }
};

export default updateEmailPreference;
