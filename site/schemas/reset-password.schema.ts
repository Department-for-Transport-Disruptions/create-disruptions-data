import { z } from "zod";
import { setZodDefaultError } from "../utils";
import { passwordSchema } from "./register.schema";

export const resetPasswordSchema = z.object({
    newPassword: passwordSchema,
    confirmPassword: z.string(),
    email: z.string().email({ message: "Enter a valid email address" }),
    key: z.string(setZodDefaultError("Invalid reset password link")).min(1, { message: "Invalid reset password link" }),
});

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

export const resetPasswordSchemaRefined = resetPasswordSchema.refine((val) => val.newPassword === val.confirmPassword, {
    path: ["confirmPassword"],
    message: "You must type the same password each time",
});
