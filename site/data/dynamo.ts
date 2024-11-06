import { randomUUID } from "crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DeleteCommand,
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { recursiveQuery } from "@create-disruptions-data/shared-ts/utils/dynamo";
import { makeFilteredArraySchema } from "@create-disruptions-data/shared-ts/utils/zod";
import {
    Organisation,
    SubOrganisation,
    operatorOrgListSchema,
    operatorOrgSchema,
    organisationSchema,
} from "../schemas/organisation.schema";
import { SocialMediaAccount, dynamoSocialAccountSchema } from "../schemas/social-media-accounts.schema";
import logger from "../utils/logger";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "eu-west-2" }));

const organisationsTableName = process.env.ORGANISATIONS_TABLE_NAME as string;

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

//TODO: remove eventually
// export const getDisruptionById = async (
//     disruptionId: string,
//     id: string,
//     isTemplate?: boolean,
// ): Promise<FullDisruption | null> => {
//     logger.info(`Retrieving (${disruptionId}) from DynamoDB table (${getTableName(!!isTemplate)})...`);
//     const disruptionItems = await recursiveQuery(
//         {
//             TableName: isTemplate ? templateDisruptionsTableName : disruptionsTableName,
//             KeyConditionExpression: "PK = :1 and begins_with(SK, :2)",
//             ExpressionAttributeValues: {
//                 ":1": id,
//                 ":2": `${disruptionId}`,
//             },
//         },
//         logger,
//     );

//     if (!disruptionItems) {
//         return null;
//     }
//     const isEdited = disruptionItems.some((item) => (item.SK as string).includes("#EDIT"));
//     const isPending = disruptionItems.some((item) => (item.SK as string).includes("#PENDING"));

//     let info = disruptionItems.find((item) => item.SK === `${disruptionId}#INFO`);

//     const consequences = disruptionItems.filter(
//         (item) =>
//             ((item.SK as string).startsWith(`${disruptionId}#CONSEQUENCE`) &&
//                 !((item.SK as string).includes("#EDIT") || (item.SK as string).includes("#PENDING"))) ??
//             false,
//     );
//     const socialMediaPosts = disruptionItems.filter(
//         (item) =>
//             ((item.SK as string).startsWith(`${disruptionId}#SOCIALMEDIAPOST`) &&
//                 !((item.SK as string).includes("#EDIT") || (item.SK as string).includes("#PENDING"))) ??
//             false,
//     );

//     const history = disruptionItems.filter(
//         (item) => (item.SK as string).startsWith(`${disruptionId}#HISTORY`) ?? false,
//     );

//     const newHistoryItems: string[] = [];

//     if (isPending) {
//         info = disruptionItems.find((item) => item.SK === `${disruptionId}#INFO#PENDING`) ?? info;
//         const pendingConsequences = disruptionItems.filter(
//             (item) =>
//                 ((item.SK as string).startsWith(`${disruptionId}#CONSEQUENCE`) &&
//                     (item.SK as string).includes("#PENDING")) ??
//                 false,
//         );
//         pendingConsequences.forEach((pendingConsequence) => {
//             const existingIndex = consequences.findIndex(
//                 (c) => c.consequenceIndex === pendingConsequence.consequenceIndex,
//             );
//             if (existingIndex > -1) {
//                 consequences[existingIndex] = pendingConsequence;
//             } else {
//                 consequences.push(pendingConsequence);
//             }
//         });

//         const pendingSocialMediaPosts = disruptionItems.filter(
//             (item) =>
//                 ((item.SK as string).startsWith(`${disruptionId}#SOCIALMEDIAPOST`) &&
//                     (item.SK as string).includes("#PENDING")) ??
//                 false,
//         );
//         pendingSocialMediaPosts.forEach((pendingSocialMediaPost) => {
//             const existingIndex = socialMediaPosts.findIndex(
//                 (s) => s.socialMediaPostIndex === pendingSocialMediaPost.socialMediaPostIndex,
//             );
//             if (existingIndex > -1) {
//                 socialMediaPosts[existingIndex] = pendingSocialMediaPost;
//             } else {
//                 socialMediaPosts.push(pendingSocialMediaPost);
//             }
//         });
//     }

