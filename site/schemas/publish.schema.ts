import {
    MAX_CONSEQUENCES,
    consequenceSchema,
    disruptionInfoSchemaRefined,
} from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { z } from "zod";
import { socialMediaPostSchema } from "./social-media.schema";

export const publishSchema = z.object({
    disruptionId: z.string().uuid(),
});

export const publishDisruptionSchema = disruptionInfoSchemaRefined.and(
    z.object({
        consequences: z
            .array(consequenceSchema)
            .min(1, {
                message: "You must create a consequence before publishing the disruption",
            })
            .max(MAX_CONSEQUENCES, {
                message: `Only up to ${MAX_CONSEQUENCES} consequences can be added`,
            }),
        socialMediaPosts: z
            .array(socialMediaPostSchema)
            .max(5, {
                message: "Only up to 5 social media posts can be added",
            })
            .nullish(),
    }),
);

export type PublishDisruption = z.infer<typeof publishDisruptionSchema>;

export type Publish = z.infer<typeof publishSchema>;
