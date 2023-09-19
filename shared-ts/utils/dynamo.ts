import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import * as logger from "lambda-log";
import { Disruption } from "../disruptionTypes";
import { disruptionSchema } from "../disruptionTypes.zod";
import { PublishStatus } from "../enums";
import {
    Organisations,
    OrganisationsWithStats,
    Statistic,
    organisationsSchema,
    organisationsSchemaWithStats,
    statistics,
} from "../organisationTypes";
import { notEmpty } from "./index";

const organisationsTableName = process.env.ORGANISATIONS_TABLE_NAME as string;

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "eu-west-2" }));

const collectDisruptionsData = (
    disruptionItems: Record<string, unknown>[],
    disruptionId: string,
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
export const getPublishedDisruptionsDataFromDynamo = async (tableName: string): Promise<Disruption[]> => {
    logger.info("Getting disruptions data from DynamoDB table...");

    const dbData = await ddbDocClient.send(
        new ScanCommand({
            TableName: tableName,
            FilterExpression: "publishStatus = :1",
            ExpressionAttributeValues: {
                ":1": PublishStatus.published,
            },
        }),
    );

    const disruptionIds = dbData.Items?.map((item) => (item as Disruption).disruptionId).filter(
        (value, index, array) => array.indexOf(value) === index,
    );

    return disruptionIds?.map((id) => collectDisruptionsData(dbData.Items || [], id)).filter(notEmpty) ?? [];
};

export const getOrganisationsInfo = async (): Promise<Organisations | null> => {
    logger.info(`Getting all organisations from DynamoDB table...`);
    try {
        const dbData = await ddbDocClient.send(
            new ScanCommand({
                TableName: organisationsTableName,
                FilterExpression: "SK = :info",
                ExpressionAttributeValues: {
                    ":info": "INFO",
                },
            }),
        );

        const parsedOrg = organisationsSchema.safeParse(dbData.Items);

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

export const getAllOrganisationsInfoAndStats = async (): Promise<OrganisationsWithStats | null> => {
    logger.info(`Getting all organisations from DynamoDB table...`);
    try {
        const dbDataInfo = await ddbDocClient.send(
            new ScanCommand({
                TableName: organisationsTableName,
            }),
        );

        const parsedOrgWithStats = organisationsSchemaWithStats.safeParse(dbDataInfo.Items);

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
