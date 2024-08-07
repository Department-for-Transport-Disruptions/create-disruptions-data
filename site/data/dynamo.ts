import { randomUUID } from "crypto";
import { inspect } from "util";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DeleteCommand,
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    QueryCommand,
    TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { Consequence, Disruption, DisruptionInfo } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { MAX_CONSEQUENCES, disruptionSchema } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { getDate, isCurrentOrUpcomingDisruption } from "@create-disruptions-data/shared-ts/utils/dates";
import { recursiveQuery } from "@create-disruptions-data/shared-ts/utils/dynamo";
import { makeFilteredArraySchema } from "@create-disruptions-data/shared-ts/utils/zod";
import { TooManyConsequencesError } from "../errors";
import { FullDisruption, fullDisruptionSchema } from "../schemas/disruption.schema";
import {
    Organisation,
    SubOrganisation,
    operatorOrgListSchema,
    operatorOrgSchema,
    organisationSchema,
} from "../schemas/organisation.schema";
import { SocialMediaAccount, dynamoSocialAccountSchema } from "../schemas/social-media-accounts.schema";
import { SocialMediaPost, SocialMediaPostTransformed } from "../schemas/social-media.schema";
import { flattenZodErrors, notEmpty, splitCamelCaseToString } from "../utils";
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
    isTemplate?: boolean,
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

    const history = disruptionItems.filter(
        (item) => (item.SK as string).startsWith(`${disruptionId}#HISTORY`) ?? false,
    );

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
        history: isTemplate ? [] : history,
    });

    if (!parsedDisruption.success) {
        logger.warn(`Invalid disruption ${disruptionId} in Dynamo`);
        logger.warn(inspect(parsedDisruption.error, false, null));

        return null;
    }

    return parsedDisruption.data;
};

export const getPendingDisruptionsIdsFromDynamo = async (id: string): Promise<Set<string>> => {
    logger.info("Getting disruptions in pending status from DynamoDB table...");

    const dbData = await recursiveQuery(
        {
            TableName: disruptionsTableName,
            KeyConditionExpression: "PK = :1",
            FilterExpression: "publishStatus = :2 or publishStatus = :3",
            ExpressionAttributeValues: {
                ":1": id,
                ":2": PublishStatus.pendingApproval,
                ":3": PublishStatus.editPendingApproval,
            },
        },
        logger,
    );

    const disruptionIds = new Set<string>();

    dbData.forEach((item) => {
        if (item.disruptionId && !disruptionIds.has(item.disruptionId as string)) {
            disruptionIds.add(item.disruptionId as string);
        }
    });

    return disruptionIds;
};

export const getPublishedDisruptionsDataFromDynamo = async (id: string): Promise<FullDisruption[]> => {
    logger.info("Getting disruptions data from DynamoDB table...");

    const dbData = await recursiveQuery(
        {
            TableName: disruptionsTableName,
            KeyConditionExpression: "PK = :1",
            FilterExpression: "publishStatus = :2",
            ExpressionAttributeValues: {
                ":1": id,
                ":2": PublishStatus.published,
            },
        },
        logger,
    );

    const disruptionIds = dbData
        .map((item) => (item as Disruption).disruptionId)
        .filter((value, index, array) => array.indexOf(value) === index);

    return disruptionIds?.map((id) => collectDisruptionsData(dbData || [], id)).filter(notEmpty) ?? [];
};

export const getDisruptionsDataFromDynamo = async (
    id: string,
    isTemplate?: boolean,
    nextKey?: Record<string, unknown>,
): Promise<{ disruptions: FullDisruption[]; nextKey?: string }> => {
    logger.info(`Getting disruptions data from DynamoDB table for org ${id}...`);

    const dbData = await ddbDocClient.send(
        new QueryCommand({
            TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
            KeyConditionExpression: "PK = :1",
            ExpressionAttributeValues: {
                ":1": id,
            },
            Limit: 200,
            ExclusiveStartKey: nextKey,
        }),
    );

    const disruptionIds = dbData.Items?.map((item) => (item as Disruption).disruptionId).filter(
        (value, index, array) => array.indexOf(value) === index,
    );

    return {
        disruptions: disruptionIds?.map((id) => collectDisruptionsData(dbData.Items || [], id)).filter(notEmpty) ?? [],
        nextKey: dbData.LastEvaluatedKey ? JSON.stringify(dbData.LastEvaluatedKey) : undefined,
    };
};

