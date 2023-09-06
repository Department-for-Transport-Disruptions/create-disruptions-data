import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    QueryCommand,
    DeleteCommand,
    TransactWriteCommand,
    PutCommand,
    GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { Consequence, Disruption, DisruptionInfo, Validity } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { getDate, getDatetimeFromDateAndTime } from "@create-disruptions-data/shared-ts/utils/dates";
import { FullDisruption, fullDisruptionSchema } from "../schemas/disruption.schema";
import { Organisation, Organisations, organisationSchema, organisationsSchema } from "../schemas/organisation.schema";
import { SocialMediaPost, SocialMediaPostTransformed } from "../schemas/social-media.schema";
import { notEmpty, flattenZodErrors, splitCamelCaseToString } from "../utils";
import { isLiveDisruption, isUpcomingDisruption } from "../utils/dates";
import logger from "../utils/logger";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "eu-west-2" }));

const disruptionsTableName = process.env.DISRUPTIONS_TABLE_NAME as string;
const templateDisruptionsTableName = process.env.TEMPLATE_DISRUPTIONS_TABLE_NAME as string;
const organisationsTableName = process.env.ORGANISATIONS_TABLE_NAME as string;

const getTableName = (isTemplate: boolean) => {
    return isTemplate ? templateDisruptionsTableName : disruptionsTableName;
};

const collectDisruptionsData = (
    disruptionItems: Record<string, unknown>[],
    disruptionId: string,
): FullDisruption | null => {
    let info = disruptionItems.find((item) => item.SK === `${disruptionId}#INFO`);

    if (!info) {
        return null;
    }

    let consequences = disruptionItems.filter(
        (item) =>
            ((item.SK as string).startsWith(`${disruptionId}#CONSEQUENCE`) &&
                !((item.SK as string).includes("#EDIT") || (item.SK as string).includes("#PENDING"))) ??
            false,
    );

    let socialMediaPosts = disruptionItems.filter(
        (item) =>
            ((item.SK as string).startsWith(`${disruptionId}#SOCIALMEDIAPOST`) &&
                !((item.SK as string).includes("#EDIT") || (item.SK as string).includes("#PENDING"))) ??
            false,
    );

    const isEdited = disruptionItems.some((item) => (item.SK as string).includes("#EDIT"));
    const isPending = disruptionItems.some((item) => (item.SK as string).includes("#PENDING"));

    if (isPending) {
        info = disruptionItems.find((item) => item.SK === `${disruptionId}#INFO#PENDING`) ?? info;
        const pendingConsequences = disruptionItems.filter(
            (item) =>
                ((item.SK as string).startsWith(`${disruptionId}#CONSEQUENCE`) &&
                    (item.SK as string).endsWith("#PENDING")) ??
                false,
        );
        pendingConsequences.forEach((pendingConsequence) => {
            const existingIndex = consequences.findIndex(
                (c) => c.consequenceIndex === pendingConsequence.consequenceIndex,
            );
            if (existingIndex > -1) {
                consequences[existingIndex] = pendingConsequence;
            } else {
                consequences.push(pendingConsequence);
            }
        });

        const pendingSocialMediaPosts = disruptionItems.filter(
            (item) =>
                ((item.SK as string).startsWith(`${disruptionId}#SOCIALMEDIAPOST`) &&
                    (item.SK as string).endsWith("#PENDING")) ??
                false,
        );
        pendingSocialMediaPosts.forEach((pendingSocialMediaPost) => {
            const existingIndex = socialMediaPosts.findIndex(
                (s) => s.socialMediaPostIndex === pendingSocialMediaPost.socialMediaPostIndex,
            );
            if (existingIndex > -1) {
                socialMediaPosts[existingIndex] = pendingSocialMediaPost;
            } else {
                socialMediaPosts.push(pendingSocialMediaPost);
            }
        });
    }

    if (isEdited) {
        info = disruptionItems.find((item) => item.SK === `${disruptionId}#INFO#EDIT`) ?? info;
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
                consequences[existingIndex] = editedConsequence;
            } else {
                consequences.push(editedConsequence);
            }
        });

        const editedSocialMediaPosts = disruptionItems.filter(
            (item) =>
                ((item.SK as string).startsWith(`${disruptionId}#SOCIALMEDIAPOST`) &&
                    (item.SK as string).endsWith("#EDIT")) ??
                false,
        );
        editedSocialMediaPosts.forEach((editedSocialMediaPost) => {
            const existingIndex = socialMediaPosts.findIndex(
                (s) => s.socialMediaPostIndex === editedSocialMediaPost.socialMediaPostIndex,
            );
            if (existingIndex > -1) {
                socialMediaPosts[existingIndex] = editedSocialMediaPost;
            } else {
                socialMediaPosts.push(editedSocialMediaPost);
            }
        });
    }

    consequences = consequences.filter((consequence) => !consequence.isDeleted);

    socialMediaPosts = socialMediaPosts.filter((socialMediaPost) => !socialMediaPost.isDeleted);

    const parsedDisruption = fullDisruptionSchema.safeParse({
        ...info,
        consequences,
        socialMediaPosts,
    });

    if (!parsedDisruption.success) {
        logger.warn(`Invalid disruption ${disruptionId} in Dynamo`);
        logger.warn(flattenZodErrors(parsedDisruption.error));

        return null;
    }

    return parsedDisruption.data;
};

