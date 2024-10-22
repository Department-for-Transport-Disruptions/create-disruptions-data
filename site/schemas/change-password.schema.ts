import { z } from "zod";
import { setZodDefaultError } from "../utils";
import { passwordSchema } from "./register.schema";

export const changePasswordSchema = z.object({
    currentPassword: z.string(setZodDefaultError("Enter your current password")).min(1),
    newPassword: passwordSchema,
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
