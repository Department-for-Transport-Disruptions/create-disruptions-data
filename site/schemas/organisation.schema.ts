import { z } from "zod";

export const organisationSchema = z.object({
    name: z.string(),
    adminAreaCodes: z.array(z.string()),
});

export type Organisation = z.infer<typeof organisationSchema>;

export const organisationsSchema = z.array(
    z
        .object({
            PK: z.object({ S: z.string() }),
            name: z.object({ S: z.string() }),
            adminAreaCodes: z.object({ L: z.array(z.object({ S: z.string() })) }),
        })
        .transform((item) => ({
            PK: item.PK.S,
            name: item.name.S,
            adminAreaCodes: item.adminAreaCodes.L.map((data) => data.S),
        })),
);
export type Organisations = z.infer<typeof organisationsSchema>;
