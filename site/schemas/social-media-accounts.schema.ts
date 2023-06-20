import { z } from "zod";

export const hootsuiteProfileSchema = z.array(
    z.object({ type: z.string(), id: z.string(), socialNetworkId: z.string() }),
);

export const socialMediaAccounts = z.array(
    z.object({
        id: z.string(),
        email: z.string(),
        accountType: z.string().default("Hootsuite"),
        addedBy: z.string(),
        expiresIn: z.string().default("Never"),
        isActive: z.boolean().optional(),
        createdDate: z.string().optional(),
        modifiedDate: z.string().optional(),
        fullName: z.string().optional(),
        companyName: z.string().optional(),
        bio: z.string().optional(),
        defaultTimezone: z.string().optional(),
        language: z.string().optional(),
        hootsuiteProfiles: hootsuiteProfileSchema,
    }),
);

export type SocialMediaAccountsSchema = z.infer<typeof socialMediaAccounts>;

export type HootsuiteProfiles = z.infer<typeof hootsuiteProfileSchema>;
