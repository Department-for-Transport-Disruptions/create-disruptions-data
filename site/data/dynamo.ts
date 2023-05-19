import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    QueryCommand,
    DeleteCommand,
    TransactWriteCommand,
    PutCommand,
    GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { PtSituationElement } from "@create-disruptions-data/shared-ts/siriTypes";
import { Consequence } from "../schemas/consequence.schema";
import { DisruptionInfo } from "../schemas/create-disruption.schema";
import { Disruption, disruptionSchema } from "../schemas/disruption.schema";
import { Organisation, organisationSchema } from "../schemas/organisation.schema";
import { notEmpty, flattenZodErrors, splitCamelCaseToString } from "../utils";
import { getDate } from "../utils/dates";
import logger from "../utils/logger";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "eu-west-2" }));

const tableName = process.env.TABLE_NAME as string;
const siriTableName = process.env.SIRI_TABLE_NAME as string;
const organisationsTableName = process.env.ORGANISATIONS_TABLE_NAME as string;

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
        logger.warn(flattenZodErrors(parsedDisruption.error));

        return null;
    }

    return parsedDisruption.data;
};
export const getPublishedDisruptionsDataFromDynamo = async (id: string): Promise<Disruption[]> => {
    logger.info("Getting disruptions data from DynamoDB table...");

    const dbData = await ddbDocClient.send(
        new QueryCommand({
            TableName: tableName,
            KeyConditionExpression: "PK = :1",
            FilterExpression: "publishStatus = :2",
            ExpressionAttributeValues: {
                ":1": id,
                ":2": PublishStatus.published,
            },
        }),
    );

    const disruptionIds = dbData.Items?.map((item) => (item as Disruption).disruptionId).filter(
        (value, index, array) => array.indexOf(value) === index,
    );

    return disruptionIds?.map((id) => collectDisruptionsData(dbData.Items || [], id)).filter(notEmpty) ?? [];
};

export const getDisruptionsDataFromDynamo = async (id: string): Promise<Disruption[]> => {
    logger.info("Getting disruptions data from DynamoDB table...");

    const dbData = await ddbDocClient.send(
        new QueryCommand({
            TableName: tableName,
            KeyConditionExpression: "PK = :1",
            ExpressionAttributeValues: {
                ":1": id,
            },
        }),
    );

    const disruptionIds = dbData.Items?.map((item) => (item as Disruption).disruptionId).filter(
        (value, index, array) => array.indexOf(value) === index,
    );

    return disruptionIds?.map((id) => collectDisruptionsData(dbData.Items || [], id)).filter(notEmpty) ?? [];
};

export const getOrganisationInfoById = async (orgId: string): Promise<Organisation | null> => {
    logger.info(`Getting organisation (${orgId}) from DynamoDB table...`);

    const dbData = await ddbDocClient.send(
        new GetCommand({
            TableName: organisationsTableName,
            Key: {
                PK: orgId,
            },
        }),
    );

    const parsedOrg = organisationSchema.safeParse(dbData.Item);

    if (!parsedOrg.success) {
        return null;
    }

    return parsedOrg.data;
};

export const deletePublishedDisruption = async (disruption: Disruption, disruptionId: string, id: string) => {
    logger.info(`Deleting published disruption (${disruptionId}) from DynamoDB table...`);

    const consequenceDeleteCommands: {
        Delete: {
            TableName: string;
            Key: Record<string, string>;
        };
    }[] =
        disruption?.consequences?.map((_, index) => ({
            Delete: {
                TableName: tableName,
                Key: {
                    PK: id,
                    SK: `${disruptionId}#CONSEQUENCE#${index}`,
                },
            },
        })) ?? [];

    const editedConsequenceDeleteCommands: {
        Delete: {
            TableName: string;
            Key: Record<string, string>;
        };
    }[] =
        disruption?.consequences?.map((_, index) => ({
            Delete: {
                TableName: tableName,
                Key: {
                    PK: id,
                    SK: `${disruptionId}#CONSEQUENCE#${index}#EDIT`,
                },
            },
        })) ?? [];

    await ddbDocClient.send(
        new TransactWriteCommand({
            TransactItems: [
                {
                    Delete: {
                        TableName: siriTableName,
                        Key: {
                            PK: id,
                            SK: disruptionId,
                        },
                    },
                },
                {
                    Delete: {
                        TableName: tableName,
                        Key: {
                            PK: id,
                            SK: `${disruptionId}#INFO`,
                        },
                    },
                },
                {
                    Delete: {
                        TableName: tableName,
                        Key: {
                            PK: id,
                            SK: `${disruptionId}#INFO#EDIT`,
                        },
                    },
                },
                ...consequenceDeleteCommands,
                ...editedConsequenceDeleteCommands,
            ],
        }),
    );
};

