import { z } from "zod";

export const publishSchema = z.object({
    disruptionId: z.string().uuid(),
});

export type Publish = z.infer<typeof publishSchema>;
