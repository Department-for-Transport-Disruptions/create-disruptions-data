import { z } from "zod";

export const organisationsSchema = z.array(
    z.object({
        PK: z.string(),
        name: z.string(),
        adminAreaCodes: z.array(z.string()),
    }),
);

export const statistic = z
    .object({
        disruptionReasonCount: z.record(z.string(), z.coerce.number().default(0)),
        networkWideConsequencesCount: z.coerce.number().default(0),
        operatorWideConsequencesCount: z.coerce.number().default(0),
        servicesAffected: z.coerce.number().default(0),
        servicesConsequencesCount: z.coerce.number().default(0),
        stopsAffected: z.coerce.number().default(0),
        stopsConsequencesCount: z.coerce.number().default(0),
        totalConsequencesCount: z.coerce.number().default(0),
    })
    .and(z.object({ PK: z.string() }));

export const statistics = z.array(statistic);

export const organisationsSchemaWithStats = z.array(
    z
        .object({
            PK: z.string(),
            name: z.string(),
            adminAreaCodes: z.array(z.string()),
        })
        .and(statistic),
);

export type Organisations = z.infer<typeof organisationsSchema>;

export type OrganisationsWithStats = z.infer<typeof organisationsSchemaWithStats>;

export type Statistics = z.infer<typeof statistics>;

export type Statistic = z.infer<typeof statistic>;
