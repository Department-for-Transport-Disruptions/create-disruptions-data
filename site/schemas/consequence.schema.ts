import { Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { z } from "zod";
import { setZodDefaultError, zodTimeInMinutes } from "../utils";

const baseConsequence = {
    disruptionId: z.string().uuid(),
    description: z.string(setZodDefaultError("Enter a consequence description")).min(1).max(500, {
        message: "Description must not exceed 500 characters",
    }),
    removeFromJourneyPlanners: z.union([z.literal("yes"), z.literal("no")], setZodDefaultError("Select yes or no")),
    disruptionDelay: zodTimeInMinutes("Enter a number between 0 to 999 for disruption delay").optional(),
    disruptionSeverity: z.nativeEnum(Severity, setZodDefaultError("Select the severity from the dropdown")),
    vehicleMode: z.nativeEnum(VehicleMode, setZodDefaultError("Select a mode of transport")),
    consequenceIndex: z.coerce.number(),
};

export const networkConsequenceSchema = z.object({
    ...baseConsequence,
    consequenceType: z.literal("networkWide", setZodDefaultError("Select a consequence type")),
});

export const duplicateConsequenceSchema = z.object({
    disruptionId: z.string().uuid(),
});

export const consequenceOperatorsSchema = z.object({
    operatorNoc: z.string(),
    operatorPublicName: z.string(),
});

export type ConsequenceOperators = z.infer<typeof consequenceOperatorsSchema>;

export type NetworkConsequence = z.infer<typeof networkConsequenceSchema>;

export const operatorConsequenceSchema = z.object({
    ...baseConsequence,
    consequenceOperators: z.array(consequenceOperatorsSchema).min(1, { message: "Select one or more operators" }),
    consequenceType: z.literal("operatorWide", setZodDefaultError("Select a consequence type")),
});

export type OperatorConsequence = z.infer<typeof operatorConsequenceSchema>;

export const stopSchema = z.object({
    atcoCode: z.string({}),
    commonName: z.string({}),
    indicator: z.string().optional(),
    longitude: z.coerce.number(),
    latitude: z.coerce.number(),
    serviceIds: z.array(z.number({})).optional(),
    bearing: z.string().optional(),
    sequenceNumber: z.string().optional(),
    direction: z.string().optional(),
    stopType: z.string().optional(),
    busStopType: z.string().optional(),
});

export const routesSchema = z.object({
    inbound: z.array(stopSchema.partial()),
    outbound: z.array(stopSchema.partial()),
});

export const stopsConsequenceSchema = z.object({
    ...baseConsequence,
    consequenceType: z.literal("stops", setZodDefaultError("Select a consequence type")),
    stops: z
        .array(stopSchema)
        .min(1, {
            message: "At least one stop must be added",
        })
        .max(100, {
            message: "Maximum of 100 stops permitted per consequence",
        }),
});

export type Stop = z.infer<typeof stopSchema>;

export type Routes = z.infer<typeof routesSchema>;

export type StopsConsequence = z.infer<typeof stopsConsequenceSchema>;

export const serviceSchema = z.object({
    id: z.number(),
    lineName: z.string(),
    operatorShortName: z.string(),
    destination: z.string(),
    origin: z.string(),
    nocCode: z.string(),
    dataSource: z.string().optional(),
    startDate: z.string(),
    endDate: z.string().nullable(),
    serviceCode: z.string().optional(),
    lineId: z.string().optional(),
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

export const servicesConsequenceSchema = z.object({
    ...baseConsequence,
    consequenceType: z.literal("services", setZodDefaultError("Select a consequence type")),
    stops: z.array(stopSchema).optional(),
    services: z
        .array(serviceSchema)
        .min(1, {
            message: "At least one service must be added",
        })
        .max(100, { message: "Only up to 100 services can be added" }),
    disruptionDirection: z.union(
        [z.literal("allDirections"), z.literal("inbound"), z.literal("outbound")],
        setZodDefaultError("Select a direction"),
    ),
});

export type Service = z.infer<typeof serviceSchema>;

export type ServicesConsequence = z.infer<typeof servicesConsequenceSchema>;

export const consequenceSchema = z.discriminatedUnion("consequenceType", [
    networkConsequenceSchema,
    operatorConsequenceSchema,
    stopsConsequenceSchema,
    servicesConsequenceSchema,
]);

export type Consequence = z.infer<typeof consequenceSchema>;

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