export const insertPublishedDisruptionIntoDynamoAndUpdateDraft = async (
    ptSituationElement: PtSituationElement,
    disruption: Disruption,
    id: string,
    status: PublishStatus,
    user: string,
    isEdit: boolean,
) => {
    logger.info(`Inserting published disruption (${disruption.disruptionId}) into DynamoDB table...`);

    const currentTime = getDate();

    const consequenceUpdateCommands: {
        Update: {
            TableName: string;
            Key: Record<string, string>;
            UpdateExpression: string;
            ExpressionAttributeValues: Record<string, string>;
        };
    }[] =
        disruption.consequences?.map((consequence) => ({
            Update: {
                TableName: tableName,
                Key: {
                    PK: id,
                    SK: `${disruption.disruptionId}#CONSEQUENCE#${consequence.consequenceIndex}`,
                },
                UpdateExpression: "SET publishStatus = :1",
                ExpressionAttributeValues: {
                    ":1": status,
                },
            },
        })) ?? [];

    const putSiriTable =
        status === PublishStatus.published
            ? [
                  {
                      Put: {
                          TableName: siriTableName,
                          Item: {
                              PK: id,
                              SK: disruption.disruptionId,
                              ...ptSituationElement,
                          },
                      },
                  },
              ]
            : [];

    const historyItems = disruption.newHistory;

    if (!isEdit) {
        historyItems?.push(
            status === PublishStatus.pendingApproval
                ? "Disruption submitted for review"
                : "Disruption created and published",
        );
    }

    const historyPutCommand = historyItems
        ? [
              {
                  Put: {
                      TableName: tableName,
                      Item: {
                          PK: id,
                          SK: `${disruption.disruptionId}#HISTORY#${currentTime.unix()}`,
                          historyItems,
                          user,
                          datetime: currentTime.toISOString(),
                          status,
                      },
                  },
              },
          ]
        : [];

    await ddbDocClient.send(
        new TransactWriteCommand({
            TransactItems: [
                ...putSiriTable,
                {
                    Update: {
                        TableName: tableName,
                        Key: {
                            PK: id,
                            SK: `${disruption.disruptionId}#INFO`,
                        },
                        UpdateExpression: "SET publishStatus = :1",
                        ExpressionAttributeValues: {
                            ":1": status,
                        },
                    },
                },
                ...consequenceUpdateCommands,
                ...historyPutCommand,
            ],
        }),
    );
};

export const upsertDisruptionInfo = async (disruptionInfo: DisruptionInfo, id: string) => {
    logger.info(`Updating draft disruption (${disruptionInfo.disruptionId}) in DynamoDB table...`);
    const currentDisruption = await getDisruptionById(disruptionInfo.disruptionId, id);
    const isEditing =
        currentDisruption?.publishStatus === PublishStatus.published ||
        currentDisruption?.publishStatus === PublishStatus.editing ||
        currentDisruption?.publishStatus === PublishStatus.pendingApproval;

    await ddbDocClient.send(
        new PutCommand({
            TableName: tableName,
            Item: {
                PK: id,
                SK: `${disruptionInfo.disruptionId}#INFO${isEditing ? "#EDIT" : ""}`,
                ...disruptionInfo,
            },
        }),
    );
};

