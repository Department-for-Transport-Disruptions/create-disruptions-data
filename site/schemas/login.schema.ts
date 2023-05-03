import { z } from "zod";
import { setZodDefaultError } from "../utils";

export const loginSchema = z.object({
    email: z.string().email({ message: "Enter a valid email address" }),
    password: z.string(setZodDefaultError("Enter a password")).min(1),
});

export type LoginProps = z.infer<typeof loginSchema>;
