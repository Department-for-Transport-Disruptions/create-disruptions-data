import { z } from "zod";
import { stopSchema } from "./disruptionTypes.zod";

export const organisationSchema = z
    .object({
        PK: z.string(),
        name: z.string(),
        adminAreaCodes: z.array(z.string()),
    })
    .transform((data) => ({
        id: data.PK,
        name: data.name,
        adminAreaCodes: data.adminAreaCodes,
    }));

export const statisticSchema = z.object({
    disruptionReasonCount: z.record(z.string(), z.coerce.number().default(0)),
    networkWideConsequencesCount: z.coerce.number().default(0),
    operatorWideConsequencesCount: z.coerce.number().default(0),
    servicesAffected: z.coerce.number().default(0),
    servicesConsequencesCount: z.coerce.number().default(0),
    stopsAffected: z.coerce.number().default(0),
    stopsConsequencesCount: z.coerce.number().default(0),
    totalConsequencesCount: z.coerce.number().default(0),
});

export const organisationSchemaWithStats = organisationSchema.and(z.object({ stats: statisticSchema }));

export const organisationStops = z.object({
    stops: z.array(stopSchema),
});

export type Organisation = z.infer<typeof organisationSchema>;
export type OrganisationWithStats = z.infer<typeof organisationSchemaWithStats>;