//     if (isEdited) {
//         const editedInfo = disruptionItems.find((item) => item.SK === `${disruptionId}#INFO#EDIT`);

//         if (editedInfo) {
//             newHistoryItems.push("Disruption Overview: Edited");
//         }

//         info = editedInfo
//             ? {
//                   ...editedInfo,
//                   isEdited: true,
//               }
//             : info;

//         const editedSocialMediaPosts = disruptionItems.filter(
//             (item) =>
//                 ((item.SK as string).startsWith(`${disruptionId}#SOCIALMEDIAPOST`) &&
//                     (item.SK as string).includes("#EDIT")) ??
//                 false,
//         );
//         editedSocialMediaPosts.forEach((editedSocialMediaPost) => {
//             const existingIndex = socialMediaPosts.findIndex(
//                 (s) => s.socialMediaPostIndex === editedSocialMediaPost.socialMediaPostIndex,
//             );
//             if (existingIndex > -1) {
//                 socialMediaPosts[existingIndex] = editedSocialMediaPost;
//             } else {
//                 socialMediaPosts.push(editedSocialMediaPost);
//             }
//         });

//         const editedConsequences = disruptionItems.filter(
//             (item) =>
//                 ((item.SK as string).startsWith(`${disruptionId}#CONSEQUENCE`) &&
//                     (item.SK as string).includes("#EDIT")) ??
//                 false,
//         );
//         editedConsequences.forEach((editedConsequence) => {
//             const existingIndex = consequences.findIndex(
//                 (c) => c.consequenceIndex === editedConsequence.consequenceIndex,
//             );
//             if (existingIndex > -1) {
//                 if (editedConsequence.isDeleted) {
//                     newHistoryItems.push(
//                         `Disruption Consequence - ${splitCamelCaseToString(
//                             consequences[existingIndex].consequenceType as string,
//                         )}: Deleted`,
//                     );
//                 } else {
//                     newHistoryItems.push(
//                         `Disruption Consequence - ${splitCamelCaseToString(
//                             editedConsequence.consequenceType as string,
//                         )}: Edited`,
//                     );
//                 }

//                 consequences[existingIndex] = editedConsequence;
//             } else {
//                 if (editedConsequence.consequenceType) {
//                     newHistoryItems.push(
//                         `Disruption Consequence - ${splitCamelCaseToString(
//                             editedConsequence.consequenceType as string,
//                         )}: Added`,
//                     );

//                     consequences.push(editedConsequence);
//                 }
//             }
//         });
//     }

//     const consequencesToShow: Record<string, unknown>[] = [];
//     const socialMediaPostsToShow: Record<string, unknown>[] = [];
//     const deletedSocialMediaPosts: Record<string, unknown>[] = [];
//     const deletedConsequences: Record<string, unknown>[] = [];

//     consequences.forEach((consequence) => {
//         if (consequence.isDeleted) {
//             deletedConsequences.push(consequence);
//         } else {
//             consequencesToShow.push(consequence);
//         }
//     });

//     socialMediaPosts.forEach((socialMediaPost) => {
//         if (socialMediaPost.isDeleted) {
//             deletedSocialMediaPosts.push(socialMediaPost);
//         } else {
//             socialMediaPostsToShow.push(socialMediaPost);
//         }
//     });

//     const parsedDisruption = fullDisruptionSchema.safeParse({
//         ...info,
//         consequences: consequencesToShow,
//         socialMediaPosts: socialMediaPostsToShow,
//         deletedConsequences,
//         history: isTemplate ? [] : history,
//         newHistory: isTemplate ? [] : newHistoryItems,
//         template: !!isTemplate,
//         publishStatus:
//             (isPending && (info?.publishStatus === PublishStatus.published || !info?.publishStatus)) ||
//             (isPending && isEdited)
//                 ? PublishStatus.pendingAndEditing
//                 : isEdited
//                   ? PublishStatus.editing
//                   : (info?.publishStatus as string),
//     });

//     if (!parsedDisruption.success) {
//         logger.warn(inspect(flattenZodErrors(parsedDisruption.error)));
//         logger.warn(`Invalid disruption ${disruptionId} in Dynamo`);
//         return null;
//     }
//     return parsedDisruption.data;
// };
