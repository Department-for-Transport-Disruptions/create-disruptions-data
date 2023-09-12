import { Command, Flags } from "@oclif/core";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import {
    AdminAddUserToGroupCommand,
    AdminCreateUserCommand,
    CognitoIdentityProviderClient,
    ListUserPoolsCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { UserGroups } from "../../../../shared-ts/enums";
import { z } from "zod";
import inquirer from "inquirer";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "eu-west-2" }));
const cognito = new CognitoIdentityProviderClient({
    region: "eu-west-2",
});

const orgsSchema = z.object({ PK: z.string().uuid(), name: z.string(), adminAreaCodes: z.array(z.string()) });

export default class CreateUser extends Command {
    static description = "Create user";

    static flags = {
        orgId: Flags.string({ description: "ID for organisation that user belongs to" }),
        group: Flags.string({ description: "Cognito group to add user to" }),
        email: Flags.string({ description: "Email for user" }),
        firstName: Flags.string({ description: "First name of user" }),
        lastName: Flags.string({ description: "Last name of user" }),
        poolId: Flags.string({ description: "ID of user pool to add user to" }),
        stage: Flags.string({ description: "SST stage to use", required: true }),
    };

    async run(): Promise<void> {
        const { flags } = await this.parse(CreateUser);

        let { orgId, group, email, firstName, lastName, stage, poolId } = flags;

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

        if (!orgId) {
            const orgsDb = await ddbDocClient.send(
                new ScanCommand({
                    TableName: `cdd-organisations-v2-table-${flags.stage}`,
                }),
            );

            const orgs = z.array(orgsSchema).parse(orgsDb.Items);

            const responses = await inquirer.prompt([
                {
                    name: "org",
                    message: "Select an organisation",
                    type: "list",
                    choices: orgs.map((org) => ({ name: org.name, value: org.PK })),
                },
            ]);

            orgId = responses.org;
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
            const responses = await inquirer.prompt([
                {
                    name: "email",
                    message: "Enter user's email address",
                    type: "input",
                },
            ]);

            email = responses.email;
        }

        if (!firstName) {
            const responses = await inquirer.prompt([
                {
                    name: "firstName",
                    message: "Enter user's first name",
                    type: "input",
                },
            ]);

            firstName = responses.firstName;
        }

        if (!lastName) {
            const responses = await inquirer.prompt([
                {
                    name: "lastName",
                    message: "Enter user's last name",
                    type: "input",
                },
            ]);

            lastName = responses.lastName;
        }

        const createUserResult = await cognito.send(
            new AdminCreateUserCommand({
                Username: email,
                UserPoolId: poolId,
                TemporaryPassword: Array.from(Array(20), () => Math.floor(Math.random() * 36).toString(36)).join(""),
                UserAttributes: [
                    {
                        Name: "custom:orgId",
                        Value: orgId,
                    },
                    {
                        Name: "given_name",
                        Value: firstName,
                    },
                    {
                        Name: "family_name",
                        Value: lastName,
                    },
                    {
                        Name: "email_verified",
                        Value: "true",
                    },
                    {
                        Name: "email",
                        Value: email,
                    },
                ],
            }),
        );

        await cognito.send(
            new AdminAddUserToGroupCommand({
                GroupName: group,
                Username: createUserResult.User?.Username,
                UserPoolId: poolId,
            }),
        );

        console.log(`User created, ID: ${createUserResult.User?.Username}`);
    }
}
