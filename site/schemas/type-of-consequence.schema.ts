import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { z } from "zod";
import { setZodDefaultError } from "../utils";

export const typeOfConsequenceSchema = z.object({
    disruptionId: z.string().uuid(),
    consequenceType: z.union(
        [z.literal("services"), z.literal("networkWide"), z.literal("operatorWide"), z.literal("stops")],
        setZodDefaultError("Select a consequence type"),
    ),
    consequenceIndex: z.coerce.number(),
    disruptionStatus: z.nativeEnum(PublishStatus).default(PublishStatus.draft),
});

export type ConsequenceType = z.infer<typeof typeOfConsequenceSchema>;
