import {
    CognitoIdentityProviderClient,
    ListUsersInGroupCommand,
    UserType,
    ListUsersCommand,
} from "@aws-sdk/client-cognito-identity-provider";

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

export const getAllUsersInGroup = async (groupName: string, nextToken?: string): Promise<UserType[]> => {
    const users = await cognito.send(
        new ListUsersInGroupCommand({ UserPoolId: userPoolId, GroupName: groupName, Limit: 60, NextToken: nextToken }),
    );

    if (!users.Users) {
        return [];
    }

    if (users.NextToken) {
        return [...users.Users, ...(await getAllUsersInGroup(groupName, users.NextToken))];
    } else {
        return users.Users;
    }
};

export const getAllUsersEmailsInGroups = async (
    groupNames: string[],
    orgIds: string[],
): Promise<{ email: string; orgId: string }[]> => {
    const usersEmailsOrgIds: { email: string; orgId: string }[] = [];
    for (const groupName of groupNames) {
        const groupUsers = await getAllUsersInGroup(groupName);
        if (!groupUsers || groupUsers.length === 0) {
            continue;
        }
        for (const user of groupUsers) {
            if (!user.Attributes) {
                continue;
            }
            const customOrgId = user?.Attributes?.find((attr) => attr.Name === "custom:orgId")?.Value;
            if (!customOrgId || customOrgId.length === 0) {
                continue;
            }
            if (orgIds.includes(customOrgId)) {
                const email = user?.Attributes?.find((attr) => attr.Name === "email")?.Value;
                if (!email) {
                    continue;
                }
                usersEmailsOrgIds.push({ email, orgId: customOrgId });
            }
        }
    }
    return usersEmailsOrgIds;
};

export const getUsersEmailsByAttribute = async (
    attributeToHave: string,
    attributeToGet: string,
    attributeToHaveValue: string,
): Promise<string[]> => {
    const params = {
        UserPoolId: userPoolId,
        AttributesToGet: [attributeToGet],
    };

    const command = new ListUsersCommand(params);
    const data = await cognito.send(command);

    if (!data.Users) {
        return [];
    }

    const users: UserType[] = data.Users ?? [];
    const emails: string[] = [];
    for (const user of users) {
        if (user.Attributes) {
            const shouldEmail = user.Attributes.find((attr) => attr.Name === attributeToHave);
            if (shouldEmail && shouldEmail.Value === attributeToHaveValue) {
                const emailAttribute = user.Attributes.find((attr) => attr.Name === attributeToGet);
                if (emailAttribute && emailAttribute.Value) {
                    emails.push(emailAttribute.Value);
                }
            }
        }
    }

    return emails;
};
