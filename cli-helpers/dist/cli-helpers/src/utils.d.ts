import { DynamoDBDocumentClient, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { z } from "zod";
export declare const recursiveQuery: (client: DynamoDBDocumentClient, queryCommandInput: QueryCommandInput) => Promise<Record<string, unknown>[]>;
export declare const orgsSchema: z.ZodObject<{
    PK: z.ZodString;
    name: z.ZodString;
    adminAreaCodes: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    PK: string;
    name: string;
    adminAreaCodes: string[];
}, {
    PK: string;
    name: string;
    adminAreaCodes: string[];
}>;
