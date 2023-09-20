import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    QueryCommand,
    QueryCommandInput,
    ScanCommand,
    ScanCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Disruption } from "../disruptionTypes";
import { disruptionSchema } from "../disruptionTypes.zod";
import { PublishStatus } from "../enums";
import {
    Organisations,
    OrganisationsWithStats,
    organisationsSchema,
    organisationSchema,
    organisationsSchemaWithStats,
    statistic,
    OrganisationWithStats,
} from "../organisationTypes";
import { notEmpty } from "./index";

type Logger = {
    info: (message: string) => void;
    error: (message: string | Error) => void;
    warn: (message: string) => void;
};

const organisationsTableName = process.env.ORGANISATIONS_TABLE_NAME as string;

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

export const getOrganisationsInfo = async (logger: Logger): Promise<Organisations | null> => {
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

        const parsedOrg = organisationsSchema.safeParse(dbData);

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

export const getAllOrganisationsInfoAndStats = async (logger: Logger): Promise<OrganisationsWithStats | null> => {
    logger.info(`Getting all organisations from DynamoDB table...`);
    try {
        const dbDataInfo = await recursiveScan(
            {
                TableName: organisationsTableName,
            },
            logger,
        );

        const parsedOrgWithStats = organisationsSchemaWithStats.safeParse(dbDataInfo);

        if (!parsedOrgWithStats.success) {
            return null;
        }

        const organisations = parsedOrgWithStats.data.filter((org) => org.SK === "INFO");

        const stats = parsedOrgWithStats.data.filter((org) => org.SK === "STAT");

        const organisationsData = organisations.map((org) => ({
            ...org,
            ...(stats.find((orgStats) => orgStats.PK === org.PK) || {}),
            SK: undefined,
        }));

        return organisationsData;
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
    logger: Logger,
): Promise<OrganisationWithStats | null> => {
    logger.info(`Getting organisation ${orgId} from DynamoDB table...`);
    try {
        const dbDataInfo = await recursiveScan(
            {
                TableName: organisationsTableName,
                FilterExpression: "PK = :orgId",
                ExpressionAttributeValues: {
                    ":orgId": orgId,
                },
            },
            logger,
        );

        const parsedOrgWithStats = organisationsSchemaWithStats.safeParse(dbDataInfo);

        if (!parsedOrgWithStats.success) {
            return null;
        }

        const organisations = parsedOrgWithStats.data.find((org) => org.SK === "INFO");

        const stats = parsedOrgWithStats.data.find((org) => org.SK === "STAT");

        if (!organisations || !stats) {
            return null;
        }

        const parsedOrg = organisationSchema.safeParse(organisations);
        const parsedStats = statistic.safeParse(stats);

        if (!parsedOrg.success || !parsedStats.success) {
            return null;
        }

        return {
            networkWideConsequencesCount: parsedStats.data.networkWideConsequencesCount || 0,
            servicesAffected: parsedStats.data.servicesAffected || 0,
            servicesConsequencesCount: parsedStats.data.servicesConsequencesCount || 0,
            stopsAffected: parsedStats.data.stopsAffected || 0,
            stopsConsequencesCount: parsedStats.data.stopsConsequencesCount || 0,
            disruptionReasonCount: parsedStats.data.disruptionReasonCount,
            totalConsequencesCount: parsedStats.data.totalConsequencesCount || 0,
            PK: parsedOrg.data.PK,
            adminAreaCodes: parsedOrg.data.adminAreaCodes,
            name: parsedOrg.data.name,
        };
    } catch (e) {
        if (e instanceof Error) {
            logger.error(e);

            throw e;
        }

        throw e;
    }
};
