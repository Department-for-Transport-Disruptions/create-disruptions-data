import { z } from "zod";

export const socialMediaAccounts = z.array(
    z.object({
        accountType: z.string(),
        usernamePage: z.string(),
        addedBy: z.string(),
        expiresIn: z.string().default("Never"),
        hootsuiteProfiles: z.array(z.object({ type: z.string(), id: z.string() })),
    }),
);

export type SocialMediaAccountsSchema = z.infer<typeof socialMediaAccounts>;
