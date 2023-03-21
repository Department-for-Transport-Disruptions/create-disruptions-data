import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ptSituationElementSchema } from "@create-disruptions-data/shared-ts/siriTypes.zod";
import logger from "../utils/logger";

export const getDdbClient = (): DynamoDBClient => new DynamoDBClient({ region: "eu-west-2" });

export const getDdbDocumentClient = (ddbClient = getDdbClient()): DynamoDBDocumentClient =>
    DynamoDBDocumentClient.from(ddbClient);

export const getDisruptionsDataFromDynamo = async (ddbDocClient: DynamoDBDocumentClient, tableName: string) => {
    logger.info("Getting disruptions data from DynamoDB table...");

    const dbData = await ddbDocClient.send(
        new QueryCommand({
            TableName: tableName,
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
