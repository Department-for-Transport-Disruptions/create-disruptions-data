import { z } from "zod";
import { consequenceSchema } from "./consequence.schema";
import { createDisruptionsSchemaRefined } from "./create-disruption.schema";

export const disruptionSchema = createDisruptionsSchemaRefined.and(
    z.object({
        consequences: z.array(consequenceSchema).optional(),
    }),
);

export type Disruption = z.infer<typeof disruptionSchema>;
