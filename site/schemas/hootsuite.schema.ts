import { z } from "zod";
import { hootsuiteProfileSchema } from "./social-media-accounts.schema";

export const hootsuiteTokenSchema = z
    .object({
        refresh_token: z.string(),
        access_token: z.string(),
    })
    .transform((res) => ({
        accessToken: res.access_token,
        refreshToken: res.refresh_token,
    }));

export const hootsuiteMeSchema = z
    .object({
        data: z.object({
            id: z.string(),
            email: z.string(),
            fullName: z.string(),
        }),
    })
    .transform((res) => res.data);

export const hootsuiteSocialProfilesSchema = z
    .object({
        data: z.array(hootsuiteProfileSchema),
    })
    .transform((res) => res.data);

export const hootsuiteMediaSchema = z
    .object({
        data: z.object({
            id: z.string(),
            uploadUrl: z.string(),
            uploadUrlDurationSeconds: z.number(),
        }),
    })
    .transform((res) => res.data);

export type HootsuiteMedia = z.infer<typeof hootsuiteMediaSchema>;

export const hootsuiteMediaStatusSchema = z
    .object({
        data: z.object({
            id: z.string(),
            state: z.string(),
            downloadUrl: z.string().or(z.null()),
            downloadUrlDurationSeconds: z.number().or(z.null()),
        }),
    })
    .transform((res) => res.data);
