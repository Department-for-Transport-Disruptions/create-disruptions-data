import { z } from "zod";
import { MIN_PASSWORD_LENGTH } from "../constants";
import { setZodDefaultError } from "../utils";

export const registerSchema = z.object({
    email: z.string().email({ message: "Enter a valid email address" }),
    password: z
        .string(setZodDefaultError("Enter a password"))
        .min(MIN_PASSWORD_LENGTH, { message: `Enter a minimum of ${MIN_PASSWORD_LENGTH} characters` }),
    confirmPassword: z.string(),
    key: z.string(setZodDefaultError("Invalid register link")).min(1, { message: "Invalid register link" }),
    organisation: z.string().optional(),
});

export const registerSchemaRefined = registerSchema.refine((val) => val.password === val.confirmPassword, {
    path: ["confirmPassword"],
    message: "You must type the same password each time",
});

export type RegisterSchema = z.infer<typeof registerSchema>;
