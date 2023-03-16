export interface ConsequenceOperatorPageInputs {
    "disruption-direction": string;
}

import { z } from "zod";
import { Severity } from "../constants";
import { setZodDefaultError, zodTimeInHoursAndMinutes } from "../utils";

export const createConsequenceOperatorSchemaRefined = z.object({
    consequenceOperator: z.union(
        [z.literal("FMAN"), z.literal("SCMN"), z.literal("FSYO"), z.literal("SYRK")],
        setZodDefaultError("Select at least one operator"),
    ),
    description: z.string(setZodDefaultError("Enter a consequence description")).min(1).max(500, {
        message: "Description must not exceed 500 characters",
    }),
    removeFromJourneyPlanners: z.union(
        [z.literal("yes"), z.literal("no")],
        setZodDefaultError("Enter planned or unplanned"),
    ),
    disruptionDelay: zodTimeInHoursAndMinutes("Enter a valid time for disruption delay").optional().or(z.literal("")),
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
        setZodDefaultError("Select atleast one direction"),
    ),
});
