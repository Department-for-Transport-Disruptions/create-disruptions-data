import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { z } from "zod";
export const recursiveQuery = async (client, queryCommandInput) => {
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
