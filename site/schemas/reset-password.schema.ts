import { z } from "zod";
import { MIN_PASSWORD_LENGTH } from "../constants";
import { setZodDefaultError } from "../utils";

export const resetPasswordSchema = z.object({
    newPassword: z
        .string(setZodDefaultError("Enter a new password"))
        .min(MIN_PASSWORD_LENGTH, { message: `Enter a minimum of ${MIN_PASSWORD_LENGTH} characters` }),
    confirmPassword: z.string(),
    email: z.string().email({ message: "Enter a valid email address" }),
    key: z.string(setZodDefaultError("Invalid reset password link")).min(1, { message: "Invalid reset password link" }),
});

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

export const resetPasswordSchemaRefined = resetPasswordSchema.refine((val) => val.newPassword === val.confirmPassword, {
    path: ["confirmPassword"],
    message: "You must type the same password each time",
});