export const upsertConsequence = async (
    consequence: Consequence | Pick<Consequence, "disruptionId" | "consequenceIndex">,
    id: string,
) => {
    logger.info(
        `Updating consequence index ${consequence.consequenceIndex || ""} in disruption (${
            consequence.disruptionId || ""
        }) in DynamoDB table...`,
    );
    const currentDisruption = await getDisruptionById(consequence.disruptionId, id);
    const isEditing =
        currentDisruption?.publishStatus === PublishStatus.published ||
        currentDisruption?.publishStatus === PublishStatus.editing ||
        currentDisruption?.publishStatus === PublishStatus.pendingApproval;
    await ddbDocClient.send(
        new PutCommand({
            TableName: tableName,
            Item: {
                PK: id,
                SK: `${consequence.disruptionId}#CONSEQUENCE#${consequence.consequenceIndex}${
                    isEditing ? "#EDIT" : ""
                }`,
                ...consequence,
            },
        }),
    );
};

export const removeConsequenceFromDisruption = async (index: number, disruptionId: string, id: string) => {
    logger.info(`Updating consequence ${index} in disruption (${disruptionId}) in DynamoDB table...`);

    await ddbDocClient.send(
        new DeleteCommand({
            TableName: tableName,
            Key: {
                PK: id,
                SK: `${disruptionId}#CONSEQUENCE#${index}`,
            },
        }),
    );
};

export const getDisruptionById = async (disruptionId: string, id: string): Promise<Disruption | null> => {
    logger.info(`Retrieving (${disruptionId}) from DynamoDB table...`);
    const dynamoDisruption = await ddbDocClient.send(
        new QueryCommand({
            TableName: tableName,
            KeyConditionExpression: "PK = :1 and begins_with(SK, :2)",
            ExpressionAttributeValues: {
                ":1": id,
                ":2": `${disruptionId}`,
            },
        }),
    );

    const { Items: disruptionItems } = dynamoDisruption;

    if (!disruptionItems) {
        return null;
    }
    const isEdited = disruptionItems.some((item) => (item.SK as string).includes("#EDIT"));
    let info = disruptionItems.find((item) => item.SK === `${disruptionId}#INFO`);

    const consequences = disruptionItems.filter(
        (item) =>
            ((item.SK as string).startsWith(`${disruptionId}#CONSEQUENCE`) && !(item.SK as string).includes("#EDIT")) ??
            false,
    );

    const history = disruptionItems.filter(
        (item) => (item.SK as string).startsWith(`${disruptionId}#HISTORY`) ?? false,
    );

    const newHistoryItems: string[] = [];

    if (isEdited) {
        const editedInfo = disruptionItems.find((item) => item.SK === `${disruptionId}#INFO#EDIT`);

        if (editedInfo) {
            newHistoryItems.push("Disruption Overview: Edited");
        }

        info = editedInfo
            ? {
                  ...editedInfo,
                  isEdited: true,
              }
            : info;

        const editedConsequences = disruptionItems.filter(
            (item) =>
                ((item.SK as string).startsWith(`${disruptionId}#CONSEQUENCE`) &&
                    (item.SK as string).endsWith("#EDIT")) ??
                false,
        );
        editedConsequences.forEach((editedConsequence) => {
            const existingIndex = consequences.findIndex(
                (c) => c.consequenceIndex === editedConsequence.consequenceIndex,
            );
            if (existingIndex > -1) {
                if (editedConsequence.isDeleted) {
                    newHistoryItems.push(
                        `Disruption Consequence - ${splitCamelCaseToString(
                            consequences[existingIndex].consequenceType as string,
                        )}: Deleted`,
                    );
                } else {
                    newHistoryItems.push(
                        `Disruption Consequence - ${splitCamelCaseToString(
                            editedConsequence.consequenceType as string,
                        )}: Edited`,
                    );
                }

                consequences[existingIndex] = editedConsequence;
            } else {
                if (editedConsequence.consequenceType) {
                    newHistoryItems.push(
                        `Disruption Consequence - ${splitCamelCaseToString(
                            editedConsequence.consequenceType as string,
                        )}: Added`,
                    );

                    consequences.push(editedConsequence);
                }
            }
        });
    }

    const consequencesToShow: Record<string, unknown>[] = [];
    const deletedConsequences: Record<string, unknown>[] = [];

    consequences.forEach((consequence) => {
        if (consequence.isDeleted) {
            deletedConsequences.push(consequence);
        } else {
            consequencesToShow.push(consequence);
        }
    });

    const parsedDisruption = disruptionSchema.safeParse({
        ...info,
        consequences: consequencesToShow,
        deletedConsequences,
        history,
        newHistory: newHistoryItems,
        publishStatus: isEdited ? PublishStatus.editing : (info?.publishStatus as string),
    });

    if (!parsedDisruption.success) {
        logger.warn(`Invalid disruption ${disruptionId} in Dynamo`);
        return null;
    }
    return parsedDisruption.data;
};

