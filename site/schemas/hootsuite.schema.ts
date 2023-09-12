import { z } from "zod";

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
        data: z.array(
            z.object({
                id: z.string(),
                type: z.string(),
                socialNetworkId: z.string(),
            }),
        ),
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

export const hootsuiteMediaStatusSchema = z
    .object({
        data: z.object({
            id: z.string(),
            state: z.string(),
            downloadUrl: z.string(),
            downloadUrlDurationSeconds: z.number(),
        }),
    })
    .transform((res) => res.data);
