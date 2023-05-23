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
import { SocialMediaPost } from "../schemas/social-media.schema";
import { notEmpty, flattenZodErrors } from "../utils";
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
) => {
    logger.info(`Inserting published disruption (${disruption.disruptionId}) into DynamoDB table...`);

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

export const upsertSocialMediaPost = async (
    socialMediaPost: SocialMediaPost | Pick<SocialMediaPost, "disruptionId" | "socialMediaPostIndex">,
    id: string,
) => {
    logger.info(
        `Updating socialMediaPost index ${socialMediaPost.socialMediaPostIndex || ""} in disruption (${
            socialMediaPost.socialMediaPostIndex || ""
        }) in DynamoDB table...`,
    );
    const currentDisruption = await getDisruptionById(socialMediaPost.disruptionId, id);
    const isEditing =
        currentDisruption?.publishStatus === PublishStatus.published ||
        currentDisruption?.publishStatus === PublishStatus.editing ||
        currentDisruption?.publishStatus === PublishStatus.pendingApproval;
    await ddbDocClient.send(
        new PutCommand({
            TableName: tableName,
            Item: {
                PK: id,
                SK: `${socialMediaPost.disruptionId}#SOCIALMEDIAPOST#${socialMediaPost.socialMediaPostIndex}${
                    isEditing ? "#EDIT" : ""
                }`,
                ...socialMediaPost,
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
    if (!dynamoDisruption.Items) {
        return null;
    }
    const isEdited = dynamoDisruption.Items.some((item) => (item.SK as string).includes("#EDIT"));
    let info = dynamoDisruption.Items.find((item) => item.SK === `${disruptionId}#INFO`);

    let consequences = dynamoDisruption.Items.filter(
        (item) =>
            ((item.SK as string).startsWith(`${disruptionId}#CONSEQUENCE`) && !(item.SK as string).includes("#EDIT")) ??
            false,
    );
    if (isEdited) {
        info = dynamoDisruption.Items.find((item) => item.SK === `${disruptionId}#INFO#EDIT`) ?? info;
        const editedConsequences = dynamoDisruption.Items.filter(
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
                consequences[existingIndex] = editedConsequence;
            } else {
                consequences.push(editedConsequence);
            }
        });
    }

    consequences = consequences.filter((consequence) => !consequence.isDeleted);

    const parsedDisruption = disruptionSchema.safeParse({
        ...info,
        consequences,
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
