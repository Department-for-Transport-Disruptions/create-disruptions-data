import { getUserDetails } from "../data/cognito";
import { user } from "../schemas/user-management.schema";

export const getDisruptionEmailPreference = async (username: string) => {
    const userDetails = await getUserDetails(username);

    const validatedBody = user.safeParse({ ...userDetails, group: "org-admins" });

    if (!validatedBody.success) {
        throw Error("Unable to parse user details");
    }

    return validatedBody.data.disruptionEmailPreference === "true";
};

export const getStreetManagerEmailPreference = async (username: string, group: string) => {
    const userDetails = await getUserDetails(username);

    const validatedBody = user.safeParse({ ...userDetails, group: group });

    if (!validatedBody.success) {
        throw Error("Unable to parse user details");
    }

    return validatedBody.data.streetManagerEmailPreference === "true";
};
