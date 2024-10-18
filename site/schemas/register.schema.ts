import { z } from "zod";
import { MIN_PASSWORD_LENGTH } from "../constants";
import { setZodDefaultError } from "../utils";

const listFormat = new Intl.ListFormat("en");

export const passwordSchema = z.string(setZodDefaultError("Enter a password")).superRefine((password, ctx) => {
    const errorMessage = [];

    if (password.length < MIN_PASSWORD_LENGTH) {
        errorMessage.push(`be a minimum of ${MIN_PASSWORD_LENGTH} characters`);
    }

    if (!/[A-Z]/.test(password)) {
        errorMessage.push("contain at least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
        errorMessage.push("contain at least one lowercase letter");
    }

    if (!/[0-9]/.test(password)) {
        errorMessage.push("contain at least one number");
    }

    if (!/[$^*.\[\]{}()?"!@#%&\/\\,><':;|_~`=+-]/.test(password)) {
        errorMessage.push("contain at least one special character");
    }

    if (errorMessage.length >= 1) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Password must ${listFormat.format(errorMessage)}.`,
        });
    }
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
