import { UserGroups } from "@create-disruptions-data/shared-ts/enums";
import { z } from "zod";
import { subOrganisationSchema } from "./organisation.schema";
import { setZodDefaultError } from "../utils";

export const addUserSchema = z.object({
    givenName: z.string(setZodDefaultError("Enter a first name")).min(1),
    familyName: z.string(setZodDefaultError("Enter a last name")).min(1),
    email: z.string(setZodDefaultError("Enter a valid email address")).email(),
    orgId: z.string().uuid(),
    group: z.nativeEnum(UserGroups, setZodDefaultError("Select which account is required")),
    operatorOrg: subOrganisationSchema.optional().nullable(),
});

export const addUserSchemaRefined = addUserSchema.refine(
    (input) => {
        return !(input.group === UserGroups.operators && !input.operatorOrg);
    },
    { path: ["operatorOrg"], message: "Select at least one operator" },
);

export const editUserSchema = addUserSchemaRefined.and(
    z.object({ username: z.string(), initialGroup: z.nativeEnum(UserGroups) }),
);

export type AddUserSchema = z.infer<typeof addUserSchema>;
export type EditUserSchema = z.infer<typeof editUserSchema>;

export const addUsersSchema = z.array(addUserSchema);
export type AddUsersSchema = z.infer<typeof addUsersSchema>;
