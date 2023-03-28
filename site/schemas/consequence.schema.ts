import { Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { z } from "zod";
import { setZodDefaultError, zodTimeInMinutes } from "../utils";

const baseConsequence = {
    description: z.string(setZodDefaultError("Enter a consequence description")).min(1).max(500, {
        message: "Description must not exceed 500 characters",
    }),
    removeFromJourneyPlanners: z.union([z.literal("yes"), z.literal("no")], setZodDefaultError("Select yes or no")),
    disruptionDelay: zodTimeInMinutes("Enter a number between 0 to 999 for disruption delay").optional(),
    disruptionSeverity: z.union(
        [
            z.literal(Severity.unknown),
            z.literal(Severity.verySlight),
            z.literal(Severity.slight),
            z.literal(Severity.normal),
            z.literal(Severity.severe),
            z.literal(Severity.verySevere),
        ],
        setZodDefaultError("Select the severity from the dropdown"),
    ),

    vehicleMode: z.nativeEnum(VehicleMode, setZodDefaultError("Select a vehicle mode")),
};

export const networkConsequenceSchema = z.object({
    ...baseConsequence,
    consequenceType: z.literal("networkWide", setZodDefaultError("Select a consequence type")),
});

export type NetworkConsequence = z.infer<typeof networkConsequenceSchema>;

export const operatorConsequenceSchema = z.object({
    ...baseConsequence,
    consequenceOperator: z.union(
        [z.literal("FMAN"), z.literal("SCMN"), z.literal("FSYO"), z.literal("SYRK")],
        setZodDefaultError("Select an operator"),
    ),
    consequenceType: z.literal("operatorWide", setZodDefaultError("Select a consequence type")),
});

export type OperatorConsequence = z.infer<typeof operatorConsequenceSchema>;

export const stopsConsequenceSchema = z.object({
    ...baseConsequence,
    consequenceType: z.literal("stops", setZodDefaultError("Select a consequence type")),
    stops: z.array(z.string()),
});

export type StopsConsequence = z.infer<typeof stopsConsequenceSchema>;

export const servicesConsequenceSchema = z.object({
    ...baseConsequence,
    consequenceType: z.literal("services", setZodDefaultError("Select a consequence type")),
    services: z.array(z.object({ id: z.string(), name: z.string() })),
});

export type ServicesConsequence = z.infer<typeof servicesConsequenceSchema>;

export const consequenceSchema = z.discriminatedUnion("consequenceType", [
    networkConsequenceSchema,
    operatorConsequenceSchema,
    stopsConsequenceSchema,
    servicesConsequenceSchema,
]);

export type Consequence = z.infer<typeof consequenceSchema>;
