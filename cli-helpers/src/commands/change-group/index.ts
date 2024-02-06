import {
    AdminAddUserToGroupCommand,
    AdminListGroupsForUserCommand,
    AdminRemoveUserFromGroupCommand,
    CognitoIdentityProviderClient,
    ListUserPoolsCommand,
    ListUsersCommand,
    UserType,
} from "@aws-sdk/client-cognito-identity-provider";
import { Command, Flags } from "@oclif/core";
import inquirer from "inquirer";

import { UserGroups } from "../../../../shared-ts/enums.js";

const cognito = new CognitoIdentityProviderClient({
    region: "eu-west-2",
});

const getUsers = async (poolId: string | undefined, paginationToken?: string): Promise<UserType[]> => {
    const users = await cognito.send(
        new ListUsersCommand({
            AttributesToGet: ["email"],
            Limit: 5,
            UserPoolId: poolId,
            ...(paginationToken ? { PaginationToken: paginationToken } : {}),
        }),
    );

    if (!users.Users) {
        return [];
    }

    if (users.PaginationToken) {
        return [...users.Users, ...(await getUsers(poolId, users.PaginationToken))];
    }

    return users.Users;
};

export default class CreateUser extends Command {
    static description = "Create user";

    static flags = {
        email: Flags.string({ description: "Email for user" }),
        group: Flags.string({ description: "Cognito group to add user to" }),
        poolId: Flags.string({ description: "ID of user pool to add user to" }),
        stage: Flags.string({ description: "SST stage to use", required: true }),
    };

    async run(): Promise<void> {
        const { flags } = await this.parse(CreateUser);

        let { email, group, poolId, stage } = flags;

        if (!poolId) {
            const userPoolsResult = await cognito.send(
                new ListUserPoolsCommand({
                    MaxResults: 10,
                }),
            );

            const userPools = userPoolsResult.UserPools?.filter((pool) => pool.Name?.includes(stage)) ?? [];

            const responses = await inquirer.prompt([
                {
                    choices: userPools.map((pool) => ({ name: pool.Name, value: pool.Id })),
                    message: "Select the user pool",
                    name: "poolId",
                    type: "list",
                },
            ]);

            poolId = responses.poolId;
        }

        if (!group) {
            const responses = await inquirer.prompt([
                {
                    choices: Object.values(UserGroups).map((group) => ({ name: group })),
                    message: "Select a group",
                    name: "group",
                    type: "list",
                },
            ]);

            group = responses.group;
        }

        if (!email) {
            const userList = await getUsers(poolId);

            if (!userList) {
                throw new Error("No users found");
            }

            const emails = userList.map((user) => user.Attributes?.[0].Value).filter((value) => value !== null && value !== undefined);

            if (!emails || emails.length === 0) {
                throw new Error("No users found");
            }

            const responses = await inquirer.prompt([
                {
                    choices: emails,
                    message: "Select user",
                    name: "email",
                    type: "list",
                },
            ]);

            email = responses.email;
        }

        const existingGroups = await cognito.send(
            new AdminListGroupsForUserCommand({
                UserPoolId: poolId,
                Username: email,
            }),
        );

        if (existingGroups.Groups?.length) {
            for (const existingGroup of existingGroups.Groups) {
                await cognito.send(
                    new AdminRemoveUserFromGroupCommand({
                        GroupName: existingGroup.GroupName,
                        UserPoolId: poolId,
                        Username: email,
                    }),
                );
            }
        }

        await cognito.send(
            new AdminAddUserToGroupCommand({
                GroupName: group,
                UserPoolId: poolId,
                Username: email,
            }),
        );

        console.log(`User (${email}) added to "${group}" group`);
    }
}
