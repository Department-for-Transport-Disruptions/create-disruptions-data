import { z } from "zod";
import { consequenceSchema } from "./consequence.schema";
import { createDisruptionsSchemaRefined } from "./create-disruption.schema";
import { typeOfConsequenceSchema } from "./type-of-consequence.schema";

export const disruptionSchema = z.object({
    disruptionInfo: createDisruptionsSchemaRefined,
    consequences: z.array(typeOfConsequenceSchema.or(consequenceSchema)).optional(),
});

export type Disruption = z.infer<typeof disruptionSchema>;
