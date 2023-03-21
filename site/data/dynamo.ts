import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ptSituationElementSchema } from "@create-disruptions-data/shared-ts/siriTypes.zod";
import logger from "../utils/logger";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "eu-west-2" }));

export const getDisruptionsDataFromDynamo = async () => {
    logger.info("Getting disruptions data from DynamoDB table...");

    const dbData = await ddbDocClient.send(
        new QueryCommand({
            TableName: process.env.TABLE_NAME as string,
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
