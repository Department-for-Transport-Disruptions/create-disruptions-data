import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    QueryCommand,
    QueryCommandInput,
    ScanCommand,
    ScanCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { getDate, getDatetimeFromDateAndTime } from "./dates";
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
import { notEmpty } from "./index";

type Logger = {
    info: (message: string) => void;
    error: (message: string | Error) => void;
    warn: (message: string) => void;
};

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

    const parsedDisruption = disruptionSchema.safeParse({
        ...info,
        consequences,
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
): Promise<Disruption[]> => {
    logger.info("Getting disruptions data from DynamoDB table...");

    const disruptions = await recursiveScan(
        {
            TableName: tableName,
            FilterExpression: "publishStatus = :1",
            ExpressionAttributeValues: {
                ":1": PublishStatus.published,
            },
        },
        logger,
    );

    const disruptionIds = disruptions
        .map((item) => (item as Disruption).disruptionId)
        .filter((value, index, array) => array.indexOf(value) === index);

    return disruptionIds?.map((id) => collectDisruptionsData(disruptions || [], id, logger)).filter(notEmpty) ?? [];
};

export const getCurrentAndFutureDisruptions = async (tableName: string, logger: Logger): Promise<Disruption[]> => {
    const disruptions = await getPublishedDisruptionsDataFromDynamo(tableName, logger);

    const currentDatetime = getDate();

    return disruptions.filter((disruption) => {
        if (disruption.publishEndDate && disruption.publishEndTime) {
            const endDatetime = getDatetimeFromDateAndTime(disruption.publishEndDate, disruption.publishEndTime);

            if (currentDatetime.isAfter(endDatetime)) {
                return false;
            }
        }

        return true;
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
