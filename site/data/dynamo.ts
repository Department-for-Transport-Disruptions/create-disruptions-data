import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    QueryCommand,
    DeleteCommand,
    TransactWriteCommand,
    PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { PtSituationElement } from "@create-disruptions-data/shared-ts/siriTypes";
import { Consequence } from "../schemas/consequence.schema";
import { DisruptionInfo } from "../schemas/create-disruption.schema";
import { Disruption, disruptionSchema } from "../schemas/disruption.schema";
import { notEmpty } from "../utils";
import logger from "../utils/logger";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "eu-west-2" }));

const tableName = process.env.TABLE_NAME as string;
const siriTableName = process.env.SIRI_TABLE_NAME as string;

const collectDisruptionsData = (
    disruptionItems: Record<string, unknown>[],
    disruptionId: string,
): Disruption | null => {
    const info = disruptionItems.find((item) => item.SK === `${disruptionId}#INFO`);
    const consequences = disruptionItems.filter(
        (item) => (item.SK as string).startsWith(`${disruptionId}#CONSEQUENCE`) ?? false,
    );

    const parsedDisruption = disruptionSchema.safeParse({
        ...info,
        consequences,
    });

    if (!parsedDisruption.success) {
        logger.warn(`Invalid disruption ${disruptionId} in Dynamo`);
        parsedDisruption.error.errors.forEach(error => logger.warn(`${disruptionId} - ${error.message}`));

        return null;
    }

    return parsedDisruption.data;
};

export const getPublishedDisruptionsDataFromDynamo = async (): Promise<Disruption[]> => {
    logger.info("Getting disruptions data from DynamoDB table...");

    const dbData = await ddbDocClient.send(
        new QueryCommand({
            TableName: tableName,
            KeyConditionExpression: "PK = :1",
            FilterExpression: "publishStatus = :2",
            ExpressionAttributeValues: {
                ":1": "1",
                ":2": "PUBLISHED",
            },
        }),
    );

    const disruptionIds = dbData.Items?.map((item) => (item as Disruption).disruptionId).filter(
        (value, index, array) => array.indexOf(value) === index,
    );

    return disruptionIds?.map((id) => collectDisruptionsData(dbData.Items || [], id)).filter(notEmpty) ?? [];
};

export const insertPublishedDisruptionIntoDynamoAndUpdateDraft = async (
    disruption: PtSituationElement,
    disruptionId: string,
) => {
    logger.info(`Inserting published disruption (${disruptionId}) into DynamoDB table...`);

    const consequenceUpdateCommands: {
        Update: {
            TableName: string;
            Key: Record<string, string>;
            UpdateExpression: string;
            ExpressionAttributeValues: Record<string, string>;
        };
    }[] =
        disruption.Consequences?.Consequence.map((_, index) => ({
            Update: {
                TableName: tableName,
                Key: {
                    PK: "1", // TODO: replace with user ID when we have auth
                    SK: `${disruptionId}#CONSEQUENCE#${index}`,
                },
                UpdateExpression: "SET publishStatus = :1",
                ExpressionAttributeValues: {
                    ":1": "PUBLISHED",
                },
            },
        })) ?? [];

    await ddbDocClient.send(
        new TransactWriteCommand({
            TransactItems: [
                {
                    Put: {
                        TableName: siriTableName,
                        Item: {
                            PK: "1", // TODO: replace with user ID when we have auth
                            SK: disruptionId,
                            ...disruption,
                        },
                    },
                },
                {
                    Update: {
                        TableName: tableName,
                        Key: {
                            PK: "1", // TODO: replace with user ID when we have auth
                            SK: `${disruptionId}#INFO`,
                        },
                        UpdateExpression: "SET publishStatus = :1",
                        ExpressionAttributeValues: {
                            ":1": "PUBLISHED",
                        },
                    },
                },
                ...consequenceUpdateCommands,
            ],
        }),
    );
};

export const upsertDisruptionInfo = async (disruptionInfo: DisruptionInfo) => {
    logger.info(`Updating draft disruption (${disruptionInfo.disruptionId}) in DynamoDB table...`);

    await ddbDocClient.send(
        new PutCommand({
            TableName: tableName,
            Item: {
                PK: "1", // TODO: replace with user ID when we have auth
                SK: `${disruptionInfo.disruptionId}#INFO`,
                ...disruptionInfo,
            },
        }),
    );
};

export const upsertConsequence = async (consequence: Consequence) => {
    logger.info(
        `Updating consequence ${consequence.consequenceIndex || ""} in disruption (${
            consequence.disruptionId || ""
        }) in DynamoDB table...`,
    );

    await ddbDocClient.send(
        new PutCommand({
            TableName: tableName,
            Item: {
                PK: "1", // TODO: replace with user ID when we have auth
                SK: `${consequence.disruptionId}#CONSEQUENCE#${consequence.consequenceIndex}`,
                ...consequence,
            },
        }),
    );
};

export const removeConsequenceFromDisruption = async (index: number, disruptionId: string) => {
    logger.info(`Updating consequence ${index} in disruption (${disruptionId}) in DynamoDB table...`);

    await ddbDocClient.send(
        new DeleteCommand({
            TableName: tableName,
            Key: {
                PK: "1", // TODO: replace with user ID when we have auth
                SK: `${disruptionId}#CONSEQUENCE#${index}`,
            },
        }),
    );
};

export const getDisruptionById = async (disruptionId: string): Promise<Disruption | null> => {
    logger.info(`Retrieving (${disruptionId}) from DynamoDB table...`);

    const dynamoDisruption = await ddbDocClient.send(
        new QueryCommand({
            TableName: tableName,
            KeyConditionExpression: "PK = :1 and begins_with(SK, :2)",
            ExpressionAttributeValues: {
                ":1": "1", // TODO: replace with user ID when we have auth,
                ":2": `${disruptionId}`,
            },
        }),
    );

    if (!dynamoDisruption.Items) {
        return null;
    }

    const info = dynamoDisruption.Items.find((item) => item.SK === `${disruptionId}#INFO`);
    const consequences = dynamoDisruption.Items.filter(
        (item) => (item.SK as string).startsWith(`${disruptionId}#CONSEQUENCE`) ?? false,
    );

    const parsedDisruption = disruptionSchema.safeParse({
        ...info,
        consequences,
    });

    if (!parsedDisruption.success) {
        logger.warn(`Invalid disruption ${disruptionId} in Dynamo`);

        return null;
    }

    return parsedDisruption.data;
};
