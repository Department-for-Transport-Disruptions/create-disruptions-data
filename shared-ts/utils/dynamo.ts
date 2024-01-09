import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    QueryCommand,
    QueryCommandInput,
    ScanCommand,
    ScanCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { inspect } from "util";
import { getDate, getDatetimeFromDateAndTime, isCurrentOrUpcomingDisruption } from "./dates";
import { makeZodArray } from "./zod";
import { Disruption } from "../disruptionTypes";
import { disruptionSchema } from "../disruptionTypes.zod";
import { PublishStatus } from "../enums";
import {
    organisationSchemaWithStats,
    Organisation,
    organisationSchema,
    OrganisationWithStats,
} from "../organisationTypes";
import { Logger, notEmpty, sortDisruptionsByStartDate } from "./index";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "eu-west-2" }));

const collectDisruptionsData = (
    disruptionItems: Record<string, unknown>[],
    disruptionId: string,
    logger: Logger,
): Disruption | null => {
    const info = disruptionItems.find((item) => item.SK === `${disruptionId}#INFO`);

    if (!info) {
        return null;
    }

    let consequences = disruptionItems.filter(
        (item) =>
            ((item.SK as string).startsWith(`${disruptionId}#CONSEQUENCE`) &&
                !((item.SK as string).includes("#EDIT") || (item.SK as string).includes("#PENDING"))) ??
            false,
    );

    consequences = consequences.filter((consequence) => !consequence.isDeleted);

    const history = disruptionItems.filter((item) => (item.SK as string).startsWith(`${disruptionId}#HISTORY`));

    const parsedDisruption = disruptionSchema.safeParse({
        ...info,
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
    } else {
        return dbData.Items;
    }
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
    } else {
        return dbData.Items;
    }
};

export const getPublishedDisruptionsDataFromDynamo = async (
    tableName: string,
    logger: Logger,
    orgId?: string,
): Promise<Disruption[]> => {
    logger.info("Getting disruptions data from DynamoDB table...");

    let disruptions: Record<string, unknown>[] = [];

    if (orgId) {
        disruptions = await recursiveQuery(
            {
                TableName: tableName,
                KeyConditionExpression: "PK = :1",
                FilterExpression: "publishStatus = :2",
                ExpressionAttributeValues: {
                    ":1": orgId,
                    ":2": PublishStatus.published,
                },
            },
            logger,
        );
    } else {
        disruptions = await recursiveScan(
            {
                TableName: tableName,
                FilterExpression: "publishStatus = :1 or #a = :2",
                ExpressionAttributeValues: {
                    ":1": PublishStatus.published,
                    ":2": PublishStatus.published,
                },
                ExpressionAttributeNames: {
                    "#a": "status",
                },
            },
            logger,
        );
    }

    const disruptionIds = disruptions
        .map((item) => (item as Disruption).disruptionId)
        .filter((value, index, array) => array.indexOf(value) === index);

    return disruptionIds?.map((id) => collectDisruptionsData(disruptions || [], id, logger)).filter(notEmpty) ?? [];
};

export const getCurrentAndFutureDisruptions = async (tableName: string, logger: Logger): Promise<Disruption[]> => {
    const disruptions = await getPublishedDisruptionsDataFromDynamo(tableName, logger);

    return disruptions.filter((disruption) =>
        isCurrentOrUpcomingDisruption(disruption.publishEndDate, disruption.publishEndTime),
    );
};

export const getActiveDisruptions = async (
    tableName: string,
    logger: Logger,
    orgId?: string,
): Promise<Disruption[]> => {
    const disruptions = await getPublishedDisruptionsDataFromDynamo(tableName, logger, orgId);
    const sortedDisruptions = sortDisruptionsByStartDate(disruptions);

    const currentDatetime = getDate();

    return sortedDisruptions.filter((disruption) => {
        const firstValidity = disruption.validity?.[0];
        const finalValidity = disruption.validity?.[disruption.validity.length - 1];

        if (!firstValidity || !finalValidity) {
            return false;
        }

        const startDatetime = getDatetimeFromDateAndTime(
            firstValidity.disruptionStartDate,
            firstValidity.disruptionStartTime,
        );

        const endDatetime =
            finalValidity.disruptionEndDate && finalValidity.disruptionEndTime
                ? getDatetimeFromDateAndTime(finalValidity.disruptionEndDate, finalValidity.disruptionEndTime)
                : null;

        if (!endDatetime) {
            return currentDatetime.isAfter(startDatetime);
        }

        return currentDatetime.isBetween(startDatetime, endDatetime);
    });
};

export const getOrganisationsInfo = async (
    organisationsTableName: string,
    logger: Logger,
): Promise<Organisation[] | null> => {
    logger.info(`Getting all organisations from DynamoDB table...`);
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
    logger.info(`Getting all organisations with stats from DynamoDB table...`);
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

export const getPublishedDisruptionById = async (
    orgId: string,
    disruptionId: string,
    tableName: string,
    logger: Logger,
): Promise<Disruption | null> => {
    logger.info(`Retrieving (${disruptionId}) from DynamoDB table...`);
    const disruptionItems = await recursiveQuery(
        {
            TableName: tableName,
            KeyConditionExpression: "PK = :1 and begins_with(SK, :2)",
            ExpressionAttributeValues: {
                ":1": orgId,
                ":2": `${disruptionId}`,
            },
        },
        logger,
    );

    if (!disruptionItems) {
        return null;
    }

    const info = disruptionItems.find((item) => item.SK === `${disruptionId}#INFO`);

    const consequences = disruptionItems.filter(
        (item) =>
            ((item.SK as string).startsWith(`${disruptionId}#CONSEQUENCE`) &&
                !((item.SK as string).includes("#EDIT") || (item.SK as string).includes("#PENDING"))) ??
            false,
    );

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

export const getAllDisruptionsForOrg = async (orgId: string, tableName: string, logger: Logger) => {
    const disruptions = await recursiveQuery(
        {
            TableName: tableName,
            KeyConditionExpression: "PK = :1",
            ExpressionAttributeValues: {
                ":1": orgId,
            },
        },
        logger,
    );

    return disruptions.map((disruption) =>
        collectDisruptionsData(disruptions, disruption.disruptionId as string, logger),
    );
};
