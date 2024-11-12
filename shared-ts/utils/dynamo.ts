import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    QueryCommand,
    QueryCommandInput,
    ScanCommand,
    ScanCommandInput,
} from "@aws-sdk/lib-dynamodb";
import {
    Organisation,
    OrganisationWithStats,
    organisationSchema,
    organisationSchemaWithStats,
} from "../organisationTypes";
import { Logger } from "./index";
import { makeZodArray } from "./zod";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "eu-west-2" }));

export const recursiveScan = async (
    scanCommandInput: ScanCommandInput,
    logger: Logger,
): Promise<Record<string, unknown>[]> => {
    logger.info(`Scanning table ${scanCommandInput.TableName || ""}`);

    const dbData = await ddbDocClient.send(new ScanCommand(scanCommandInput));

    if (!dbData.Items) {
        return [];
    }

    if (dbData.LastEvaluatedKey) {
        return [
            ...dbData.Items,
            ...(await recursiveScan(
                {
                    ...scanCommandInput,
                    ExclusiveStartKey: dbData.LastEvaluatedKey,
                },
                logger,
            )),
        ];
    }

    return dbData.Items;
};

export const recursiveQuery = async (
    queryCommandInput: QueryCommandInput,
    logger: Logger,
): Promise<Record<string, unknown>[]> => {
    logger.info(`Querying table ${queryCommandInput.TableName || ""}`);

    const dbData = await ddbDocClient.send(new QueryCommand(queryCommandInput));

    if (!dbData.Items) {
        return [];
    }

    if (dbData.LastEvaluatedKey) {
        return [
            ...dbData.Items,
            ...(await recursiveQuery(
                {
                    ...queryCommandInput,
                    ExclusiveStartKey: dbData.LastEvaluatedKey,
                },
                logger,
            )),
        ];
    }

    return dbData.Items;
};

export const getOrganisationsInfo = async (
    organisationsTableName: string,
    logger: Logger,
): Promise<Organisation[] | null> => {
    logger.info("Getting all organisations from DynamoDB table...");
    try {
        const dbData = await recursiveScan(
            {
                TableName: organisationsTableName,
                FilterExpression: "SK = :info",
                ExpressionAttributeValues: {
                    ":info": "INFO",
                },
            },
            logger,
        );

        const parsedOrg = makeZodArray(organisationSchema).safeParse(dbData);

        if (!parsedOrg.success) {
            return null;
        }

        return parsedOrg.data;
    } catch (e) {
        if (e instanceof Error) {
            logger.error(e);

            throw e;
        }

        throw e;
    }
};

export const getAllOrganisationsInfoAndStats = async (
    organisationsTableName: string,
    logger: Logger,
): Promise<OrganisationWithStats[] | null> => {
    logger.info("Getting all organisations with stats from DynamoDB table...");
    try {
        const dbDataInfo = await recursiveScan(
            {
                TableName: organisationsTableName,
                FilterExpression: "begins_with(SK, :info) OR begins_with(SK, :stat)",
                ExpressionAttributeValues: {
                    ":info": "INFO",
                    ":stat": "STAT",
                },
            },
            logger,
        );

        const orgIds = [...new Set(dbDataInfo.map((item) => item.PK))];

        const collectedOrgsWithStats = orgIds.map((id) => {
            const info = dbDataInfo.find((item) => item.SK === "INFO" && item.PK === id);
            const stats = dbDataInfo.find((item) => item.SK === "STAT" && item.PK === id);

            return {
                ...info,
                stats,
            };
        });

        const parsedOrgsWithStats = makeZodArray(organisationSchemaWithStats).safeParse(collectedOrgsWithStats);

        if (!parsedOrgsWithStats.success) {
            return null;
        }

        return parsedOrgsWithStats.data;
    } catch (e) {
        if (e instanceof Error) {
            logger.error(e);

            throw e;
        }

        throw e;
    }
};

export const getOrganisationInfoAndStats = async (
    orgId: string,
    organisationsTableName: string,
    logger: Logger,
): Promise<OrganisationWithStats | null> => {
    logger.info(`Getting organisation ${orgId} with stats from DynamoDB table...`);
    try {
        const dbDataInfo = await recursiveQuery(
            {
                TableName: organisationsTableName,
                KeyConditionExpression: "PK=:orgId",
                ExpressionAttributeValues: {
                    ":orgId": orgId,
                },
            },
            logger,
        );

        const info = dbDataInfo.find((item) => item.SK === "INFO");
        const stats = dbDataInfo.find((item) => item.SK === "STAT");

        const parsedOrgWithStats = organisationSchemaWithStats.safeParse({
            ...info,
            stats,
        });

        if (!parsedOrgWithStats.success) {
            return null;
        }

        return parsedOrgWithStats.data;
    } catch (e) {
        if (e instanceof Error) {
            logger.error(e);

            throw e;
        }

        throw e;
    }
};

export const getOrgIdsFromDynamoByAdminAreaCodes = async (
    tableName: string,
    administrativeAreaCodes: string[],
    logger: Logger,
): Promise<{ [key: string]: string[] } | null> => {
    const dbData = await recursiveScan(
        {
            TableName: tableName,
            FilterExpression: "SK = :info",
            ExpressionAttributeValues: {
                ":info": "INFO",
            },
        },
        logger,
    );

    const parsedOrgs = makeZodArray(organisationSchema).safeParse(dbData);

    if (!parsedOrgs.success) {
        return null;
    }

    const filteredOrgIdsWithAdminAreaCodes: { [key: string]: string[] } = {};
    parsedOrgs.data.forEach((org: Organisation) => {
        org.adminAreaCodes.forEach((adminAreaCode: string) => {
            if (administrativeAreaCodes.includes(adminAreaCode)) {
                if (filteredOrgIdsWithAdminAreaCodes[org.id]) {
                    filteredOrgIdsWithAdminAreaCodes[org.id].push(adminAreaCode);
                } else {
                    filteredOrgIdsWithAdminAreaCodes[org.id] = [adminAreaCode];
                }
            }
        });
    });

    if (Object.keys(filteredOrgIdsWithAdminAreaCodes).length === 0) {
        return null;
    }

    return filteredOrgIdsWithAdminAreaCodes;
};
