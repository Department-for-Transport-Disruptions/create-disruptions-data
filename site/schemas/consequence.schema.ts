import { serviceSchema } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { z } from "zod";

export const duplicateConsequenceSchema = z.object({
    disruptionId: z.string().uuid(),
});

export const serviceByStopSchema = serviceSchema.and(
    z.object({
        stops: z.array(z.string()),
        routes: z.object({
            inbound: z.array(z.object({ longitude: z.number(), latitude: z.number() })),
            outbound: z.array(z.object({ longitude: z.number(), latitude: z.number() })),
        }),
    }),
);

export type ServiceByStop = z.infer<typeof serviceByStopSchema>;

export type ServiceApiResponse = z.infer<typeof serviceSchema>;

export const operatorSchema = z.object({
    id: z.number(),
    nocCode: z.string(),
    operatorPublicName: z.string(),
    vosaPsvLicenseName: z.string().optional(),
    opId: z.string().optional(),
    pubNmId: z.string().optional(),
    nocCdQual: z.string().optional(),
    changeDate: z.string().optional(),
    changeAgent: z.string().optional(),
    changeComment: z.string().optional(),
    dateCeased: z.string().optional(),
    dataOwner: z.string().optional(),
    mode: z.string().optional(),
    dataSource: z.string().optional(),
});

export type Operator = z.infer<typeof operatorSchema>;
