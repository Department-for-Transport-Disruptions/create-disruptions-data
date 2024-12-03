import { randomUUID } from "crypto";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { program } from "commander";
import * as logger from "lambda-log";
import { z } from "zod";
import { orgsSchema, withUserPrompts } from "../utils";
import { createDynamoDbDocClient } from "../utils/awsClients";

program
    .option("--stage <stage>", "SST stage to use")
    .option("--orgId <orgId>", "ID for organisation that this operator org will be linked to")
    .option("--name <name>", "Name of organisation")
    .option("--nocCodes <nocCodes>", "Comma-separated list of NOC codes")
    .action(async (options) => {
        const { stage, orgId, name, nocCodes } = await withUserPrompts(options, {
            stage: { type: "input" },
            orgId: { type: "input" },
            name: { type: "input" },
            nocCodes: { type: "input" },
        });

        const dynamoClient = createDynamoDbDocClient();

        const organisationsFromDynamo = await dynamoClient.send(
            new ScanCommand({
                TableName: `cdd-organisations-v2-table-${stage}`,
                FilterExpression: "SK = :info",
                ExpressionAttributeValues: {
                    ":info": "INFO",
                },
            }),
        );

        const orgs = z.array(orgsSchema).parse(organisationsFromDynamo.Items);

        if (!orgs.some((item) => item.PK === orgId)) {
            throw new Error(`orgId: ${orgId} cannot be found in Dynamo table: cdd-organisations-v2-table-${stage}`);
        }

        const id = randomUUID();

        await dynamoClient.send(
            new PutCommand({
                TableName: `cdd-organisations-v2-table-${stage}`,
                Item: {
                    PK: orgId,
                    SK: `OPERATOR#${id}`,
                    name: name,
                    nocCodes: (nocCodes as string)?.split(","),
                },
            }),
        );

        logger.info(`Successfully created operator organisation: ${name} with ID: ${id}`);
    });

program.parseAsync(process.argv);
