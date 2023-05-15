import { UserGroups } from "@create-disruptions-data/shared-ts/enums";
import { z } from "zod";

export const userManagementSchema = z.array(
    z
        .object({
            Attributes: z.array(
                z.object({
                    Name: z.string(),
                    Value: z.string(),
                }),
            ),
            UserStatus: z.string(),
            GroupName: z.nativeEnum(UserGroups),
        })
        .transform((item) =>
            item.Attributes.reduce(
                (p, c) => ({
                    ...p,
                    givenName: c.Name === "given_name" ? c.Value : p.givenName,
                    familyName: c.Name === "family_name" ? c.Value : p.familyName,
                    email: c.Name === "email" ? c.Value : p.email,
                    organisation: c.Name === "custom:orgId" ? c.Value : p.organisation,
                }),
                {
                    userStatus: item.UserStatus,
                    group: item.GroupName,
                    givenName: "N/A",
                    familyName: "N/A",
                    email: "N/A",
                    organisation: "N/A",
                },
            ),
        ),
);

export type UserManagementSchema = z.infer<typeof userManagementSchema>;
