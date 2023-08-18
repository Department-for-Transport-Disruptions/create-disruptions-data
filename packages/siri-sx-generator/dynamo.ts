import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { Disruption } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { disruptionSchema } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { notEmpty } from "@create-disruptions-data/shared-ts/utils";
import * as logger from "lambda-log";
import { z } from "zod";

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

export const organisationSchema = z
    .object({
        PK: z.string().uuid(),
        name: z.string(),
    })
    .transform((item) => ({
        id: item.PK,
        name: item.name,
    }));

export type Organisation = z.infer<typeof organisationSchema>;

export const getOrganisationInfoById = async (tableName: string, orgId: string): Promise<Organisation | null> => {
    const dbData = await ddbDocClient.send(
        new GetCommand({
            TableName: tableName,
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
