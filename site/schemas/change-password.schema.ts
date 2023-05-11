import { z } from "zod";
import { MIN_PASSWORD_LENGTH } from "../constants";
import { setZodDefaultError } from "../utils";

export const changePasswordSchema = z.object({
    currentPassword: z.string(setZodDefaultError("Enter your current password")).min(1),
    newPassword: z
        .string(setZodDefaultError("Enter a new password"))
        .min(MIN_PASSWORD_LENGTH, { message: `Enter a minimum of ${MIN_PASSWORD_LENGTH} characters` }),
    confirmPassword: z.string(),
});

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;

export const changePasswordSchemaRefined = changePasswordSchema.refine(
    (val) => val.newPassword === val.confirmPassword,
    {
        path: ["confirmPassword"],
        message: "You must type the same password each time",
    },
);
