import { z } from "zod";
import { Severity } from "../constants";
import { setZodDefaultError, zodTimeInMinutes } from "../utils";
export const createConsequenceStopsSchema = z.object({
    stopsImpacted: z
        .string()
        .array()
        .refine((arr) => arr && arr.length >= 1, {
            path: ["stopsImpacted"],
            message: "At least one stop must be added",
        }),

    description: z.string(setZodDefaultError("Enter a description for this disruption")).min(1).max(500, {
        message: "Description must not exceed 500 characters",
    }),

    removeFromJourneyPlanners: z.union(
        [z.literal("yes"), z.literal("no")],
        setZodDefaultError("Select at least one option"),
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
});
