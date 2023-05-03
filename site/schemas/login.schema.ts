import { z } from "zod";
import { setZodDefaultError } from "../utils";

export const loginSchema = z.object({
    email: z.string(setZodDefaultError("Enter an email address")).min(1),
    password: z
        .string(setZodDefaultError("Enter a password"))
        .min(1)
        .refine((val) => val.length >= 8, {
            path: ["password"],
            message: "Enter minimum of 8 characters",
        }),
});

export type LoginProps = z.infer<typeof loginSchema>;
