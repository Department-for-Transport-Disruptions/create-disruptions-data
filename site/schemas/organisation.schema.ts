import { z } from "zod";

export const organisationSchema = z.object({
    name: z.string(),
    adminAreaCodes: z.array(z.string()),
});

export type Organisation = z.infer<typeof organisationSchema>;
