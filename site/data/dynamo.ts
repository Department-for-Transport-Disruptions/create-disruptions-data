import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { PtSituationElement } from "@create-disruptions-data/shared-ts/siriTypes";
import { ptSituationElementSchema } from "@create-disruptions-data/shared-ts/siriTypes.zod";
import logger from "../utils/logger";

export const getDdbClient = (): DynamoDBClient => new DynamoDBClient({ region: "eu-west-2" });

export const getDdbDocumentClient = (ddbClient = getDdbClient()): DynamoDBDocumentClient =>
    DynamoDBDocumentClient.from(ddbClient);

const ddbDocClient = getDdbDocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || "";

export const getDisruptionsDataFromDynamo = async () => {
    logger.info("Getting disruptions data from DynamoDB table...");

    const dbData = await ddbDocClient.send(
        new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: "PK = :i",
            ExpressionAttributeValues: {
                ":i": "1",
            },
        }),
    );

    return dbData.Items?.map((item) => {
        delete item.PK;
        delete item.SK;

        return ptSituationElementSchema.parse(item);
    });
};

export const insertPublishedDisruptionIntoDynamo = async (disruption: PtSituationElement) => {
    logger.info("Inserting disruptions data into DynamoDB table...");

    await ddbDocClient.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                PK: "1", // TODO: replace with user ID when we have auth
                SK: disruption.SituationNumber,
                Status: "PUBLISHED",
                ...disruption,
            },
        }),
    );
};
