import { z } from "zod";

export const forgotPasswordSchema = z.object({
    email: z.string().email({ message: "Enter an email address in the right format, name@example.com" }),
});

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
