import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { z } from "zod";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "eu-west-2" }));

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
