import { randomUUID } from "crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { Command, Flags } from "@oclif/core";
import inquirer from "inquirer";
import { z } from "zod";
import { orgsSchema } from "../../utils.js";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "eu-west-2" }));

export const createOperatorSubOrganisation = async (
    orgId: string,
    operatorName: string,
    nocCodes: string[],
    stage: string,
) => {
    const uuid = randomUUID();

    await ddbDocClient.send(
        new PutCommand({
            TableName: `cdd-organisations-v2-table-${stage}`,
            Item: {
                PK: orgId,
                SK: `OPERATOR#${uuid}`,
                name: operatorName,
                nocCodes: nocCodes,
            },
        }),
    );
    return uuid;
};

export default class CreateOperatorOrg extends Command {
    static description = "Create operator organisation";

    static flags = {
        orgId: Flags.string({ description: "ID for organisation that this operator org will be linked to" }),
        name: Flags.string({ description: "Name of organisation" }),
        nocCodes: Flags.string({ description: "Comma-separated list of admin area codes" }),
        stage: Flags.string({ description: "SST stage to use", required: true }),
    };

    async run(): Promise<void> {
        const { flags } = await this.parse(CreateOperatorOrg);

        let { name, nocCodes, stage, orgId } = flags;

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

        if (!name) {
            const responses = await inquirer.prompt([
                {
                    name: "name",
                    message: "Insert operator name",
                    type: "input",
                },
            ]);

            name = responses.name;
        }

        if (!nocCodes) {
            const responses = await inquirer.prompt([
                {
                    name: "nocCodes",
                    message: "Insert comma-separated list of noc codes",
                    type: "input",
                },
            ]);

            nocCodes = responses.nocCodes;
        }

        if (orgId && name && nocCodes) {
            const id = await createOperatorSubOrganisation(orgId, name, (nocCodes as string)?.split(","), stage);

            console.log(`Operator organisation created, ID: ${id}`);
        }
    }
}
