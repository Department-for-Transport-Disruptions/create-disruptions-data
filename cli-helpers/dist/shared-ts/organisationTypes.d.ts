import { z } from "zod";
export declare const organisationSchema: z.ZodEffects<z.ZodObject<{
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
}>, {
    id: string;
    name: string;
    adminAreaCodes: string[];
}, {
    PK: string;
    name: string;
    adminAreaCodes: string[];
}>;
export declare const statisticSchema: z.ZodObject<{
    disruptionReasonCount: z.ZodRecord<z.ZodString, z.ZodDefault<z.ZodNumber>>;
    networkWideConsequencesCount: z.ZodDefault<z.ZodNumber>;
    operatorWideConsequencesCount: z.ZodDefault<z.ZodNumber>;
    servicesAffected: z.ZodDefault<z.ZodNumber>;
    servicesConsequencesCount: z.ZodDefault<z.ZodNumber>;
    stopsAffected: z.ZodDefault<z.ZodNumber>;
    stopsConsequencesCount: z.ZodDefault<z.ZodNumber>;
    totalConsequencesCount: z.ZodDefault<z.ZodNumber>;
    totalDisruptionsCount: z.ZodDefault<z.ZodNumber>;
    lastUpdated: z.ZodDefault<z.ZodString>;
    journeysAffected: z.ZodDefault<z.ZodNumber>;
    journeysConsequencesCount: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    lastUpdated: string;
    disruptionReasonCount: Record<string, number>;
    networkWideConsequencesCount: number;
    operatorWideConsequencesCount: number;
    servicesAffected: number;
    servicesConsequencesCount: number;
    stopsAffected: number;
    stopsConsequencesCount: number;
    totalConsequencesCount: number;
    totalDisruptionsCount: number;
    journeysAffected: number;
    journeysConsequencesCount: number;
}, {
    disruptionReasonCount: Record<string, number | undefined>;
    lastUpdated?: string | undefined;
    networkWideConsequencesCount?: number | undefined;
    operatorWideConsequencesCount?: number | undefined;
    servicesAffected?: number | undefined;
    servicesConsequencesCount?: number | undefined;
    stopsAffected?: number | undefined;
    stopsConsequencesCount?: number | undefined;
    totalConsequencesCount?: number | undefined;
    totalDisruptionsCount?: number | undefined;
    journeysAffected?: number | undefined;
    journeysConsequencesCount?: number | undefined;
}>;
export declare const organisationSchemaWithStats: z.ZodIntersection<z.ZodEffects<z.ZodObject<{
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
}>, {
    id: string;
    name: string;
    adminAreaCodes: string[];
}, {
    PK: string;
    name: string;
    adminAreaCodes: string[];
}>, z.ZodObject<{
    stats: z.ZodObject<{
        disruptionReasonCount: z.ZodRecord<z.ZodString, z.ZodDefault<z.ZodNumber>>;
        networkWideConsequencesCount: z.ZodDefault<z.ZodNumber>;
        operatorWideConsequencesCount: z.ZodDefault<z.ZodNumber>;
        servicesAffected: z.ZodDefault<z.ZodNumber>;
        servicesConsequencesCount: z.ZodDefault<z.ZodNumber>;
        stopsAffected: z.ZodDefault<z.ZodNumber>;
        stopsConsequencesCount: z.ZodDefault<z.ZodNumber>;
        totalConsequencesCount: z.ZodDefault<z.ZodNumber>;
        totalDisruptionsCount: z.ZodDefault<z.ZodNumber>;
        lastUpdated: z.ZodDefault<z.ZodString>;
        journeysAffected: z.ZodDefault<z.ZodNumber>;
        journeysConsequencesCount: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        lastUpdated: string;
        disruptionReasonCount: Record<string, number>;
        networkWideConsequencesCount: number;
        operatorWideConsequencesCount: number;
        servicesAffected: number;
        servicesConsequencesCount: number;
        stopsAffected: number;
        stopsConsequencesCount: number;
        totalConsequencesCount: number;
        totalDisruptionsCount: number;
        journeysAffected: number;
        journeysConsequencesCount: number;
    }, {
        disruptionReasonCount: Record<string, number | undefined>;
        lastUpdated?: string | undefined;
        networkWideConsequencesCount?: number | undefined;
        operatorWideConsequencesCount?: number | undefined;
        servicesAffected?: number | undefined;
        servicesConsequencesCount?: number | undefined;
        stopsAffected?: number | undefined;
        stopsConsequencesCount?: number | undefined;
        totalConsequencesCount?: number | undefined;
        totalDisruptionsCount?: number | undefined;
        journeysAffected?: number | undefined;
        journeysConsequencesCount?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    stats: {
        lastUpdated: string;
        disruptionReasonCount: Record<string, number>;
        networkWideConsequencesCount: number;
        operatorWideConsequencesCount: number;
        servicesAffected: number;
        servicesConsequencesCount: number;
        stopsAffected: number;
        stopsConsequencesCount: number;
        totalConsequencesCount: number;
        totalDisruptionsCount: number;
        journeysAffected: number;
        journeysConsequencesCount: number;
    };
}, {
    stats: {
        disruptionReasonCount: Record<string, number | undefined>;
        lastUpdated?: string | undefined;
        networkWideConsequencesCount?: number | undefined;
        operatorWideConsequencesCount?: number | undefined;
        servicesAffected?: number | undefined;
        servicesConsequencesCount?: number | undefined;
        stopsAffected?: number | undefined;
        stopsConsequencesCount?: number | undefined;
        totalConsequencesCount?: number | undefined;
        totalDisruptionsCount?: number | undefined;
        journeysAffected?: number | undefined;
        journeysConsequencesCount?: number | undefined;
    };
}>>;
export type Organisation = z.infer<typeof organisationSchema>;
export type OrganisationWithStats = z.infer<typeof organisationSchemaWithStats>;
