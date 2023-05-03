import { z } from "zod";
import { setZodDefaultError } from "../utils";

export const changePasswordSchema = z.object({
    currentPassword: z
        .string(setZodDefaultError("Enter a password"))
        .min(1)
        .refine((val) => val.length >= 8, {
            path: ["currentPassword"],
            message: "Enter minimum of 8 characters",
        }),
    newPassword: z
        .string(setZodDefaultError("Enter a password"))
        .min(1)
        .refine((val) => val.length >= 8, {
            path: ["newPassword"],
            message: "Enter minimum of 8 characters",
        }),
    confirmPassword: z
        .string(setZodDefaultError("Enter a password"))
        .min(1)
        .refine((val) => val.length >= 8, {
            path: ["confirmPassword"],
            message: "Enter minimum of 8 characters",
        }),
});

export type ChangePasswordProps = z.infer<typeof changePasswordSchema>;
