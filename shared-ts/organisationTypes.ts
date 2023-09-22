import { z } from "zod";

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

export const organisationsSchema = z.array(organisationSchema);

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

export const organisationsSchemaWithStats = z.array(organisationSchema.and(z.object({ stats: statisticSchema })));

export const organisationSchemaWithStats = organisationSchema.and(z.object({ stats: statisticSchema }));

export type Organisations = z.infer<typeof organisationsSchema>;

export type OrganisationsWithStats = z.infer<typeof organisationsSchemaWithStats>;

export type Statistic = z.infer<typeof statisticSchema>;
