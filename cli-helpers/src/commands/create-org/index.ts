import { Command, Flags } from "@oclif/core";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import inquirer from "inquirer";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "eu-west-2" }));

export default class CreateOrg extends Command {
    static description = "Create organisation";

    static flags = {
        name: Flags.string({ description: "Name of organisation" }),
        adminAreaCodes: Flags.string({ description: "Comma-separated list of admin area codes" }),
        stage: Flags.string({ description: "SST stage to use", required: true }),
    };

    async run(): Promise<void> {
        const { flags } = await this.parse(CreateOrg);

        let { name, adminAreaCodes, stage } = flags;

        const id = randomUUID();

        if (!name) {
            const responses = await inquirer.prompt([
                {
                    name: "name",
                    message: "Insert org name",
                    type: "input",
                },
            ]);

            name = responses.name;
        }

        if (!adminAreaCodes) {
            const responses = await inquirer.prompt([
                {
                    name: "adminAreaCodes",
                    message: "Insert comma-separated list of admin area codes",
                    type: "input",
                },
            ]);

            adminAreaCodes = responses.adminAreaCodes;
        }

        await ddbDocClient.send(
            new PutCommand({
                TableName: `cdd-organisations-table-${stage}`,
                Item: {
                    PK: id,
                    name: name,
                    adminAreaCodes: adminAreaCodes?.split(",").map((item) => item.trim()),
                },
            }),
        );

        console.log(`Organisation created, ID: ${id}`);
    }
}
