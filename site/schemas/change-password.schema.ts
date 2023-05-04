import { z } from "zod";
import { setZodDefaultError } from "../utils";

export const changePasswordSchema = z.object({
    currentPassword: z.string(setZodDefaultError("Enter your current password")).min(1),
    newPassword: z.string().min(8, {
        message: "Enter a minimum of 8 characters",
    }),
    confirmPassword: z.string(),
});

export type ChangePasswordProps = z.infer<typeof changePasswordSchema>;

export const changePasswordSchemaRefined = changePasswordSchema.refine(
    (val) => val.newPassword === val.confirmPassword,
    {
        path: ["confirmPassword"],
        message: "You must type the same password each time",
    },
);
