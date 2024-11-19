import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { Disruption } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { Organisation, organisationSchema } from "@create-disruptions-data/shared-ts/organisationTypes";
import { getDatetimeFromDateAndTime } from "@create-disruptions-data/shared-ts/utils/dates";
import { Dayjs } from "dayjs";
import { z } from "zod";

export const recursiveQuery = async (
    client: DynamoDBDocumentClient,
    queryCommandInput: QueryCommandInput,
): Promise<Record<string, unknown>[]> => {
    const dbData = await client.send(new QueryCommand(queryCommandInput));

    if (!dbData.Items) {
        return [];
    }

    if (dbData.LastEvaluatedKey) {
        return [
            ...dbData.Items,
            ...(await recursiveQuery(client, {
                ...queryCommandInput,
                ExclusiveStartKey: dbData.LastEvaluatedKey,
            })),
        ];
    }

    return dbData.Items;
};

export const orgsSchema = z.object({ PK: z.string().uuid(), name: z.string(), adminAreaCodes: z.array(z.string()) });

export const includeDisruption = (disruption: Disruption, currentDatetime: Dayjs) => {
    if (disruption.publishStatus !== PublishStatus.published) {
        return false;
    }

    if (disruption.publishEndDate && disruption.publishEndTime) {
        const endDatetime = getDatetimeFromDateAndTime(disruption.publishEndDate, disruption.publishEndTime);

        if (currentDatetime.isAfter(endDatetime)) {
            return false;
        }
    }

    return true;
};

export const getOrganisationInfoById = async (tableName: string, orgId: string): Promise<Organisation | null> => {
    const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "eu-west-2" }));

    const dbData = await ddbDocClient.send(
        new GetCommand({
            TableName: tableName,
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
