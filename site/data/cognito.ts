import {
    CognitoIdentityProviderClient,
    AdminInitiateAuthCommand,
    AdminInitiateAuthCommandInput,
    AdminInitiateAuthCommandOutput,
    AdminRespondToAuthChallengeCommand,
    AdminRespondToAuthChallengeCommandInput,
    AdminUserGlobalSignOutCommand,
    AdminUserGlobalSignOutCommandInput,
    AdminSetUserPasswordCommand,
    AdminSetUserPasswordCommandInput,
    AdminAddUserToGroupCommand,
    ListGroupsCommand,
    ListUsersInGroupCommand,
    UserType,
    AdminDeleteUserCommand,
    AdminGetUserCommand,
    AdminGetUserCommandInput,
    AdminDeleteUserCommandInput,
    AdminCreateUserCommand,
    ListUsersCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import { createHmac } from "crypto";
import { AddUserSchema } from "../schemas/add-user.schema";
import logger from "../utils/logger";

const {
    COGNITO_CLIENT_ID: cognitoClientId,
    COGNITO_CLIENT_SECRET: cognitoClientSecret,
    COGNITO_USER_POOL_ID: userPoolId,
} = process.env;

if (!cognitoClientSecret || !cognitoClientId || !userPoolId) {
    throw new Error("Cognito env vars not set");
}

const cognito = new CognitoIdentityProviderClient({
    region: "eu-west-2",
});

export const deleteUser = (username: string) => {
    try {
        const params: AdminDeleteUserCommandInput = {
            UserPoolId: userPoolId,
            Username: username,
        };
        return cognito.send(new AdminDeleteUserCommand(params));
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to delete user: ${error.stack || ""}`);
        }

        throw error;
    }
};

export const getUserDetails = (username: string) => {
    try {
        const params: AdminGetUserCommandInput = {
            UserPoolId: userPoolId,
            Username: username,
        };
        return cognito.send(new AdminGetUserCommand(params));
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to get user details by username: ${error.stack || ""}`);
        }

        throw error;
    }
};

const calculateSecretHash = (username: string): string =>
    createHmac("SHA256", cognitoClientSecret)
        .update(username + cognitoClientId)
        .digest("base64");

export const initiateAuth = async (username: string, password: string): Promise<AdminInitiateAuthCommandOutput> => {
    logger.info("", {
        context: "data.cognito",
        message: "initiating auth",
    });

    try {
        const params: AdminInitiateAuthCommandInput = {
            AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
            ClientId: cognitoClientId,
            UserPoolId: userPoolId,
            AuthParameters: {
                USERNAME: username,
                PASSWORD: password,
                SECRET_HASH: calculateSecretHash(username),
            },
        };

        return cognito.send(new AdminInitiateAuthCommand(params));
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to authenticate user: ${error.stack || ""}`);
        }

        throw error;
    }
};

export const respondToNewPasswordChallenge = async (
    username: string,
    password: string,
    session: string,
): Promise<void> => {
    logger.info("", {
        context: "data.cognito",
        message: "new password challenge initiated",
    });

    try {
        const params: AdminRespondToAuthChallengeCommandInput = {
            ChallengeName: "NEW_PASSWORD_REQUIRED",
            ClientId: cognitoClientId,
            UserPoolId: userPoolId,
            ChallengeResponses: {
                USERNAME: username,
                NEW_PASSWORD: password,
                SECRET_HASH: calculateSecretHash(username),
            },
            Session: session,
        };

        await cognito.send(new AdminRespondToAuthChallengeCommand(params));
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to respond to password challenge: ${error.stack || ""}`);
        }

        throw error;
    }
};

