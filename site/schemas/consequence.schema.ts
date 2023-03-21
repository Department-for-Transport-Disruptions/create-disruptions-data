import { Severity } from "@create-disruptions-data/shared-ts/enums";
import { z } from "zod";
import { setZodDefaultError, zodTimeInMinutes } from "../utils";

const baseConsequence = {
    description: z.string(setZodDefaultError("Enter a consequence description")).min(1).max(500, {
        message: "Description must not exceed 500 characters",
    }),
    removeFromJourneyPlanners: z.union(
        [z.literal("yes"), z.literal("no")],
        setZodDefaultError("Select planned or unplanned"),
    ),
    disruptionDelay: zodTimeInMinutes("Enter a number between 0 to 999 for disruption delay")
        .optional()
        .or(z.literal("")),
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
    disruptionDirection: z.union(
        [z.literal("allDirections"), z.literal("inbound"), z.literal("outbound")],
        setZodDefaultError("Select a direction"),
    ),
};

export const networkConsequenceSchema = z.object({
    ...baseConsequence,
    consequenceType: z.literal("networkWide"),
});

export type NetworkConsequence = z.infer<typeof networkConsequenceSchema>;

export const operatorConsequenceSchema = z.object({
    ...baseConsequence,
    consequenceOperator: z.union(
        [z.literal("FMAN"), z.literal("SCMN"), z.literal("FSYO"), z.literal("SYRK")],
        setZodDefaultError("Select at least one operator"),
    ),
    consequenceType: z.literal("operatorWide"),
});

export type OperatorConsequence = z.infer<typeof operatorConsequenceSchema>;

export const consequenceSchema = z.discriminatedUnion("consequenceType", [
    networkConsequenceSchema,
    operatorConsequenceSchema,
]);

export type Consequence = z.infer<typeof consequenceSchema>;
