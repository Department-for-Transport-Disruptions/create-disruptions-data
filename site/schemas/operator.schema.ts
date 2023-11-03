import { z } from "zod";

export const operatorOrgSchema = z
    .object({
        PK: z.string(),
        SK: z.string(),
        name: z.string(),
        nocCodes: z.array(z.string()),
    })
    .transform((data) => ({
        orgId: data.PK,
        operatorOrgId: data.SK.replace("OPERATOR#", ""),
        operatorName: data.name,
        nocCodes: data.nocCodes,
    }));

export type OperatorSchema = z.infer<typeof operatorOrgSchema>;
