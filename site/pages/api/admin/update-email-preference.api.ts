import {
    AliasExistsException,
    InternalErrorException,
    InvalidEmailRoleAccessPolicyException,
    InvalidLambdaResponseException,
    InvalidParameterException,
    UsernameExistsException,
} from "@aws-sdk/client-cognito-identity-provider";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { updateUserCustomAttribute } from "../../../data/cognito";
import { getSession } from "../../../utils/apiUtils/auth";
import logger from "../../../utils/logger";

export const updateEmailPreferenceSchema = z.object({
    username: z.string(),
    emailNotificationsPreference: z.string(),
});

const updateEmailPreferenceApi = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        console.log("I am working");
        const session = getSession(req);

        if (!session) {
            throw new Error("No session found");
        } else if (!session.isOrgAdmin) {
            throw new Error("Invalid user accessing the page");
        }

        const validatedBody = updateEmailPreferenceSchema.safeParse(req.body);

        if (validatedBody.success) {
            await updateUserCustomAttribute(
                "a6421204-10e1-7014-7dfc-639dcbf657f0",
                "custom:disruptionEmailPref",
                validatedBody.data.emailNotificationsPreference,
            );
            res.status(200).json({ success: true });
            return;
        } else {
            throw new Error("Unable to parse data from frontend");
        }
    } catch (e) {
        if (e instanceof InvalidParameterException) {
            logger.error("Cognito problem");
            res.status(500).json({ success: false });
            return;
        }
        logger.error("There was a problem while updating user email preference");
        res.status(500).json({ success: false });
        return;
    }
};

export default updateEmailPreferenceApi;
