import { z } from "zod";
import { setZodDefaultError } from "../utils";

export const typeOfConsequenceSchema = z.object({
    disruptionId: z.string().uuid(),
    consequenceType: z.union(
        [z.literal("services"), z.literal("networkWide"), z.literal("operatorWide"), z.literal("stops")],
        setZodDefaultError("Select a consequence type"),
    ),
    consequenceIndex: z.coerce.number(),
});

export type ConsequenceType = z.infer<typeof typeOfConsequenceSchema>;
