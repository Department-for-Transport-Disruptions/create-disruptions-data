import { Command, Flags } from "@oclif/core";
import {
    AdminAddUserToGroupCommand,
    AdminListGroupsForUserCommand,
    AdminRemoveUserFromGroupCommand,
    CognitoIdentityProviderClient,
    ListUserPoolsCommand,
    ListUsersCommand,
    UserType,
} from "@aws-sdk/client-cognito-identity-provider";
import { UserGroups } from "../../../../shared-ts/enums";
import inquirer from "inquirer";
import { notEmpty } from "../../../../shared-ts/utils";

const cognito = new CognitoIdentityProviderClient({
    region: "eu-west-2",
});

const getUsers = async (poolId: string | undefined, paginationToken?: string): Promise<UserType[]> => {
    const users = await cognito.send(
        new ListUsersCommand({
            UserPoolId: poolId,
            AttributesToGet: ["email"],
            Limit: 5,
            ...(paginationToken ? { PaginationToken: paginationToken } : {}),
        }),
    );

    if (!users.Users) {
        return [];
    }

    if (users.PaginationToken) {
        return [...users.Users, ...(await getUsers(poolId, users.PaginationToken))];
    } else {
        return users.Users;
    }
};

export default class CreateUser extends Command {
    static description = "Create user";

    static flags = {
        group: Flags.string({ description: "Cognito group to add user to" }),
        email: Flags.string({ description: "Email for user" }),
        poolId: Flags.string({ description: "ID of user pool to add user to" }),
        stage: Flags.string({ description: "SST stage to use", required: true }),
    };

    async run(): Promise<void> {
        const { flags } = await this.parse(CreateUser);

        let { group, email, stage, poolId } = flags;

        if (!poolId) {
            const userPoolsResult = await cognito.send(
                new ListUserPoolsCommand({
                    MaxResults: 10,
                }),
            );

            const userPools = userPoolsResult.UserPools?.filter((pool) => pool.Name?.includes(stage)) ?? [];

            const responses = await inquirer.prompt([
                {
                    name: "poolId",
                    message: "Select the user pool",
                    type: "list",
                    choices: userPools.map((pool) => ({ name: pool.Name, value: pool.Id })),
                },
            ]);

            poolId = responses.poolId;
        }

        if (!group) {
            const responses = await inquirer.prompt([
                {
                    name: "group",
                    message: "Select a group",
                    type: "list",
                    choices: Object.values(UserGroups).map((group) => ({ name: group })),
                },
            ]);

            group = responses.group;
        }

        if (!email) {
            const userList = await getUsers(poolId);

            if (!userList) {
                throw new Error("No users found");
            }

            const emails = userList.map((user) => user.Attributes?.[0].Value).filter(notEmpty);

            if (!emails || emails.length === 0) {
                throw new Error("No users found");
            }

            const responses = await inquirer.prompt([
                {
                    name: "email",
                    message: "Select user",
                    type: "list",
                    choices: emails,
                },
            ]);

            email = responses.email;
        }

        const existingGroups = await cognito.send(
            new AdminListGroupsForUserCommand({
                Username: email,
                UserPoolId: poolId,
            }),
        );

        if (existingGroups.Groups?.length) {
            for (const existingGroup of existingGroups.Groups) {
                await cognito.send(
                    new AdminRemoveUserFromGroupCommand({
                        Username: email,
                        UserPoolId: poolId,
                        GroupName: existingGroup.GroupName,
                    }),
                );
            }
        }

        await cognito.send(
            new AdminAddUserToGroupCommand({
                GroupName: group,
                Username: email,
                UserPoolId: poolId,
            }),
        );

        console.log(`User (${email}) added to "${group}" group`);
    }
}
