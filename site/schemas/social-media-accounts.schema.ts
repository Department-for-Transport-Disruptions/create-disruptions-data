import { z } from "zod";

export const hootsuiteProfileSchema = z.object({ type: z.string(), id: z.string(), socialNetworkId: z.string() });

const accountType = z.enum(["Twitter", "Hootsuite", "Nextdoor"]);

export const dynamoSocialAccountSchema = z.object({
    id: z.string(),
    display: z.string(),
    accountType,
    addedBy: z.string(),
    createdByOperatorOrgId: z.string().uuid().optional(),
});

export const socialMediaAccountSchema = dynamoSocialAccountSchema.and(
    z.object({
        display: z.string(),
        expiresIn: z.string().default("Never"),
        hootsuiteProfiles: z.array(hootsuiteProfileSchema).optional(),
        groupIds: z.array(z.number()).optional(),
    }),
);

export type SocialMediaAccount = z.infer<typeof socialMediaAccountSchema>;

export type HootsuiteProfile = z.infer<typeof hootsuiteProfileSchema>;
