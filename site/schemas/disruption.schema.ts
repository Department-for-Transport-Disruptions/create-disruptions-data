import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { z } from "zod";
import { consequenceSchema } from "./consequence.schema";
import { createDisruptionsSchemaRefined } from "./create-disruption.schema";

const historySchema = z.object({
    historyItems: z.array(z.string()),
    user: z.string(),
    datetime: z.string().datetime(),
    status: z.nativeEnum(PublishStatus),
});

export type History = z.infer<typeof historySchema>;

export const disruptionSchema = createDisruptionsSchemaRefined.and(
    z.object({
        consequences: z.array(consequenceSchema).optional(),
        deletedConsequences: z.array(z.object({ consequenceIndex: z.number() })).optional(),
        history: z.array(historySchema).optional(),
        newHistory: z.array(z.string()).optional(),
        publishStatus: z.nativeEnum(PublishStatus).default(PublishStatus.draft),
    }),
);

export type Disruption = z.infer<typeof disruptionSchema>;