export const getPendingDisruptionsIdsFromDynamo = async (id: string): Promise<Set<string>> => {
    logger.info("Getting disruptions in pending status from DynamoDB table...");

    const dbData = await ddbDocClient.send(
        new QueryCommand({
            TableName: disruptionsTableName,
            KeyConditionExpression: "PK = :1",
            FilterExpression: "publishStatus = :2 or publishStatus = :3",
            ExpressionAttributeValues: {
                ":1": id,
                ":2": PublishStatus.pendingApproval,
                ":3": PublishStatus.editPendingApproval,
            },
        }),
    );

    const disruptionIds = new Set<string>();

    dbData.Items?.forEach((item) => {
        if (item.disruptionId && !disruptionIds.has(item.disruptionId as string)) {
            disruptionIds.add(item.disruptionId as string);
        }
    });

    return disruptionIds;
};

export const getPublishedDisruptionsDataFromDynamo = async (id: string): Promise<Disruption[]> => {
    logger.info("Getting disruptions data from DynamoDB table...");

    const dbData = await ddbDocClient.send(
        new QueryCommand({
            TableName: disruptionsTableName,
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

export const getDisruptionsDataFromDynamo = async (id: string): Promise<FullDisruption[]> => {
    logger.info("Getting disruptions data from DynamoDB table...");

    const dbData = await ddbDocClient.send(
        new QueryCommand({
            TableName: disruptionsTableName,
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

export const getPublishedSocialMediaPosts = async (orgId: string): Promise<SocialMediaPost[]> => {
    logger.info("Getting published social media data from DynamoDB table...");

    const disruptions = await getDisruptionsDataFromDynamo(orgId);

    return disruptions
        .filter((disruption) => {
            const validityPeriods: Validity[] = [
                ...(disruption.validity ?? []),
                {
                    disruptionStartDate: disruption.disruptionStartDate,
                    disruptionStartTime: disruption.disruptionStartTime,
                    disruptionEndDate: disruption.disruptionEndDate,
                    disruptionEndTime: disruption.disruptionEndTime,
                    disruptionNoEndDateTime: disruption.disruptionNoEndDateTime,
                    disruptionRepeats: disruption.disruptionRepeats,
                    disruptionRepeatsEndDate: disruption.disruptionRepeatsEndDate,
                },
            ];
            const today = getDate();
            const shouldNotDisplayDisruption = validityPeriods.every(
                (period) =>
                    !!period.disruptionEndDate &&
                    !!period.disruptionEndTime &&
                    getDatetimeFromDateAndTime(period.disruptionEndDate, period.disruptionEndTime).isBefore(today),
            );

            return (
                !shouldNotDisplayDisruption &&
                (isLiveDisruption(validityPeriods) || isUpcomingDisruption(validityPeriods, today))
            );
        })
        .flatMap((item) => item.socialMediaPosts)
        .filter(notEmpty);
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

export const getOrganisationsInfo = async (): Promise<Organisations | null> => {
    logger.info(`Getting all organisations from DynamoDB table...`);

    const dbData = await ddbDocClient.send(
        new ScanCommand({
            TableName: organisationsTableName,
        }),
    );

    const parsedOrg = organisationsSchema.safeParse(dbData.Items);

    if (!parsedOrg.success) {
        return null;
    }

    return parsedOrg.data;
};

export const deletePublishedDisruption = async (
    disruption: FullDisruption,
    disruptionId: string,
    id: string,
    isTemplate?: boolean,
) => {
    logger.info(
        `Deleting published disruption (${disruptionId}) from DynamoDB table (${getTableName(!!isTemplate)})...`,
    );

    const consequenceDeleteCommands: {
        Delete: {
            TableName: string;
            Key: Record<string, string>;
        };
    }[] =
        disruption?.consequences?.map((_, index) => ({
            Delete: {
                TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
                Key: {
                    PK: id,
                    SK: `${disruptionId}#CONSEQUENCE#${index}`,
                },
            },
        })) ?? [];

    const socialMediaPostDeleteCommands: {
        Delete: {
            TableName: string;
            Key: Record<string, string>;
        };
    }[] =
        disruption?.socialMediaPosts?.map((socialMediaPost) => {
            const getSK = isTemplate
                ? `${disruptionId}#SOCIALMEDIAPOST#${socialMediaPost.socialMediaPostIndex}#EDIT`
                : `${disruptionId}#SOCIALMEDIAPOST#${socialMediaPost.socialMediaPostIndex}`;

            return {
                Delete: {
                    TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
                    Key: {
                        PK: id,
                        SK: getSK,
                    },
                },
            };
        }) ?? [];

    const editedConsequenceDeleteCommands: {
        Delete: {
            TableName: string;
            Key: Record<string, string>;
        };
    }[] =
        disruption?.consequences?.map((_, index) => ({
            Delete: {
                TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
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
                        TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
                        Key: {
                            PK: id,
                            SK: `${disruptionId}#INFO`,
                        },
                    },
                },
                {
                    Delete: {
                        TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
                        Key: {
                            PK: id,
                            SK: `${disruptionId}#INFO#EDIT`,
                        },
                    },
                },
                ...consequenceDeleteCommands,
                ...socialMediaPostDeleteCommands,
                ...editedConsequenceDeleteCommands,
            ],
        }),
    );
};

export const insertPublishedDisruptionIntoDynamoAndUpdateDraft = async (
    disruption: FullDisruption,
    id: string,
    status: PublishStatus,
    user: string,
    history?: string,
    isTemplate?: boolean,
) => {
    logger.info(
        `Inserting published disruption (${disruption.disruptionId}) into DynamoDB table (${getTableName(
            !!isTemplate,
        )})...`,
    );

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
                TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
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

    const socialMediaPostUpdateCommands: {
        Update: {
            TableName: string;
            Key: Record<string, string>;
            UpdateExpression: string;
            ExpressionAttributeValues: Record<string, string>;
        };
    }[] =
        disruption.socialMediaPosts?.map((socialMediaPost) => ({
            Update: {
                TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
                Key: {
                    PK: id,
                    SK: `${disruption.disruptionId}#SOCIALMEDIAPOST#${socialMediaPost.socialMediaPostIndex}`,
                },
                UpdateExpression: "SET publishStatus = :1",
                ExpressionAttributeValues: {
                    ":1": status,
                },
            },
        })) ?? [];

    const historyItems = disruption.newHistory ?? [];

    if (history) {
        historyItems.push(history);
    }

    const historyPutCommand = historyItems
        ? [
              {
                  Put: {
                      TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
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
                {
                    Update: {
                        TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
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
                ...socialMediaPostUpdateCommands,
                ...historyPutCommand,
            ],
        }),
    );
};

export const updatePendingDisruptionStatus = async (disruption: Disruption, id: string, isTemplate?: boolean) => {
    logger.info(
        `Updating status of pending disruption (${disruption.disruptionId}) from DynamoDB table (${getTableName(
            !!isTemplate,
        )})...`,
    );

    await ddbDocClient.send(
        new TransactWriteCommand({
            TransactItems: [
                {
                    Put: {
                        TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
                        Item: {
                            PK: id,
                            SK: `${disruption.disruptionId}#INFO#PENDING`,
                            ...disruption,
                        },
                    },
                },
            ],
        }),
    );
};

export const upsertDisruptionInfo = async (
    disruptionInfo: DisruptionInfo,
    id: string,
    isUserStaff?: boolean,
    isTemplate?: boolean,
) => {
    logger.info(
        `Updating draft disruption (${disruptionInfo.disruptionId}) from DynamoDB table (${getTableName(
            !!isTemplate,
        )})...`,
    );
    const currentDisruption = await getDisruptionById(disruptionInfo.disruptionId, id, isTemplate);
    const isPending =
        (isUserStaff || !isTemplate) &&
        currentDisruption?.publishStatus &&
        currentDisruption?.publishStatus === PublishStatus.published;
    const isEditing = currentDisruption?.publishStatus && currentDisruption?.publishStatus !== PublishStatus.draft;

    await ddbDocClient.send(
        new PutCommand({
            TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
            Item: {
                PK: id,
                SK: `${disruptionInfo.disruptionId}#INFO${isPending ? "#PENDING" : isEditing ? "#EDIT" : ""}`,
                ...disruptionInfo,
                ...(isTemplate ? { template: isTemplate } : {}),
            },
        }),
    );
};

export const upsertConsequence = async (
    consequence: Consequence | Pick<Consequence, "disruptionId" | "consequenceIndex">,
    id: string,
    isUserStaff?: boolean,
    isTemplate?: boolean,
) => {
    logger.info(
        `Updating consequence index ${consequence.consequenceIndex || ""} in disruption (${
            consequence.disruptionId || ""
        }) from DynamoDB table (${getTableName(!!isTemplate)})...`,
    );
    const currentDisruption = await getDisruptionById(consequence.disruptionId, id, isTemplate);
    const isPending =
        isUserStaff &&
        (currentDisruption?.publishStatus === PublishStatus.published ||
            currentDisruption?.publishStatus === PublishStatus.pendingAndEditing);
    const isEditing = currentDisruption?.publishStatus && currentDisruption?.publishStatus !== PublishStatus.draft;

    await ddbDocClient.send(
        new PutCommand({
            TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
            Item: {
                PK: id,
                SK: `${consequence.disruptionId}#CONSEQUENCE#${consequence.consequenceIndex}${
                    isPending ? "#PENDING" : isEditing ? "#EDIT" : ""
                }`,
                ...consequence,
            },
        }),
    );
};

export const upsertSocialMediaPost = async (
    socialMediaPost:
        | SocialMediaPostTransformed
        | Pick<SocialMediaPostTransformed, "disruptionId" | "socialMediaPostIndex">,
    id: string,
    isUserStaff?: boolean,
    forcePublish?: boolean,
    isTemplate?: boolean,
) => {
    logger.info(
        `Updating socialMediaPost index ${
            socialMediaPost.socialMediaPostIndex
        } in disruption (${id})from DynamoDB table (${getTableName(!!isTemplate)})...`,
    );

    const currentDisruption = await getDisruptionById(socialMediaPost.disruptionId, id, isTemplate);
    const isPending =
        isUserStaff &&
        (currentDisruption?.publishStatus === PublishStatus.published ||
            currentDisruption?.publishStatus === PublishStatus.pendingAndEditing);
    const isEditing = currentDisruption?.publishStatus && currentDisruption?.publishStatus !== PublishStatus.draft;

    await ddbDocClient.send(
        new PutCommand({
            TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
            Item: {
                PK: id,
                SK: `${socialMediaPost.disruptionId}#SOCIALMEDIAPOST#${socialMediaPost.socialMediaPostIndex}${
                    forcePublish ? "" : isPending ? "#PENDING" : isEditing ? "#EDIT" : ""
                }`,
                ...socialMediaPost,
            },
        }),
    );
};

export const removeConsequenceFromDisruption = async (
    index: number,
    disruptionId: string,
    id: string,
    isTemplate?: boolean,
) => {
    logger.info(
        `Updating consequence ${index} in disruption (${disruptionId})from DynamoDB table (${getTableName(
            !!isTemplate,
        )})...`,
    );

    await ddbDocClient.send(
        new DeleteCommand({
            TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
            Key: {
                PK: id,
                SK: `${disruptionId}#CONSEQUENCE#${index}`,
            },
        }),
    );
};

export const upsertOrganisation = async (orgId: string, organisation: Organisation) => {
    logger.info(`Updating organisation (${organisation.name}) in DynamoDB table...`);

    await ddbDocClient.send(
        new PutCommand({
            TableName: organisationsTableName,
            Item: {
                PK: orgId,
                ...organisation,
            },
        }),
    );
};

export const removeOrganisation = async (orgId: string) => {
    logger.info(`Deleting organisation (${orgId}) in DynamoDB table...`);

    await ddbDocClient.send(
        new DeleteCommand({
            TableName: organisationsTableName,
            Key: {
                PK: orgId,
            },
        }),
    );
};

export const removeSocialMediaPostFromDisruption = async (
    index: number,
    disruptionId: string,
    id: string,
    isTemplate?: boolean,
) => {
    logger.info(
        `Removing socialMediaPost ${index} in disruption (${disruptionId}) from DynamoDB table (${getTableName(
            !!isTemplate,
        )})...`,
    );

    const getSK = isTemplate
        ? `${disruptionId}#SOCIALMEDIAPOST#${index}#EDIT`
        : `${disruptionId}#SOCIALMEDIAPOST#${index}`;

    await ddbDocClient.send(
        new DeleteCommand({
            TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
            Key: {
                PK: id,
                SK: `${getSK}`,
            },
        }),
    );
};

export const getDisruptionById = async (
    disruptionId: string,
    id: string,
    isTemplate?: boolean,
): Promise<FullDisruption | null> => {
    logger.info(`Retrieving (${disruptionId}) from DynamoDB table (${getTableName(!!isTemplate)})...`);
    const dynamoDisruption = await ddbDocClient.send(
        new QueryCommand({
            TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
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
    const isPending = disruptionItems.some((item) => (item.SK as string).includes("#PENDING"));

    let info = disruptionItems.find((item) => item.SK === `${disruptionId}#INFO`);

    const consequences = disruptionItems.filter(
        (item) =>
            ((item.SK as string).startsWith(`${disruptionId}#CONSEQUENCE`) &&
                !((item.SK as string).includes("#EDIT") || (item.SK as string).includes("#PENDING"))) ??
            false,
    );
    const socialMediaPosts = disruptionItems.filter(
        (item) =>
            ((item.SK as string).startsWith(`${disruptionId}#SOCIALMEDIAPOST`) &&
                !((item.SK as string).includes("#EDIT") || (item.SK as string).includes("#PENDING"))) ??
            false,
    );

    const history = disruptionItems.filter(
        (item) => (item.SK as string).startsWith(`${disruptionId}#HISTORY`) ?? false,
    );

    const newHistoryItems: string[] = [];

    if (isPending) {
        info = disruptionItems.find((item) => item.SK === `${disruptionId}#INFO#PENDING`) ?? info;
        const pendingConsequences = disruptionItems.filter(
            (item) =>
                ((item.SK as string).startsWith(`${disruptionId}#CONSEQUENCE`) &&
                    (item.SK as string).includes("#PENDING")) ??
                false,
        );
        pendingConsequences.forEach((pendingConsequence) => {
            const existingIndex = consequences.findIndex(
                (c) => c.consequenceIndex === pendingConsequence.consequenceIndex,
            );
            if (existingIndex > -1) {
                consequences[existingIndex] = pendingConsequence;
            } else {
                consequences.push(pendingConsequence);
            }
        });

        const pendingSocialMediaPosts = disruptionItems.filter(
            (item) =>
                ((item.SK as string).startsWith(`${disruptionId}#SOCIALMEDIAPOST`) &&
                    (item.SK as string).includes("#PENDING")) ??
                false,
        );
        pendingSocialMediaPosts.forEach((pendingSocialMediaPost) => {
            const existingIndex = socialMediaPosts.findIndex(
                (s) => s.socialMediaPostIndex === pendingSocialMediaPost.socialMediaPostIndex,
            );
            if (existingIndex > -1) {
                socialMediaPosts[existingIndex] = pendingSocialMediaPost;
            } else {
                socialMediaPosts.push(pendingSocialMediaPost);
            }
        });
    }

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

        const editedSocialMediaPosts = disruptionItems.filter(
            (item) =>
                ((item.SK as string).startsWith(`${disruptionId}#SOCIALMEDIAPOST`) &&
                    (item.SK as string).includes("#EDIT")) ??
                false,
        );
        editedSocialMediaPosts.forEach((editedSocialMediaPost) => {
            const existingIndex = socialMediaPosts.findIndex(
                (s) => s.socialMediaPostIndex === editedSocialMediaPost.socialMediaPostIndex,
            );
            if (existingIndex > -1) {
                socialMediaPosts[existingIndex] = editedSocialMediaPost;
            } else {
                socialMediaPosts.push(editedSocialMediaPost);
            }
        });

        const editedConsequences = disruptionItems.filter(
            (item) =>
                ((item.SK as string).startsWith(`${disruptionId}#CONSEQUENCE`) &&
                    (item.SK as string).includes("#EDIT")) ??
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
    const socialMediaPostsToShow: Record<string, unknown>[] = [];
    const deletedSocialMediaPosts: Record<string, unknown>[] = [];
    const deletedConsequences: Record<string, unknown>[] = [];

    consequences.forEach((consequence) => {
        if (consequence.isDeleted) {
            deletedConsequences.push(consequence);
        } else {
            consequencesToShow.push(consequence);
        }
    });

    socialMediaPosts.forEach((socialMediaPost) => {
        if (socialMediaPost.isDeleted) {
            deletedSocialMediaPosts.push(socialMediaPost);
        } else {
            socialMediaPostsToShow.push(socialMediaPost);
        }
    });

    const parsedDisruption = fullDisruptionSchema.safeParse({
        ...info,
        consequences: consequencesToShow,
        socialMediaPosts: socialMediaPostsToShow,
        deletedConsequences,
        history,
        newHistory: newHistoryItems,
        template: isTemplate ? true : false,
        publishStatus:
            (isPending && (info?.publishStatus === PublishStatus.published || !info?.publishStatus)) ||
            (isPending && isEdited)
                ? PublishStatus.pendingAndEditing
                : isEdited
                ? PublishStatus.editing
                : (info?.publishStatus as string),
    });

    if (!parsedDisruption.success) {
        logger.warn(`Invalid disruption ${disruptionId} in Dynamo`);
        return null;
    }
    return parsedDisruption.data;
};

export const publishEditedConsequencesAndSocialMediaPosts = async (
    disruptionId: string,
    id: string,
    isTemplate?: boolean,
) => {
    logger.info(`Publishing edited disruption (${disruptionId}) from DynamoDB table (${getTableName(!!isTemplate)}...`)
    const dynamoDisruption = await ddbDocClient.send(
        new QueryCommand({
            TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
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
        const editedSocialMediaPosts: Record<string, unknown>[] = [];
        const deleteSocialMediaPosts: Record<string, unknown>[] = [];

        dynamoDisruption.Items?.forEach((item) => {
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

            if (
                (item.SK as string).startsWith(`${disruptionId}#SOCIALMEDIAPOST`) &&
                (item.SK as string).includes("#EDIT")
            ) {
                if (item.isDeleted) {
                    deleteSocialMediaPosts.push(item);
                } else {
                    editedSocialMediaPosts.push(item);
                }
            }
        });

        if (
            editedConsequences.length > 0 ||
            editedDisruption.length > 0 ||
            deleteConsequences.length > 0 ||
            editedSocialMediaPosts.length > 0 ||
            deleteSocialMediaPosts.length > 0
        )
            await ddbDocClient.send(
                new TransactWriteCommand({
                    TransactItems: [
                        ...editedDisruption.map((disruption) => ({
                            Put: {
                                TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
                                Item: {
                                    ...disruption,
                                    PK: id,
                                    SK: `${disruptionId}#INFO`,
                                },
                            },
                        })),
                        ...editedConsequences.map((consequence) => ({
                            Put: {
                                TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
                                Item: {
                                    ...consequence,
                                    PK: id,
                                    SK: `${disruptionId}#CONSEQUENCE#${consequence.consequenceIndex as string}`,
                                },
                            },
                        })),
                        ...deleteConsequences.map((consequence) => ({
                            Delete: {
                                TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
                                Key: {
                                    PK: id,
                                    SK: `${disruptionId}#CONSEQUENCE#${consequence.consequenceIndex as string}`,
                                },
                            },
                        })),
                        ...editedSocialMediaPosts.map((socialMediaPost) => ({
                            Put: {
                                TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
                                Item: {
                                    ...socialMediaPost,
                                    PK: id,
                                    SK: `${disruptionId}#SOCIALMEDIAPOST#${
                                        socialMediaPost.socialMediaPostIndex as string
                                    }`,
                                },
                            },
                        })),
                        ...deleteSocialMediaPosts.map((socialMediaPost) => ({
                            Delete: {
                                TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
                                Key: {
                                    PK: id,
                                    SK: `${disruptionId}#SOCIALMEDIAPOST#${
                                        socialMediaPost.socialMediaPostIndex as string
                                    }`,
                                },
                            },
                        })),
                    ],
                }),
            );
    }
};

export const publishEditedConsequencesAndSocialMediaPostsIntoPending = async (
    disruptionId: string,
    id: string,
    isTemplate?: boolean,
) => {
    logger.info(
        `Publishing edited disruption(${disruptionId}) to pending status from DynamoDB table (${getTableName(
            !!isTemplate,
        )})...`,
    );
    const dynamoDisruption = await ddbDocClient.send(
        new QueryCommand({
            TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
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
        const editedSocialMediaPosts: Record<string, unknown>[] = [];
        const deleteSocialMediaPosts: Record<string, unknown>[] = [];

        dynamoDisruption.Items?.forEach((item) => {
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

            if (
                (item.SK as string).startsWith(`${disruptionId}#SOCIALMEDIAPOST`) &&
                (item.SK as string).includes("#EDIT")
            ) {
                if (item.isDeleted) {
                    deleteSocialMediaPosts.push(item);
                } else {
                    editedSocialMediaPosts.push(item);
                }
            }
        });

        if (
            editedConsequences.length > 0 ||
            editedDisruption.length > 0 ||
            deleteConsequences.length > 0 ||
            editedSocialMediaPosts.length > 0 ||
            deleteSocialMediaPosts.length > 0
        )
            await ddbDocClient.send(
                new TransactWriteCommand({
                    TransactItems: [
                        ...editedDisruption.map((disruption) => ({
                            Put: {
                                TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
                                Item: {
                                    ...disruption,
                                    PK: id,
                                    SK: `${disruptionId}#INFO#PENDING`,
                                },
                            },
                        })),
                        ...editedConsequences.map((consequence) => ({
                            Put: {
                                TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
                                Item: {
                                    ...consequence,
                                    PK: id,
                                    SK: `${disruptionId}#CONSEQUENCE#${consequence.consequenceIndex as string}#PENDING`,
                                },
                            },
                        })),
                        ...deleteConsequences.map((consequence) => ({
                            Put: {
                                TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
                                Item: {
                                    ...consequence,
                                    PK: id,
                                    SK: `${disruptionId}#CONSEQUENCE#${consequence.consequenceIndex as string}#PENDING`,
                                },
                            },
                        })),
                        ...editedSocialMediaPosts.map((socialMediaPost) => ({
                            Put: {
                                TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
                                Item: {
                                    ...socialMediaPost,
                                    PK: id,
                                    SK: `${disruptionId}#SOCIALMEDIAPOST#${
                                        socialMediaPost.socialMediaPostIndex as string
                                    }#PENDING`,
                                },
                            },
                        })),
                        ...deleteSocialMediaPosts.map((socialMediaPost) => ({
                            Put: {
                                TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
                                Item: {
                                    ...socialMediaPost,
                                    PK: id,
                                    SK: `${disruptionId}#SOCIALMEDIAPOST#${
                                        socialMediaPost.socialMediaPostIndex as string
                                    }#PENDING`,
                                },
                            },
                        })),
                    ],
                }),
            );
    }
};

export const publishPendingConsequencesAndSocialMediaPosts = async (
    disruptionId: string,
    id: string,
    isTemplate?: boolean,
) => {
    logger.info(
        `Publishing pending disruption (${disruptionId}) from DynamoDB table (${getTableName(!!isTemplate)})...`,
    );
    const dynamoDisruption = await ddbDocClient.send(
        new QueryCommand({
            TableName: disruptionsTableName,
            KeyConditionExpression: "PK = :1 and begins_with(SK, :2)",
            ExpressionAttributeValues: {
                ":1": id,
                ":2": `${disruptionId}`,
            },
        }),
    );

    if (dynamoDisruption.Items) {
        const pendingConsequences: Record<string, unknown>[] = [];
        const deleteConsequences: Record<string, unknown>[] = [];
        const pendingDisruption: Record<string, unknown>[] = [];
        const pendingSocialMediaPosts: Record<string, unknown>[] = [];
        const deleteSocialMediaPosts: Record<string, unknown>[] = [];

        dynamoDisruption.Items?.forEach((item) => {
            if (
                (item.SK as string).startsWith(`${disruptionId}#CONSEQUENCE`) &&
                (item.SK as string).includes("#PENDING")
            ) {
                if (item.isDeleted) {
                    deleteConsequences.push(item);
                } else {
                    pendingConsequences.push(item);
                }
            }

            if ((item.SK as string) === `${disruptionId}#INFO#PENDING`) {
                pendingDisruption.push(item);
            }

            if (
                (item.SK as string).startsWith(`${disruptionId}#SOCIALMEDIAPOST`) &&
                (item.SK as string).includes("#PENDING")
            ) {
                if (item.isDeleted) {
                    deleteSocialMediaPosts.push(item);
                } else {
                    pendingSocialMediaPosts.push(item);
                }
            }
        });

        if (
            pendingConsequences.length > 0 ||
            pendingDisruption.length > 0 ||
            deleteConsequences.length > 0 ||
            pendingSocialMediaPosts.length > 0 ||
            deleteSocialMediaPosts.length > 0
        )
            await ddbDocClient.send(
                new TransactWriteCommand({
                    TransactItems: [
                        ...pendingDisruption.map((disruption) => ({
                            Put: {
                                TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
                                Item: {
                                    ...disruption,
                                    PK: id,
                                    SK: `${disruptionId}#INFO`,
                                },
                            },
                        })),
                        ...pendingConsequences.map((consequence) => ({
                            Put: {
                                TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
                                Item: {
                                    ...consequence,
                                    PK: id,
                                    SK: `${disruptionId}#CONSEQUENCE#${consequence.consequenceIndex as string}`,
                                },
                            },
                        })),
                        ...deleteConsequences.map((consequence) => ({
                            Delete: {
                                TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
                                Key: {
                                    PK: id,
                                    SK: `${disruptionId}#CONSEQUENCE#${consequence.consequenceIndex as string}`,
                                },
                            },
                        })),
                        ...pendingSocialMediaPosts.map((socialMediaPost) => ({
                            Put: {
                                TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
                                Item: {
                                    ...socialMediaPost,
                                    PK: id,
                                    SK: `${disruptionId}#SOCIALMEDIAPOST#${
                                        socialMediaPost.socialMediaPostIndex as string
                                    }`,
                                },
                            },
                        })),
                        ...deleteSocialMediaPosts.map((socialMediaPost) => ({
                            Delete: {
                                TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
                                Key: {
                                    PK: id,
                                    SK: `${disruptionId}#SOCIALMEDIAPOST#${
                                        socialMediaPost.socialMediaPostIndex as string
                                    }`,
                                },
                            },
                        })),
                    ],
                }),
            );
    }
};

export const deleteDisruptionsInEdit = async (disruptionId: string, id: string, isTemplate?: boolean) => {
    logger.info(`Deleting edited disruptions (${disruptionId}) from DynamoDB table (${getTableName(!!isTemplate)})...`);
    const dynamoDisruption = await ddbDocClient.send(
        new QueryCommand({
            TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
            KeyConditionExpression: "PK = :1 and begins_with(SK, :2)",
            ExpressionAttributeValues: {
                ":1": id,
                ":2": `${disruptionId}`,
            },
        }),
    );

    if (dynamoDisruption.Items) {
        const editedConsequences = dynamoDisruption.Items?.filter(
            (item) =>
                ((item.SK as string).startsWith(`${disruptionId}#CONSEQUENCE`) &&
                    (item.SK as string).includes("#EDIT")) ??
                false,
        );

        const editedSocialMediaPosts = dynamoDisruption.Items?.filter(
            (item) =>
                ((item.SK as string).startsWith(`${disruptionId}#SOCIALMEDIAPOST`) &&
                    (item.SK as string).includes("#EDIT")) ??
                false,
        );

        const consequenceDeleteCommands: {
            Delete: {
                TableName: string;
                Key: Record<string, string>;
            };
        }[] =
            editedConsequences?.map((consequence) => ({
                Delete: {
                    TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
                    Key: {
                        PK: id,
                        SK: `${disruptionId}#CONSEQUENCE#${consequence.consequenceIndex as string}#EDIT`,
                    },
                },
            })) ?? [];

        const socialMediaPostDeleteCommands: {
            Delete: {
                TableName: string;
                Key: Record<string, string>;
            };
        }[] =
            editedSocialMediaPosts?.map((socialMediaPost) => ({
                Delete: {
                    TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
                    Key: {
                        PK: id,
                        SK: `${disruptionId}#SOCIALMEDIAPOST#${socialMediaPost.socialMediaPostIndex as string}#EDIT`,
                    },
                },
            })) ?? [];

        await ddbDocClient.send(
            new TransactWriteCommand({
                TransactItems: [
                    {
                        Delete: {
                            TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
                            Key: {
                                PK: id,
                                SK: `${disruptionId}#INFO#EDIT`,
                            },
                        },
                    },
                    ...consequenceDeleteCommands,
                    ...socialMediaPostDeleteCommands,
                ],
            }),
        );
    }
};

export const deleteDisruptionsInPending = async (disruptionId: string, id: string, isTemplate?: boolean) => {
    logger.info(`Deleting edited disruptions (${disruptionId}) from DynamoDB table (${getTableName(!!isTemplate)})...`);
    const dynamoDisruption = await ddbDocClient.send(
        new QueryCommand({
            TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
            KeyConditionExpression: "PK = :1 and begins_with(SK, :2)",
            ExpressionAttributeValues: {
                ":1": id,
                ":2": `${disruptionId}`,
            },
        }),
    );

    if (dynamoDisruption.Items) {
        const pendingConsequences = dynamoDisruption.Items?.filter(
            (item) =>
                ((item.SK as string).startsWith(`${disruptionId}#CONSEQUENCE`) &&
                    (item.SK as string).includes("#PENDING")) ??
                false,
        );

        const pendingSocialMediaPosts = dynamoDisruption.Items?.filter(
            (item) =>
                ((item.SK as string).startsWith(`${disruptionId}#SOCIALMEDIAPOST`) &&
                    (item.SK as string).includes("#PENDING")) ??
                false,
        );

        const consequenceDeleteCommands: {
            Delete: {
                TableName: string;
                Key: Record<string, string>;
            };
        }[] =
            pendingConsequences?.map((consequence) => ({
                Delete: {
                    TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
                    Key: {
                        PK: id,
                        SK: `${disruptionId}#CONSEQUENCE#${consequence.consequenceIndex as string}#PENDING`,
                    },
                },
            })) ?? [];

        const socialMediaPostDeleteCommands: {
            Delete: {
                TableName: string;
                Key: Record<string, string>;
            };
        }[] =
            pendingSocialMediaPosts?.map((socialMediaPost) => ({
                Delete: {
                    TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
                    Key: {
                        PK: id,
                        SK: `${disruptionId}#SOCIALMEDIAPOST#${socialMediaPost.socialMediaPostIndex as string}#PENDING`,
                    },
                },
            })) ?? [];

        await ddbDocClient.send(
            new TransactWriteCommand({
                TransactItems: [
                    {
                        Delete: {
                            TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
                            Key: {
                                PK: id,
                                SK: `${disruptionId}#INFO#PENDING`,
                            },
                        },
                    },
                    ...consequenceDeleteCommands,
                    ...socialMediaPostDeleteCommands,
                ],
            }),
        );
    }
};

export const isDisruptionInEdit = async (disruptionId: string, id: string, isTemplate?: boolean) => {
    logger.info(
        `Check if there are any edit records for disruption (${disruptionId}) from DynamoDB table (${getTableName(
            !!isTemplate,
        )})...`,
    );
    const dynamoDisruption = await ddbDocClient.send(
        new QueryCommand({
            TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
            KeyConditionExpression: "PK = :1 and begins_with(SK, :2)",
            ExpressionAttributeValues: {
                ":1": id,
                ":2": `${disruptionId}`,
            },
        }),
    );

    const isEdited = dynamoDisruption?.Items?.some((item) => (item.SK as string).includes("#EDIT"));

    return isEdited || false;
};
