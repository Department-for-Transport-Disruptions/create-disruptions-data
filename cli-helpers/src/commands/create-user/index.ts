import {
    AdminAddUserToGroupCommand,
    AdminCreateUserCommand,
    CognitoIdentityProviderClient,
    ListUserPoolsCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { Command, Flags } from "@oclif/core";
import inquirer from "inquirer";
import { z } from "zod";
import { UserGroups } from "../../../../shared-ts/enums.js";
import { recursiveQuery } from "../../utils.js";
import { orgsSchema } from "../../utils.js";

const generatePassword = (length: number): string => {
    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "$-_";

    let password = [
        uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)],
        lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)],
        numbers[Math.floor(Math.random() * numbers.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
    ];

    const allChars = uppercaseChars + lowercaseChars + numbers + symbols;

    for (let i = password.length; i < length; i++) {
        password.push(allChars[Math.floor(Math.random() * allChars.length)]);
    }

    password = password.sort(() => Math.random() - 0.5);

    return password.join("");
};

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "eu-west-2" }));
const cognito = new CognitoIdentityProviderClient({
    region: "eu-west-2",
});

const subOrganisationSchema = z.object({
    name: z.string(),
    PK: z.string(),
    nocCodes: z.array(z.string()),
    SK: z.string(),
});

const operatorOrgSchema = subOrganisationSchema.transform((data) => ({
    orgId: data.PK,
    operatorOrgId: data.SK.replace("OPERATOR#", ""),
    name: data.name,
    nocCodes: data.nocCodes,
}));

const operatorOrgListSchema = z.array(operatorOrgSchema);

type SubOrganisation = z.infer<typeof subOrganisationSchema>;

const listOperatorsForOrg = async (orgId: string, stage: string) => {
    let dbData: Record<string, unknown>[] = [];

    dbData = await recursiveQuery(ddbDocClient, {
        TableName: `cdd-organisations-v2-table-${stage}`,
        KeyConditionExpression: "PK = :1 AND begins_with(SK, :2)",
        ExpressionAttributeValues: {
            ":1": orgId,
            ":2": "OPERATOR",
        },
    });

    const operators = dbData.map((item) => ({
        PK: (item as SubOrganisation).PK,
        name: (item as SubOrganisation).name,
        nocCodes: (item as SubOrganisation).nocCodes,
        SK: (item as SubOrganisation).SK?.slice(9),
    }));

    const parsedOperators = operatorOrgListSchema.safeParse(operators);

    if (!parsedOperators.success) {
        return [];
    }

    return parsedOperators.data;
};

export default class CreateUser extends Command {
    static description = "Create user";

    static flags = {
        orgId: Flags.string({ description: "ID for organisation that user belongs to" }),
        group: Flags.string({ description: "Cognito group to add user to" }),
        operatorOrgId: Flags.string({ description: "Enter the operatorOrgId for the operator user" }),
        email: Flags.string({ description: "Email for user" }),
        firstName: Flags.string({ description: "First name of user" }),
        lastName: Flags.string({ description: "Last name of user" }),
        poolId: Flags.string({ description: "ID of user pool to add user to" }),
        stage: Flags.string({ description: "SST stage to use", required: true }),
    };

    async run(): Promise<void> {
        const { flags } = await this.parse(CreateUser);

        let { orgId, group, email, firstName, lastName, stage, poolId, operatorOrgId } = flags;

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
                    FilterExpression: "SK = :info",
                    ExpressionAttributeValues: {
                        ":info": "INFO",
                    },
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

        if (group && group === UserGroups.operators && orgId && !operatorOrgId) {
            const operators = await listOperatorsForOrg(orgId, flags.stage);
            const responses = await inquirer.prompt([
                {
                    name: "operator",
                    message: "Select an operator",
                    type: "list",
                    choices: operators.map((operator) => ({ name: operator.name, value: operator.operatorOrgId })),
                },
            ]);

            operatorOrgId = responses.operator;
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

        const key = generatePassword(20);

        const createUserResult = await cognito.send(
            new AdminCreateUserCommand({
                Username: email,
                UserPoolId: poolId,
                TemporaryPassword: key,
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
                    ...(operatorOrgId
                        ? [
                              {
                                  Name: "custom:operatorOrgId",
                                  Value: operatorOrgId,
                              },
                          ]
                        : []),
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

        const url =
            stage === "prod" ? "https://disruption-data.dft.gov.uk" : `https://${stage}.cdd.dft-create-data.com`;

        console.log(`Registration Link: ${url}/register?key=${key}&email=${email}&orgId=${orgId}`);
    }
}
