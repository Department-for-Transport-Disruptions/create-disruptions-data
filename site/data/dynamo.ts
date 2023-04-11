import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { PtSituationElement } from "@create-disruptions-data/shared-ts/siriTypes";
import { ptSituationElementSchema } from "@create-disruptions-data/shared-ts/siriTypes.zod";
import { Consequence } from "../schemas/consequence.schema";
import { DisruptionInfo } from "../schemas/create-disruption.schema";
import { Disruption, disruptionSchema } from "../schemas/disruption.schema";
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

export const insertPublishedDisruptionIntoDynamo = async (disruption: PtSituationElement) => {
    logger.info(`Inserting published disruption (${disruption.SituationNumber}) into DynamoDB table...`);

    await ddbDocClient.send(
        new PutCommand({
            TableName: tableName,
            Item: {
                PK: "1", // TODO: replace with user ID when we have auth
                SK: disruption.SituationNumber,
                PublishStatus: "PUBLISHED",
                ...disruption,
            },
        }),
    );
};

export const upsertDraftDisruptionIntoDynamo = async (disruptionInfo: DisruptionInfo) => {
    logger.info(`Updating draft disruption (${disruptionInfo.disruptionId}) in DynamoDB table...`);

    await ddbDocClient.send(
        new UpdateCommand({
            TableName: tableName,
            Key: {
                PK: "1", // TODO: replace with user ID when we have auth
                SK: disruptionInfo.disruptionId,
            },
            UpdateExpression:
                "SET disruptionInfo = :disruptionInfo, PublishStatus = :status, consequences = if_not_exists(consequences, :empty_list)",
            ExpressionAttributeValues: {
                ":disruptionInfo": disruptionInfo,
                ":status": "DRAFT",
                ":empty_list": [],
            },
        }),
    );
};

// export const addConsequenceToDisruption = async (consequence: Partial<Consequence>) => {
//     logger.info(`Adding consequence to disruption (${consequence.id ?? ""}) in DynamoDB table...`);

//     const insertedConsequence = await ddbDocClient.send(
//         new UpdateCommand({
//             TableName: tableName,
//             Key: {
//                 PK: "1", // TODO: replace with user ID when we have auth
//                 SK: consequence.id,
//             },
//             UpdateExpression: "SET consequences = list_append(if_not_exists(consequences, :empty_list), :consequence)",
//             ExpressionAttributeValues: {
//                 ":consequence": [consequence],
//                 ":empty_list": [],
//             },
//             ReturnValues: "UPDATED_NEW",
//         }),
//     );

//     console.log("HELLO");

//     console.log(insertedConsequence.Attributes);

//     return insertedConsequence.Attributes;
// };

export const upsertConsequenceTypeInDisruption = async (consequence: Partial<Consequence>) => {
    logger.info(
        `Updating consequence ${consequence.consequenceIndex || ""} in disruption (${
            consequence.disruptionId || ""
        }) in DynamoDB table...`,
    );

    const index = consequence.consequenceIndex ?? "0";

    console.log(index);

    await ddbDocClient.send(
        new UpdateCommand({
            TableName: tableName,
            Key: {
                PK: "1", // TODO: replace with user ID when we have auth
                SK: consequence.disruptionId,
            },
            UpdateExpression: `SET consequences[${index}].disruptionId = :disruption_id, consequences[${index}].vehicleMode = :vehicle_mode, consequences[${index}].consequenceType = :consequence_type, consequences[${index}].consequenceIndex = :consequence_index`,
            ExpressionAttributeValues: {
                ":disruption_id": consequence.disruptionId,
                ":vehicle_mode": consequence.vehicleMode,
                ":consequence_type": consequence.consequenceType,
                ":consequence_index": consequence.consequenceIndex,
            },
        }),
    );
};

export const removeConsequenceFromDisruption = async (index: number, disruptionId: string) => {
    logger.info(`Updating consequence ${index} in disruption (${disruptionId}) in DynamoDB table...`);

    await ddbDocClient.send(
        new UpdateCommand({
            TableName: tableName,
            Key: {
                PK: "1", // TODO: replace with user ID when we have auth
                SK: disruptionId,
            },
            UpdateExpression: "DELETE consequences[:index]",
            ExpressionAttributeValues: {
                ":index": index,
            },
        }),
    );
};

export const getDisruptionById = async (disruptionId: string): Promise<Disruption | null> => {
    logger.info(`Retrieving (${disruptionId}) from DynamoDB table...`);

    const dynamoDisruption = await ddbDocClient.send(
        new GetCommand({
            TableName: tableName,
            Key: {
                PK: "1", // TODO: replace with user ID when we have auth
                SK: disruptionId,
            },
        }),
    );

    if (!dynamoDisruption.Item) {
        return null;
    }

    const parsedDisruption = disruptionSchema.safeParse(dynamoDisruption.Item);

    if (!parsedDisruption.success) {
        logger.error(`Invalid disruption ${disruptionId} in Dynamo`);

        return null;
    }

    return parsedDisruption.data;
};
