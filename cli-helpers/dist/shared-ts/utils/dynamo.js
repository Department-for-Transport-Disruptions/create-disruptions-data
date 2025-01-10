import { inspect } from "util";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, ScanCommand, } from "@aws-sdk/lib-dynamodb";
import { disruptionSchema } from "../disruptionTypes.zod";
import { PublishStatus } from "../enums";
import { organisationSchema, organisationSchemaWithStats, } from "../organisationTypes";
import { isCurrentOrUpcomingDisruption } from "./dates";
import { notEmpty } from "./index";
import { makeZodArray } from "./zod";
const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "eu-west-2" }));
const collectDisruptionsData = (disruptionItems, disruptionId, logger) => {
    const info = disruptionItems.find((item) => item.SK === `${disruptionId}#INFO`);
    if (!info) {
        return null;
    }
    let consequences = disruptionItems.filter((item) => (item.SK.startsWith(`${disruptionId}#CONSEQUENCE`) &&
        !(item.SK.includes("#EDIT") || item.SK.includes("#PENDING"))) ??
        false);
    consequences = consequences.filter((consequence) => !consequence.isDeleted);
    const history = disruptionItems.filter((item) => item.SK.startsWith(`${disruptionId}#HISTORY`));
    const parsedDisruption = disruptionSchema.safeParse({
        ...info,
        id: info.disruptionId,
        consequences,
        history,
        orgId: info.orgId ?? info.PK,
    });
    if (!parsedDisruption.success) {
        logger.warn(`Invalid disruption ${disruptionId} in Dynamo`);
        logger.warn(parsedDisruption.error.toString());
        return null;
    }
    return parsedDisruption.data;
};
export const recursiveScan = async (scanCommandInput, logger) => {
    logger.info(`Scanning table ${scanCommandInput.TableName || ""}`);
    const dbData = await ddbDocClient.send(new ScanCommand(scanCommandInput));
    if (!dbData.Items) {
        return [];
    }
    if (dbData.LastEvaluatedKey) {
        return [
            ...dbData.Items,
            ...(await recursiveScan({
                ...scanCommandInput,
                ExclusiveStartKey: dbData.LastEvaluatedKey,
            }, logger)),
        ];
    }
    return dbData.Items;
};
export const recursiveQuery = async (queryCommandInput, logger) => {
    logger.info(`Querying table ${queryCommandInput.TableName || ""}`);
    const dbData = await ddbDocClient.send(new QueryCommand(queryCommandInput));
    if (!dbData.Items) {
        return [];
    }
    if (dbData.LastEvaluatedKey) {
        return [
            ...dbData.Items,
            ...(await recursiveQuery({
                ...queryCommandInput,
                ExclusiveStartKey: dbData.LastEvaluatedKey,
            }, logger)),
        ];
    }
    return dbData.Items;
};
export const getPublishedDisruptionsDataFromDynamo = async (tableName, logger, orgId) => {
    logger.info("Getting disruptions data from DynamoDB table...");
    let disruptions = [];
    if (orgId) {
        disruptions = await recursiveQuery({
            TableName: tableName,
            KeyConditionExpression: "PK = :1",
            FilterExpression: "publishStatus = :2",
            ExpressionAttributeValues: {
                ":1": orgId,
                ":2": PublishStatus.published,
            },
        }, logger);
    }
    else {
        disruptions = await recursiveScan({
            TableName: tableName,
            FilterExpression: "publishStatus = :1 or #a = :2",
            ExpressionAttributeValues: {
                ":1": PublishStatus.published,
                ":2": PublishStatus.published,
            },
            ExpressionAttributeNames: {
                "#a": "status",
            },
        }, logger);
    }
    const disruptionIds = disruptions
        .map((item) => item.disruptionId)
        .filter((value, index, array) => array.indexOf(value) === index);
    return (disruptionIds?.map((id) => collectDisruptionsData(disruptions || [], id, logger)).filter(notEmpty) ??
        []);
};
export const getCurrentAndFutureDisruptions = async (tableName, logger) => {
    const disruptions = await getPublishedDisruptionsDataFromDynamo(tableName, logger);
    return disruptions.filter((disruption) => isCurrentOrUpcomingDisruption(disruption.publishEndDate, disruption.publishEndTime));
};
export const getOrganisationsInfo = async (organisationsTableName, logger) => {
    logger.info("Getting all organisations from DynamoDB table...");
    try {
        const dbData = await recursiveScan({
            TableName: organisationsTableName,
            FilterExpression: "SK = :info",
            ExpressionAttributeValues: {
                ":info": "INFO",
            },
        }, logger);
        const parsedOrg = makeZodArray(organisationSchema).safeParse(dbData);
        if (!parsedOrg.success) {
            return null;
        }
        return parsedOrg.data;
    }
    catch (e) {
        if (e instanceof Error) {
            logger.error(e);
            throw e;
        }
        throw e;
    }
};
export const getAllOrganisationsInfoAndStats = async (organisationsTableName, logger) => {
    logger.info("Getting all organisations with stats from DynamoDB table...");
    try {
        const dbDataInfo = await recursiveScan({
            TableName: organisationsTableName,
            FilterExpression: "begins_with(SK, :info) OR begins_with(SK, :stat)",
            ExpressionAttributeValues: {
                ":info": "INFO",
                ":stat": "STAT",
            },
        }, logger);
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
    }
    catch (e) {
        if (e instanceof Error) {
            logger.error(e);
            throw e;
        }
        throw e;
    }
};
export const getOrganisationInfoAndStats = async (orgId, organisationsTableName, logger) => {
    logger.info(`Getting organisation ${orgId} with stats from DynamoDB table...`);
    try {
        const dbDataInfo = await recursiveQuery({
            TableName: organisationsTableName,
            KeyConditionExpression: "PK=:orgId",
            ExpressionAttributeValues: {
                ":orgId": orgId,
            },
        }, logger);
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
    }
    catch (e) {
        if (e instanceof Error) {
            logger.error(e);
            throw e;
        }
        throw e;
    }
};
export const getPublishedDisruptionById = async (orgId, disruptionId, tableName, logger) => {
    logger.info(`Retrieving (${disruptionId}) from DynamoDB table...`);
    const disruptionItems = await recursiveQuery({
        TableName: tableName,
        KeyConditionExpression: "PK = :1 and begins_with(SK, :2)",
        ExpressionAttributeValues: {
            ":1": orgId,
            ":2": `${disruptionId}`,
        },
    }, logger);
    if (!disruptionItems) {
        return null;
    }
    const info = disruptionItems.find((item) => item.SK === `${disruptionId}#INFO`);
    const consequences = disruptionItems.filter((item) => (item.SK.startsWith(`${disruptionId}#CONSEQUENCE`) &&
        !(item.SK.includes("#EDIT") || item.SK.includes("#PENDING"))) ??
        false);
    const parsedDisruption = disruptionSchema.safeParse({
        ...info,
        consequences: consequences,
    });
    if (!parsedDisruption.success) {
        logger.warn(inspect(parsedDisruption.error));
        logger.warn(`Invalid disruption ${disruptionId} in Dynamo`);
        return null;
    }
    return parsedDisruption.data;
};
export const getAllDisruptionsForOrg = async (orgId, tableName, logger) => {
    const disruptions = await recursiveQuery({
        TableName: tableName,
        KeyConditionExpression: "PK = :1",
        ExpressionAttributeValues: {
            ":1": orgId,
        },
    }, logger);
    return disruptions
        .map((disruption) => collectDisruptionsData(disruptions, disruption.disruptionId, logger))
        .filter(notEmpty);
};
export const getDisruptionsWithRoadworks = async (permitReferenceNumbers, tableName, publishStatus, logger) => {
    const queries = permitReferenceNumbers.map((_, i) => `permitReferenceNumber = :${i + 2}`);
    const joinedQueries = queries && queries.length > 0 ? queries.join(" or ") : queries[0];
    const filterExpression = `publishStatus = :1 and ${joinedQueries}`;
    const expressionAttributeValues = permitReferenceNumbers
        .map((permitReferenceNumber, i) => ({ [`:${i + 2}`]: permitReferenceNumber }))
        .reduce((prev, curr) => {
        Object.assign(prev, curr);
        return prev;
    }, {});
    const disruptions = await recursiveScan({
        TableName: tableName,
        FilterExpression: filterExpression,
        ExpressionAttributeValues: {
            ":1": publishStatus,
            ...expressionAttributeValues,
        },
    }, logger);
    return disruptions
        .map((disruption) => collectDisruptionsData(disruptions, disruption.disruptionId, logger))
        .filter(notEmpty);
};
export const getOrgIdsFromDynamoByAdminAreaCodes = async (tableName, administrativeAreaCodes, logger) => {
    const dbData = await recursiveScan({
        TableName: tableName,
        FilterExpression: "SK = :info",
        ExpressionAttributeValues: {
            ":info": "INFO",
        },
    }, logger);
    const parsedOrgs = makeZodArray(organisationSchema).safeParse(dbData);
    if (!parsedOrgs.success) {
        return null;
    }
    const filteredOrgIdsWithAdminAreaCodes = {};
    parsedOrgs.data.forEach((org) => {
        org.adminAreaCodes.forEach((adminAreaCode) => {
            if (administrativeAreaCodes.includes(adminAreaCode)) {
                if (filteredOrgIdsWithAdminAreaCodes[org.id]) {
                    filteredOrgIdsWithAdminAreaCodes[org.id].push(adminAreaCode);
                }
                else {
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
