import { randomUUID } from "crypto";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { program } from "commander";
import * as logger from "lambda-log";
import { withUserPrompts } from "../utils";
import { createDynamoDbDocClient } from "../utils/awsClients";

program
    .option("--stage <stage>", "SST stage to use")
    .option("--name <name>", "Name of organisation")
    .option("--adminAreaCodes <adminAreaCodes>", "Comma-separated list of admin area codes")
    .action(async (options) => {
        const { stage, name, adminAreaCodes } = await withUserPrompts(options, {
            stage: { type: "input" },
            name: { type: "input" },
            adminAreaCodes: { type: "input" },
        });

        const id = randomUUID();

        const dynamoClient = createDynamoDbDocClient();

        await dynamoClient.send(
            new PutCommand({
                TableName: `cdd-organisations-v2-table-${stage}`,
                Item: {
                    PK: id,
                    SK: "INFO",
                    name: name,
                    adminAreaCodes: adminAreaCodes?.split(",").map((item) => item.trim()),
                    mode: {
                        bus: "bods",
                        ferryService: "bods",
                        tram: "bods",
                        rail: "bods",
                    },
                },
            }),
        );

        logger.info(`Successfully created organisation: ${name}`);
    });

program.parseAsync(process.argv);
