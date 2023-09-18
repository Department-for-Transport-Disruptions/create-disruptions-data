import { z } from "zod";

export const organisationsSchema = z.array(
    z.object({
        PK: z.string(),
        name: z.string(),
        adminAreaCodes: z.array(z.string()),
    }),
);
export type Organisations = z.infer<typeof organisationsSchema>;
