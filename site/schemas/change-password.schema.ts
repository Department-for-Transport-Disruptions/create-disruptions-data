import { z } from "zod";
import { setZodDefaultError } from "../utils";

export const changePasswordSchema = z.object({
    currentPassword: z.string(setZodDefaultError("Enter your current password")).min(1),
    newPassword: z.string(setZodDefaultError("Enter your new password")).min(1),
    confirmPassword: z.string(setZodDefaultError("Enter your new password again")).min(1),
});

export type ChangePasswordProps = z.infer<typeof changePasswordSchema>;

export const changePasswordSchemaRefined = changePasswordSchema.refine(
    (val) => val.newPassword === val.confirmPassword,
    {
        path: ["confirmPassword"],
        message: "You must type the same password each time",
    },
);