export const getPublishedSocialMediaPosts = async (orgId: string): Promise<SocialMediaPost[]> => {
    logger.info("Getting published social media data from DynamoDB table...");

    const disruptions = await getPublishedDisruptionsDataFromDynamo(orgId);

    const currentAndUpcomingDisruptions = disruptions.filter((disruption) =>
        isCurrentOrUpcomingDisruption(disruption.publishEndDate, disruption.publishEndTime),
    );

    return currentAndUpcomingDisruptions.flatMap((item) => item.socialMediaPosts).filter(notEmpty);
};

export const getOrganisationInfoById = async (orgId: string): Promise<Organisation | null> => {
    logger.info(`Getting organisation (${orgId}) from DynamoDB table...`);

    const dbData = await ddbDocClient.send(
        new GetCommand({
            TableName: organisationsTableName,
            Key: {
                PK: orgId,
                SK: "INFO",
            },
        }),
    );

    const parsedOrg = organisationSchema.safeParse(dbData.Item);

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
    disruptionCreated?: boolean,
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

    const currentDate = getDate().toISOString();
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
                        UpdateExpression: "SET publishStatus = :1, lastUpdated = :2, creationTime = :3",
                        ExpressionAttributeValues: {
                            ":1": status,
                            ":2": currentDate,
                            ":3": disruptionCreated ? currentDate : disruption.creationTime ?? null,
                        },
                    },
                },
                ...consequenceUpdateCommands,
                ...socialMediaPostUpdateCommands,
                ...(isTemplate ? [] : historyPutCommand),
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
    operatorOrgId?: string | null,
) => {
    logger.info(
        `Updating draft disruption (${disruptionInfo.disruptionId}) from DynamoDB table (${getTableName(
            !!isTemplate,
        )})...`,
    );

    const currentDisruption = await getDisruptionById(disruptionInfo.disruptionId, id, isTemplate);
    const isPending =
        isUserStaff &&
        !isTemplate &&
        (currentDisruption?.publishStatus === PublishStatus.published ||
            currentDisruption?.publishStatus === PublishStatus.pendingAndEditing);
    const isEditing = currentDisruption?.publishStatus && currentDisruption?.publishStatus !== PublishStatus.draft;

    await ddbDocClient.send(
        new PutCommand({
            TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
            Item: {
                PK: id,
                SK: `${disruptionInfo.disruptionId}#INFO${isPending ? "#PENDING" : isEditing ? "#EDIT" : ""}`,
                ...currentDisruption,
                ...disruptionInfo,
                ...(isTemplate ? { template: isTemplate } : {}),
                ...(operatorOrgId ? { createdByOperatorOrgId: operatorOrgId } : {}),
            },
        }),
    );
};