export const globalSignOut = async (username: string): Promise<void> => {
    logger.info("", {
        context: "data.cognito",
        message: "performing global sign out",
    });

    const params: AdminUserGlobalSignOutCommandInput = {
        Username: username,
        UserPoolId: userPoolId,
    };

    try {
        await cognito.send(new AdminUserGlobalSignOutCommand(params));
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to perform global sign out: ${error.stack || ""}`);
        }

        throw error;
    }
};

export const updateUserPassword = async (newPassword: string, username: string): Promise<void> => {
    logger.info("", {
        context: "data.cognito",
        message: "updating user password",
    });

    const params: AdminSetUserPasswordCommandInput = {
        Password: newPassword,
        Permanent: true,
        Username: username,
        UserPoolId: userPoolId,
    };

    try {
        await cognito.send(new AdminSetUserPasswordCommand(params));
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to update user password: ${error.stack || ""}`);
        }

        throw error;
    }
};

export const listUsersWithGroups = async () => {
    logger.info("", {
        context: "data.cognito",
        message: "Listing cognito users",
    });

    try {
        const groupList = await cognito.send(new ListGroupsCommand({ UserPoolId: userPoolId }));

        const userList: (UserType & { GroupName: string | undefined })[] = [];
        await Promise.all(
            groupList.Groups?.map(async (group) => {
                const usersRequest = await cognito.send(
                    new ListUsersInGroupCommand({ UserPoolId: userPoolId, GroupName: group.GroupName }),
                );

                usersRequest.Users?.forEach((user) => {
                    userList.push({
                        ...user,
                        GroupName: group.GroupName,
                    });
                });
            }) ?? [],
        );

        return userList.flat();
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to list cognito users: ${error.stack || ""}`);
        }

        throw error;
    }
};

export const deleteUsersByAttribute = async (attributeName: string, attributeValue: string) => {
    logger.info("", {
        context: "data.cognito",
        message: "Listing cognito users based on custom attributes and deleting the users that match the value",
    });

    try {
        const userList = await cognito.send(
            new ListUsersCommand({ UserPoolId: userPoolId, AttributesToGet: [attributeName] }),
        );

        const deletePromises = userList.Users?.filter((user) =>
            user.Attributes?.find((value) => value.Value === attributeValue),
        ).map((user) => {
            return cognito.send(
                new AdminDeleteUserCommand({
                    UserPoolId: userPoolId,
                    Username: user.Username,
                }),
            );
        });

        await Promise.all(deletePromises ?? []);
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(
                `Failed to list cognito users based on attribute ${attributeName} with value ${attributeValue}: ${
                    error.stack || ""
                }`,
            );
        }

        throw error;
    }
};

export const createUser = async (userData: AddUserSchema) => {
    logger.info("", {
        context: "data.cognito",
        message: "Adding a new user",
    });
    const createUserResult = await cognito.send(
        new AdminCreateUserCommand({
            Username: userData.email,
            UserPoolId: userPoolId,
            TemporaryPassword: Array.from(Array(20), () => Math.floor(Math.random() * 36).toString(36)).join(""),
            UserAttributes: [
                {
                    Name: "custom:orgId",
                    Value: userData.orgId,
                },
                {
                    Name: "given_name",
                    Value: userData.givenName,
                },
                {
                    Name: "family_name",
                    Value: userData.familyName,
                },
            ],
        }),
    );

    await cognito.send(
        new AdminAddUserToGroupCommand({
            GroupName: userData.group,
            Username: createUserResult.User?.Username,
            UserPoolId: userPoolId,
        }),
    );
};

export const getUsersInGroupAndOrg = async (orgId: string, groupName: string) => {
    logger.info("", {
        context: "data.cognito",
        message: "Listing cognito users in an organisation and in a group",
    });

    try {
        const userList = await cognito.send(
            new ListUsersInGroupCommand({ UserPoolId: userPoolId, GroupName: groupName }),
        );

        return userList.Users?.filter((user) => user.Attributes?.find((value) => value.Value === orgId)) ?? [];
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to list cognito users in organisation ${orgId}: ${error.stack || ""}`);
        }

        throw error;
    }
};
