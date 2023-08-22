import { consequenceSchema, disruptionInfoSchemaRefined } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { z } from "zod";
import { socialMediaPostSchema } from "./social-media.schema";

export const publishSchema = z.object({
    disruptionId: z.string().uuid(),
});

export const publishDisruptionSchema = disruptionInfoSchemaRefined.and(
    z.object({
        consequences: z.array(consequenceSchema).min(1, {
            message: "You must create a consequence before publishing the disruption",
        }),
        socialMediaPosts: z.array(socialMediaPostSchema).optional(),
    }),
);

export type Publish = z.infer<typeof publishSchema>;