export const upsertConsequence = async (
    consequence: Consequence | Pick<Consequence, "disruptionId" | "consequenceIndex">,
    id: string,
    isUserStaff?: boolean,
    isTemplate?: boolean,
): Promise<FullDisruption | null> => {
    logger.info(
        `Updating consequence index ${consequence.consequenceIndex || ""} in disruption (${
            consequence.disruptionId || ""
        }) from DynamoDB table (${getTableName(!!isTemplate)})...`,
    );
    const currentDisruption = await getDisruptionById(consequence.disruptionId, id, isTemplate);

    if (
        !currentDisruption?.consequences?.find((c) => c.consequenceIndex === consequence.consequenceIndex) &&
        currentDisruption?.consequences &&
        currentDisruption.consequences.length >= MAX_CONSEQUENCES
    ) {
        throw new TooManyConsequencesError();
    }

    const isPending =
        isUserStaff &&
        !isTemplate &&
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
    return currentDisruption;
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
        } in disruption (${id}) from DynamoDB table (${getTableName(!!isTemplate)})...`,
    );

    const currentDisruption = await getDisruptionById(socialMediaPost.disruptionId, id, isTemplate);
    const existingSocialMediaPost = currentDisruption?.socialMediaPosts
        ? currentDisruption?.socialMediaPosts[socialMediaPost.socialMediaPostIndex]
        : null;
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
                ...(existingSocialMediaPost ?? {}),
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
                SK: "INFO",
                ...organisation,
            },
        }),
    );
};

export const removeOrganisation = async (orgId: string) => {
    logger.info(`Deleting organisation (${orgId}) in DynamoDB table...`);

    const keys = await recursiveQuery(
        {
            TableName: organisationsTableName,
            KeyConditionExpression: "PK = :orgId",
            ExpressionAttributeValues: {
                ":orgId": orgId,
            },
        },
        logger,
    );

    if (!keys) {
        return;
    }

    await ddbDocClient.send(
        new TransactWriteCommand({
            TransactItems: keys.map((key) => ({
                Delete: {
                    TableName: organisationsTableName,
                    Key: {
                        PK: key.PK as string,
                        SK: key.SK as string,
                    },
                },
            })),
        }),
    );
};

export const createOperatorSubOrganisation = async (orgId: string, operatorName: string, nocCodes: string[]) => {
    logger.info(`Adding operator: ${operatorName} to (${orgId}) in organisations DynamoDB table...`);

    const uuid = randomUUID();

    await ddbDocClient.send(
        new PutCommand({
            TableName: organisationsTableName,
            Item: {
                PK: orgId,
                SK: `OPERATOR#${uuid}`,
                name: operatorName,
                nocCodes: nocCodes,
            },
        }),
    );
};

export const getOperatorByOrgIdAndOperatorOrgId = async (orgId: string, operatorOrgId: string) => {
    logger.info(
        `Getting operator: by orgId (${orgId}) and operatorOrgId orgId (${operatorOrgId}) from organisations DynamoDB table...`,
    );
    const operator = await ddbDocClient.send(
        new GetCommand({
            TableName: organisationsTableName,
            Key: {
                PK: orgId,
                SK: `OPERATOR#${operatorOrgId}`,
            },
        }),
    );

    const parsedOperator = operatorOrgSchema.safeParse(operator.Item);

    if (!parsedOperator.success) {
        return null;
    }

    return parsedOperator.data;
};

export const getNocCodesForOperatorOrg = async (orgId: string, operatorOrgId: string) => {
    logger.info(`Getting NOC codes associated with operatorOrgId (${operatorOrgId})`);
    const operatorDetails = await getOperatorByOrgIdAndOperatorOrgId(orgId, operatorOrgId);
    return operatorDetails ? operatorDetails.nocCodes : [];
};