export const publishEditedConsequences = async (disruptionId: string, id: string) => {
    logger.info(`Publishing (${disruptionId}) in DynamoDB table...`);
    const dynamoDisruption = await ddbDocClient.send(
        new QueryCommand({
            TableName: tableName,
            KeyConditionExpression: "PK = :1 and begins_with(SK, :2)",
            ExpressionAttributeValues: {
                ":1": id,
                ":2": `${disruptionId}`,
            },
        }),
    );

    if (dynamoDisruption.Items) {
        const editedConsequences: Record<string, unknown>[] = [];
        const deleteConsequences: Record<string, unknown>[] = [];
        const editedDisruption: Record<string, unknown>[] = [];

        dynamoDisruption.Items.forEach((item) => {
            if (
                (item.SK as string).startsWith(`${disruptionId}#CONSEQUENCE`) &&
                (item.SK as string).includes("#EDIT")
            ) {
                if (item.isDeleted) {
                    deleteConsequences.push(item);
                } else {
                    editedConsequences.push(item);
                }
            }

            if ((item.SK as string) === `${disruptionId}#INFO#EDIT`) {
                editedDisruption.push(item);
            }
        });

        if (editedConsequences.length > 0 || editedDisruption.length > 0 || deleteConsequences.length > 0)
            await ddbDocClient.send(
                new TransactWriteCommand({
                    TransactItems: [
                        ...editedDisruption.map((disruption) => ({
                            Put: {
                                TableName: tableName,
                                Item: {
                                    ...disruption,
                                    PK: id,
                                    SK: `${disruptionId}#INFO`,
                                },
                            },
                        })),
                        ...editedConsequences.map((consequence) => ({
                            Put: {
                                TableName: tableName,
                                Item: {
                                    ...consequence,
                                    PK: id,
                                    SK: `${disruptionId}#CONSEQUENCE#${consequence.consequenceIndex as string}`,
                                },
                            },
                        })),
                        ...deleteConsequences.map((consequence) => ({
                            Delete: {
                                TableName: tableName,
                                Key: {
                                    PK: id,
                                    SK: `${disruptionId}#CONSEQUENCE#${consequence.consequenceIndex as string}`,
                                },
                            },
                        })),
                    ],
                }),
            );
    }
};

export const deleteDisruptionsInEdit = async (disruptionId: string, id: string) => {
    logger.info(`Deleting edited disruptions (${disruptionId}) from DynamoDB table...`);
    const dynamoDisruption = await ddbDocClient.send(
        new QueryCommand({
            TableName: tableName,
            KeyConditionExpression: "PK = :1 and begins_with(SK, :2)",
            ExpressionAttributeValues: {
                ":1": id,
                ":2": `${disruptionId}#CONSEQUENCE`,
            },
        }),
    );

    if (dynamoDisruption.Items) {
        const editedConsequences = dynamoDisruption.Items.filter(
            (item) =>
                ((item.SK as string).startsWith(`${disruptionId}#CONSEQUENCE`) &&
                    (item.SK as string).includes("#EDIT")) ??
                false,
        );

        const consequenceDeleteCommands: {
            Delete: {
                TableName: string;
                Key: Record<string, string>;
            };
        }[] =
            editedConsequences.map((consequence) => ({
                Delete: {
                    TableName: tableName,
                    Key: {
                        PK: id,
                        SK: `${disruptionId}#CONSEQUENCE#${consequence.consequenceIndex as string}#EDIT`,
                    },
                },
            })) ?? [];

        await ddbDocClient.send(
            new TransactWriteCommand({
                TransactItems: [
                    {
                        Delete: {
                            TableName: tableName,
                            Key: {
                                PK: id,
                                SK: `${disruptionId}#INFO#EDIT`,
                            },
                        },
                    },
                    ...consequenceDeleteCommands,
                ],
            }),
        );
    }
};
