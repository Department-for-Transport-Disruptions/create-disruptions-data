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
    operatorNocInfo: z.array(operatorDataSchema).optional(),
});

export const addUserSchemaRefined = z
    .object({
        givenName: z.string(setZodDefaultError("Enter a first name")).min(1),
        familyName: z.string(setZodDefaultError("Enter a last name")).min(1),
        email: z.string(setZodDefaultError("Enter a valid email address")).email(),
        orgId: z.string().uuid(),
        group: z.nativeEnum(UserGroups, setZodDefaultError("Select which account is required")),
        operatorNocInfo: z.array(operatorDataSchema).optional(),
    })
    .refine(
        (input) => {
            return !(input.group === UserGroups.operators && input.operatorNocInfo?.length === 0);
        },
        { path: ["operatorNocInfo"], message: "Select at least one NOC" },
    );

export type AddUserSchema = z.infer<typeof addUserSchema>;

export const addUsersSchema = z.array(addUserSchema);
export type AddUsersSchema = z.infer<typeof addUsersSchema>;
