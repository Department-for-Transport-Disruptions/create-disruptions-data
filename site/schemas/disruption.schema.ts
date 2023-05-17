import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { z } from "zod";
import { consequenceSchema } from "./consequence.schema";
import { createDisruptionsSchemaRefined } from "./create-disruption.schema";

export const disruptionSchema = createDisruptionsSchemaRefined.and(
    z.object({
        consequences: z.array(consequenceSchema).optional(),
        publishStatus: z.nativeEnum(PublishStatus).default(PublishStatus.draft),
    }),
);

export type Disruption = z.infer<typeof disruptionSchema>;
