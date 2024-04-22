import { Datasource } from "@create-disruptions-data/shared-ts/enums";
import { z } from "zod";
import { setZodDefaultError } from "../utils";

export const modeSchema = z.object({
    bus: z.nativeEnum(Datasource).default(Datasource.bods),
    tram: z.nativeEnum(Datasource).default(Datasource.tnds),
    ferryService: z.nativeEnum(Datasource).default(Datasource.tnds),
    rail: z.nativeEnum(Datasource).default(Datasource.tnds),
    underground: z.nativeEnum(Datasource).default(Datasource.tnds),
});

export type ModeType = z.infer<typeof modeSchema>;

export const defaultModes: ModeType = {
    bus: Datasource.bods,
    tram: Datasource.tnds,
    ferryService: Datasource.tnds,
    rail: Datasource.tnds,
    underground: Datasource.tnds,
};

export const organisationSchema = z.object({
    name: z.string(setZodDefaultError("Enter an organisation name")).min(3),
    adminAreaCodes: z.array(z.string()).min(1, { message: "At least 1 area code is required" }),
    PK: z.string().optional(),
    mode: modeSchema.optional().default(defaultModes),
});

export type Organisation = z.infer<typeof organisationSchema>;

export const areaCodeSchema = z.string().transform((item) => ({
    value: item,
    label: item,
}));

export type AreaCodeValuePair = z.infer<typeof areaCodeSchema>;

export const subOrganisationSchema = z.object({
    name: z.string(),
    PK: z.string(),
    nocCodes: z.array(z.string()),
    SK: z.string(),
});

export type SubOrganisation = z.infer<typeof subOrganisationSchema>;

export const subOrganisationsSchema = z.array(subOrganisationSchema);

export const operatorOrgSchema = subOrganisationSchema.transform((data) => ({
    orgId: data.PK,
    operatorOrgId: data.SK.replace("OPERATOR#", ""),
    name: data.name,
    nocCodes: data.nocCodes,
}));

export type OperatorOrgSchema = z.infer<typeof operatorOrgSchema>;

export const operatorOrgListSchema = z.array(operatorOrgSchema);
