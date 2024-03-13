import { getUserDetails } from "../data/cognito";
import { user } from "../schemas/user-management.schema";

export const getEmailPreferences = async (username: string, group: string) => {
    const userDetails = await getUserDetails(username);

    const validatedBody = user.safeParse({ ...userDetails, group: group });

    if (!validatedBody.success) {
        throw Error("Unable to parse user details");
    }

    return {
        streetManagerEmailPreference: validatedBody.data.streetManagerEmailPreference === "true",
        disruptionApprovalEmailPreference: validatedBody.data.disruptionEmailPreference === "true",
    };
};
