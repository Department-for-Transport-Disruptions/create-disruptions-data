import { UserGroups } from "@create-disruptions-data/shared-ts/enums";
import { z } from "zod";

export const user = z
    .object({
        UserAttributes: z.array(
            z.object({
                Name: z.string(),
                Value: z.string(),
            }),
        ),
        Username: z.string(),
        UserStatus: z.string(),
        group: z.nativeEnum(UserGroups),
    })
    .transform((item) =>
        item.UserAttributes.reduce(
            (p, c) => ({
                ...p,
                givenName: c.Name === "given_name" ? c.Value : p.givenName,
                familyName: c.Name === "family_name" ? c.Value : p.familyName,
                email: c.Name === "email" ? c.Value : p.email,
                orgId: c.Name === "custom:orgId" ? c.Value : p.orgId,
            }),
            {
                userStatus: item.UserStatus,
                group: item.group,
                username: item.Username,
                givenName: "N/A",
                familyName: "N/A",
                email: "N/A",
                orgId: "N/A",
            },
        ),
    );

export const deleteUser = z
    .object({
        UserAttributes: z.array(
            z.object({
                Name: z.string(),
                Value: z.string(),
            }),
        ),
        Username: z.string(),
    })
    .transform((item) =>
        item.UserAttributes.reduce(
            (p, c) => ({
                ...p,
                organisation: c.Name === "custom:orgId" ? c.Value : p.organisation,
            }),
            {
                organisation: "N/A",
                username: item.Username,
            },
        ),
    );

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
            Username: z.string(),
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
                    username: item.Username,
                    givenName: "N/A",
                    familyName: "N/A",
                    email: "N/A",
                    organisation: "N/A",
                },
            ),
        ),
);

export type UserManagementSchema = z.infer<typeof userManagementSchema>;

export const adminSchema = z.array(
    z
        .object({
            Attributes: z.array(
                z.object({
                    Name: z.string(),
                    Value: z.string(),
                }),
            ),
            UserStatus: z.string(),
            Username: z.string(),
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
                    username: item.Username,
                    givenName: "N/A",
                    familyName: "N/A",
                    email: "N/A",
                    organisation: "N/A",
                },
            ),
        ),
);

export type AdminSchema = z.infer<typeof adminSchema>;
