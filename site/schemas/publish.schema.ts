import { z } from "zod";
import { consequenceSchema } from "./consequence.schema";
import { createDisruptionsSchemaRefined } from "./create-disruption.schema";

export const publishSchema = z.object({
    disruptionId: z.string().uuid(),
});

export const publishDisruptionSchema = createDisruptionsSchemaRefined.and(
    z.object({
        consequences: z.array(consequenceSchema).min(1, {
            message: "You must create a consequence before publishing the disruption",
        }),
    }),
);

export type Publish = z.infer<typeof publishSchema>;
