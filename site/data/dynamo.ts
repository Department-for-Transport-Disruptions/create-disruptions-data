import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ptSituationElementSchema } from "@create-disruptions-data/shared-ts/siriTypes.zod";
import { notEmpty } from "../utils";
import logger from "../utils/logger";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "eu-west-2" }));

const tableName = process.env.TABLE_NAME as string;

export const getDisruptionsDataFromDynamo = async () => {
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
        const parsedItem = ptSituationElementSchema.safeParse(item);

        if (!parsedItem.success) {
            logger.error("Error parsing disruption from dynamo");
            logger.error(parsedItem.error.stack);
            return null;
        }

        return parsedItem.data;
    }).filter(notEmpty);
};
