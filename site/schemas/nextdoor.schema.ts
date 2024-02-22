import { z } from "zod";

export const nextdoorAgencyBoundaryResultSchema = z.array(
    z.object({
        name: z.string(),
        group_id: z.number(),
        geometry: z.string(),
    }),
);

export const nextdoorAgencyBoundarySchema = z.object({
    has_next_page: z.boolean().default(false),
    result: nextdoorAgencyBoundaryResultSchema,
});

export const nextdoorGroupIdsSchema = z.string();

export const nextdoorAgencyPostSchema = z.object({
    body_text: z.string().max(8192),
    media_attachments: z.array(z.string()),
    group_ids: z.array(nextdoorGroupIdsSchema),
});

export type GroupId = z.infer<typeof nextdoorGroupIdsSchema>;
