import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { BatchWriteCommand, DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const stage = process.env.STAGE as string;

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "eu-west-2" }));

export const copyOrganisations = async () => {
    const dbData = await ddbDocClient.send(
        new ScanCommand({
            TableName: `cdd-organisations-table-${stage}`,
        }),
    );

    const newTable = `cdd-organisations-v2-table-${stage}`;

    if (!dbData.Items?.length) {
        throw new Error("No orgs found");
    }

    await ddbDocClient.send(
        new BatchWriteCommand({
            RequestItems: {
                [newTable]: dbData.Items.map((org) => ({
                    PutRequest: {
                        Item: {
                            ...org,
                            SK: "INFO",
                        },
                    },
                })),
            },
        }),
    );
};

copyOrganisations().catch((e) => console.error(e));
