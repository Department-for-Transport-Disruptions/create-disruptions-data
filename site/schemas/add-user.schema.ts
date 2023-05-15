import { UserGroups } from "@create-disruptions-data/shared-ts/enums";
import { z } from "zod";
import { setZodDefaultError } from "../utils";

export const addUserSchema = z.object({
    givenName: z.string(setZodDefaultError("Enter first name")).min(1),
    familyName: z.string(setZodDefaultError("Enter last name")).min(1),
    email: z.string().email(),
    orgId: z.string().uuid(),
    group: z.nativeEnum(UserGroups),
});

export type AddUserSchema = z.infer<typeof addUserSchema>;
