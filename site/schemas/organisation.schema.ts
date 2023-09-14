import { Datasource } from "@create-disruptions-data/shared-ts/enums";
import { z } from "zod";
import { setZodDefaultError } from "../utils";

export const modeSchema = z.object({
    bus: z.nativeEnum(Datasource),
    tram: z.nativeEnum(Datasource),
    ferryService: z.nativeEnum(Datasource),
    rail: z.nativeEnum(Datasource),
});

export type ModeType = z.infer<typeof modeSchema>;

export const defaultModes: ModeType = {
    bus: Datasource.bods,
    tram: Datasource.bods,
    ferryService: Datasource.bods,
    rail: Datasource.bods,
};

export const organisationSchema = z.object({
    name: z.string(setZodDefaultError("Enter an organisation name")).min(3),
    adminAreaCodes: z.array(z.string()).min(1, { message: "At least 1 area code is required" }),
    PK: z.string().optional(),
    mode: modeSchema.optional().default(defaultModes),
});

export type Organisation = z.infer<typeof organisationSchema>;

export const organisationsSchema = z.array(
    z.object({
        PK: z.string(),
        name: z.string(),
        adminAreaCodes: z.array(z.string()),
    }),
);
export type Organisations = z.infer<typeof organisationsSchema>;

export const areaCodeSchema = z.string().transform((item) => ({
    value: item,
    label: item,
}));

export type AreaCodeValuePair = z.infer<typeof areaCodeSchema>;