export const listOperatorsForOrg = async (orgId: string) => {
    logger.info(`Retrieving operators for org: (${orgId}) in DynamoDB table...`);

    let dbData: Record<string, unknown>[] = [];

    dbData = await recursiveQuery(
        {
            TableName: organisationsTableName,
            KeyConditionExpression: "PK = :1 AND begins_with(SK, :2)",
            ExpressionAttributeValues: {
                ":1": orgId,
                ":2": "OPERATOR",
            },
        },
        logger,
    );

    const operators = dbData.map((item) => ({
        PK: (item as SubOrganisation).PK,
        name: (item as SubOrganisation).name,
        nocCodes: (item as SubOrganisation).nocCodes,
        SK: (item as SubOrganisation).SK?.slice(9),
    }));

    const parsedOperators = operatorOrgListSchema.safeParse(operators);

    if (!parsedOperators.success) {
        logger.warn(`Invalid operators found for organisation: ${operators[0].PK} in DynamoDB`);
        logger.warn(parsedOperators.error.toString());

        return null;
    }

    return parsedOperators.data;
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
    const disruptionItems = await recursiveQuery(
        {
            TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
            KeyConditionExpression: "PK = :1 and begins_with(SK, :2)",
            ExpressionAttributeValues: {
                ":1": id,
                ":2": `${disruptionId}`,
            },
        },
        logger,
    );

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
        history: isTemplate ? [] : history,
        newHistory: isTemplate ? [] : newHistoryItems,
        template: !!isTemplate,
        publishStatus:
            (isPending && (info?.publishStatus === PublishStatus.published || !info?.publishStatus)) ||
            (isPending && isEdited)
                ? PublishStatus.pendingAndEditing
                : isEdited
                  ? PublishStatus.editing
                  : (info?.publishStatus as string),
    });

    if (!parsedDisruption.success) {
        logger.warn(inspect(flattenZodErrors(parsedDisruption.error)));
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
    logger.info(`Publishing edited disruption ${disruptionId} from DynamoDB table ${getTableName(!!isTemplate)}...`);
    const dynamoDisruption = await recursiveQuery(
        {
            TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
            KeyConditionExpression: "PK = :1 and begins_with(SK, :2)",
            ExpressionAttributeValues: {
                ":1": id,
                ":2": `${disruptionId}`,
            },
        },
        logger,
    );

    if (dynamoDisruption.length > 0) {
        const editedConsequences: Record<string, unknown>[] = [];
        const deleteConsequences: Record<string, unknown>[] = [];
        const editedDisruption: Record<string, unknown>[] = [];
        const editedSocialMediaPosts: Record<string, unknown>[] = [];
        const deleteSocialMediaPosts: Record<string, unknown>[] = [];

        dynamoDisruption?.forEach((item) => {
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
        `Publishing edited disruption ${disruptionId} to pending status from DynamoDB table ${getTableName(
            !!isTemplate,
        )}...`,
    );
    const dynamoDisruption = await recursiveQuery(
        {
            TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
            KeyConditionExpression: "PK = :1 and begins_with(SK, :2)",
            ExpressionAttributeValues: {
                ":1": id,
                ":2": `${disruptionId}`,
            },
        },
        logger,
    );

    if (dynamoDisruption.length > 0) {
        const editedConsequences: Record<string, unknown>[] = [];
        const deleteConsequences: Record<string, unknown>[] = [];
        const editedDisruption: Record<string, unknown>[] = [];
        const editedSocialMediaPosts: Record<string, unknown>[] = [];
        const deleteSocialMediaPosts: Record<string, unknown>[] = [];

        dynamoDisruption?.forEach((item) => {
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
    const dynamoDisruption = await recursiveQuery(
        {
            TableName: disruptionsTableName,
            KeyConditionExpression: "PK = :1 and begins_with(SK, :2)",
            ExpressionAttributeValues: {
                ":1": id,
                ":2": `${disruptionId}`,
            },
        },
        logger,
    );

    if (dynamoDisruption.length > 0) {
        const pendingConsequences: Record<string, unknown>[] = [];
        const deleteConsequences: Record<string, unknown>[] = [];
        const pendingDisruption: Record<string, unknown>[] = [];
        const pendingSocialMediaPosts: Record<string, unknown>[] = [];
        const deleteSocialMediaPosts: Record<string, unknown>[] = [];

        dynamoDisruption?.forEach((item) => {
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
    const dynamoDisruption = await recursiveQuery(
        {
            TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
            KeyConditionExpression: "PK = :1 and begins_with(SK, :2)",
            ExpressionAttributeValues: {
                ":1": id,
                ":2": `${disruptionId}`,
            },
        },
        logger,
    );

    if (dynamoDisruption.length > 0) {
        const editedConsequences = dynamoDisruption.filter(
            (item) =>
                ((item.SK as string).startsWith(`${disruptionId}#CONSEQUENCE`) &&
                    (item.SK as string).includes("#EDIT")) ??
                false,
        );

        const editedSocialMediaPosts = dynamoDisruption.filter(
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
    logger.info(
        `Deleting pending disruptions (${disruptionId}) from DynamoDB table (${getTableName(!!isTemplate)})...`,
    );
    const dynamoDisruption = await recursiveQuery(
        {
            TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
            KeyConditionExpression: "PK = :1 and begins_with(SK, :2)",
            ExpressionAttributeValues: {
                ":1": id,
                ":2": `${disruptionId}`,
            },
        },
        logger,
    );

    if (dynamoDisruption.length > 0) {
        const pendingConsequences = dynamoDisruption.filter(
            (item) =>
                ((item.SK as string).startsWith(`${disruptionId}#CONSEQUENCE`) &&
                    (item.SK as string).includes("#PENDING")) ??
                false,
        );

        const pendingSocialMediaPosts = dynamoDisruption.filter(
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
    const dynamoDisruption = await recursiveQuery(
        {
            TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
            KeyConditionExpression: "PK = :1 and begins_with(SK, :2)",
            ExpressionAttributeValues: {
                ":1": id,
                ":2": `${disruptionId}`,
            },
        },
        logger,
    );

    const isEdited = dynamoDisruption.some((item) => (item.SK as string).includes("#EDIT"));

    return isEdited || false;
};

export const addSocialAccountToOrg = async (
    orgId: string,
    socialId: string,
    display: string,
    addedBy: string,
    accountType: SocialMediaAccount["accountType"],
    createdByOperatorOrgId?: string | null,
) => {
    await ddbDocClient.send(
        new PutCommand({
            TableName: organisationsTableName,
            Item: {
                PK: orgId,
                SK: `SOCIAL#${socialId}`,
                id: socialId,
                display,
                addedBy,
                accountType,
                ...(createdByOperatorOrgId ? { createdByOperatorOrgId: createdByOperatorOrgId } : {}),
            },
        }),
    );
};

export const removeSocialAccountFromOrg = async (orgId: string, socialId: string) => {
    await ddbDocClient.send(
        new DeleteCommand({
            TableName: organisationsTableName,
            Key: {
                PK: orgId,
                SK: `SOCIAL#${socialId}`,
            },
        }),
    );
};

export const getOrgSocialAccounts = async (orgId: string) => {
    const socialAccounts = await recursiveQuery(
        {
            TableName: organisationsTableName,
            KeyConditionExpression: "PK = :orgId and begins_with(SK, :social)",
            ExpressionAttributeValues: {
                ":orgId": orgId,
                ":social": "SOCIAL",
            },
        },
        logger,
    );

    const parsedSocialAccounts = makeFilteredArraySchema(dynamoSocialAccountSchema).safeParse(socialAccounts);

    if (!parsedSocialAccounts.success) {
        return [];
    }

    return parsedSocialAccounts.data;
};

export const getOrgSocialAccount = async (orgId: string, socialId: string) => {
    const socialAccount = await ddbDocClient.send(
        new GetCommand({
            TableName: organisationsTableName,
            Key: {
                PK: orgId,
                SK: `SOCIAL#${socialId}`,
            },
        }),
    );

    const parsedSocialAccount = dynamoSocialAccountSchema.safeParse(socialAccount.Item);

    if (!parsedSocialAccount.success) {
        return null;
    }

    return parsedSocialAccount.data;
};

export const getDisruptionInfoByPermitReferenceNumber = async (
    permitReferenceNumber: string,
    orgId: string,
): Promise<Disruption | null> => {
    logger.info(
        `Retrieving disruption info associated with road permit reference (${permitReferenceNumber}) from DynamoDB table (${disruptionsTableName})...`,
    );
    const disruptionInfo = await ddbDocClient.send(
        new QueryCommand({
            TableName: disruptionsTableName,
            KeyConditionExpression: "PK = :1",
            FilterExpression: "permitReferenceNumber = :3",
            ExpressionAttributeValues: {
                ":1": orgId,
                ":3": permitReferenceNumber,
            },
        }),
    );

    if (!disruptionInfo.Items || disruptionInfo.Items.length === 0) {
        logger.info(`No disruption found for roadwork permit reference (${permitReferenceNumber}) in Dynamo`);
        return null;
    }

    const parsedDisruptionInfo = disruptionSchema.safeParse(disruptionInfo.Items[0]);

    if (!parsedDisruptionInfo.success) {
        logger.warn(`Invalid disruption found for roadwork permit reference (${permitReferenceNumber}) in Dynamo`);
        logger.warn(inspect(parsedDisruptionInfo.error, false, null));

        return null;
    }

    return parsedDisruptionInfo.data;
};
