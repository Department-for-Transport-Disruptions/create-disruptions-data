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
            GroupName: z.string(),
        })
        .transform((item) => {
            let givenName = "N/A";
            let familyName = "N/A";
            let email = "N/A";
            let orgId = "N/A";
            item.Attributes.forEach((val) => {
                switch (val.Name) {
                    case "given_name":
                        givenName = val.Value;
                        break;
                    case "family_name":
                        familyName = val.Value;
                        break;
                    case "email":
                        email = val.Value;
                        break;
                    case "custom:orgId":
                        orgId = val.Value;
                        break;
                    default:
                        break;
                }
            });
            return {
                givenName: givenName,
                familyName: familyName,
                email: email,
                userStatus: item.UserStatus,
                group: item.GroupName,
                organisation: orgId,
            };
        }),
);

export type UserManagementSchema = z.infer<typeof userManagementSchema>;
