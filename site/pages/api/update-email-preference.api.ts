import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { updateUserCustomAttribute } from "../../data/cognito";
import { getSession } from "../../utils/apiUtils/auth";
import logger from "../../utils/logger";

export const updateEmailPreferenceSchema = z.object({
    username: z.string(),
    attributeName: z.string(),
    attributeValue: z.string(),
});

const updateEmailPreference = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = getSession(req);

        if (!session) {
            throw new Error("No session found");
        }

        const validatedBody = updateEmailPreferenceSchema.safeParse(req.body);

        if (validatedBody.success) {
            await updateUserCustomAttribute(
                validatedBody.data.username,
                validatedBody.data.attributeName,
                validatedBody.data.attributeValue,
            );
            res.status(200).json({ success: true });
            return;
        }
        throw new Error("Unable to parse data from frontend");
    } catch (_e) {
        logger.error("There was a problem while updating user email preference");
        res.status(500).json({ success: false });
        return;
    }
};

export default updateEmailPreference;
