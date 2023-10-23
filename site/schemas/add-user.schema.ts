import { UserGroups } from "@create-disruptions-data/shared-ts/enums";
import { z } from "zod";
import { setZodDefaultError } from "../utils";

export const operatorDataSchema = z.object({
    id: z.coerce.number(),
    nocCode: z.string(),
    operatorPublicName: z.string(),
});

export type OperatorData = z.infer<typeof operatorDataSchema>;

export const addUserSchema = z.object({
    givenName: z.string(setZodDefaultError("Enter a first name")).min(1),
    familyName: z.string(setZodDefaultError("Enter a last name")).min(1),
    email: z.string(setZodDefaultError("Enter a valid email address")).email(),
    orgId: z.string().uuid(),
    group: z.nativeEnum(UserGroups, setZodDefaultError("Select which account is required")),
    operatorNocCodes: z.array(operatorDataSchema).optional(),
});

export const addUserSchemaRefined = addUserSchema
    .refine(
        (input) => {
            return !(input.group === UserGroups.operators && input.operatorNocCodes?.length === 0);
        },
        { path: ["operatorNocCodes"], message: "Select at least one NOC" },
    )
    .refine(
        (input) => {
            return !(input.operatorNocCodes !== undefined && input.operatorNocCodes.length > 5);
        },
        { path: ["operatorNocCodes"], message: "Maximum of 5 NOC codes permitted per operator user" },
    );

export const editUserSchema = addUserSchemaRefined.and(
    z.object({ username: z.string(), initialGroup: z.nativeEnum(UserGroups) }),
);

export type AddUserSchema = z.infer<typeof addUserSchema>;
export type EditUserSchema = z.infer<typeof editUserSchema>;

export const addUsersSchema = z.array(addUserSchema);
export type AddUsersSchema = z.infer<typeof addUsersSchema>;
