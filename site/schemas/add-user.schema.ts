import { UserGroups } from "@create-disruptions-data/shared-ts/enums";
import { z } from "zod";
import { operatorSchema } from "./consequence.schema";
import { setZodDefaultError } from "../utils";

export const addUserSchema = z.object({
    givenName: z.string(setZodDefaultError("Enter a first name")).min(1),
    familyName: z.string(setZodDefaultError("Enter a last name")).min(1),
    email: z.string(setZodDefaultError("Enter a valid email address")).email(),
    orgId: z.string().uuid(),
    group: z.nativeEnum(UserGroups, setZodDefaultError("Select which account is required")),
});

export const editUserSchema = addUserSchema.and(
    z.object({ username: z.string(), initialGroup: z.nativeEnum(UserGroups) }),
);

export type AddUserSchema = z.infer<typeof addUserSchema>;
export type EditUserSchema = z.infer<typeof editUserSchema>;

export const addUsersSchema = z.array(addUserSchema);
export type AddUsersSchema = z.infer<typeof addUsersSchema>;

export const addOperatorSchema = z.object({
    operatorName: z.string(setZodDefaultError("Enter a first name")).min(1),
    nocCodes: z.array(operatorSchema),
    orgId: z.string().uuid(),
});

export type AddOperatorSchema = z.infer<typeof addOperatorSchema>;
