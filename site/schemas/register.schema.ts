import { z } from "zod";
import { MIN_PASSWORD_LENGTH } from "../constants";
import { setZodDefaultError } from "../utils";

export const passwordSchema = z
    .string(setZodDefaultError("Enter a password"))
    .min(MIN_PASSWORD_LENGTH, { message: `Enter a minimum of ${MIN_PASSWORD_LENGTH} characters` })
    .refine((password) => /[A-Z]/.test(password), {
        message: "Password must contain at least one uppercase letter",
    })
    .refine((password) => /[a-z]/.test(password), {
        message: "Password must contain at least one lowercase letter",
    })
    .refine((password) => /[0-9]/.test(password), { message: "Password must contain at least one number" })
    .refine((password) => /[$^*.\[\]{}()?"!@#%&\/\\,><':;|_~`=+-]/.test(password), {
        message: "Password must contain at least one special character",
    });

export const registerSchema = z.object({
    email: z.string().email({ message: "Enter a valid email address" }),
    password: passwordSchema,
    confirmPassword: z.string(),
    key: z.string(setZodDefaultError("Invalid register link")).min(1, { message: "Invalid register link" }),
    organisationName: z.string().optional(),
    orgId: z.string(setZodDefaultError("Invalid organisation ID")).min(1, { message: "Invalid organisation ID" }),
});

export const registerSchemaRefined = registerSchema.refine((val) => val.password === val.confirmPassword, {
    path: ["confirmPassword"],
    message: "You must type the same password each time",
});

export type RegisterSchema = z.infer<typeof registerSchema>;
