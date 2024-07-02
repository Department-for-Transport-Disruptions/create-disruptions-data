import { z } from "zod";
import { CANCELLATIONS_FEATURE_FLAG } from "../constants";
import { setZodDefaultError } from "../utils";

export const typeOfConsequenceSchema = z.object({
    disruptionId: z.string().uuid(),
    consequenceType: z.union(
        [
            z.literal("services"),
            z.literal("networkWide"),
            z.literal("operatorWide"),
            z.literal("stops"),
            ...(CANCELLATIONS_FEATURE_FLAG ? [z.literal("journeys")] : []),
        ],
        setZodDefaultError("Select a consequence type"),
    ),
    consequenceIndex: z.coerce.number(),
});

export type ConsequenceType = z.infer<typeof typeOfConsequenceSchema>;
