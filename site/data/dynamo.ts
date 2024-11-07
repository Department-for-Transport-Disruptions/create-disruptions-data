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
