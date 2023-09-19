import { z } from "zod";

export const organisationSchema = z.object({
    PK: z.string(),
    name: z.string(),
    adminAreaCodes: z.array(z.string()),
});

export const organisationsSchema = z.array(organisationSchema);

export const statistic = z.object({
    disruptionReasonCount: z.record(z.string(), z.coerce.number().default(0)),
    networkWideConsequencesCount: z.coerce.number().default(0),
    operatorWideConsequencesCount: z.coerce.number().default(0),
    servicesAffected: z.coerce.number().default(0),
    servicesConsequencesCount: z.coerce.number().default(0),
    stopsAffected: z.coerce.number().default(0),
    stopsConsequencesCount: z.coerce.number().default(0),
    totalConsequencesCount: z.coerce.number().default(0),
    PK: z.string(),
    SK: z.enum(["STAT"]).optional(),
});

export const statistics = z.array(statistic);

export const organisationSchemaWithStats = z
    .object({
        PK: z.string(),
        SK: z.enum(["INFO"]).optional(),
        name: z.string(),
        adminAreaCodes: z.array(z.string()),
    })
    .or(statistic);

export const organisationsSchemaWithStats = z.array(organisationSchemaWithStats);

export type Organisations = z.infer<typeof organisationsSchema>;

export type OrganisationsWithStats = z.infer<typeof organisationsSchemaWithStats>;

export type OrganisationWithStats = z.infer<typeof organisationSchemaWithStats>;

export type Statistics = z.infer<typeof statistics>;

export type Statistic = z.infer<typeof statistic>;
