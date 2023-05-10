import { z } from "zod";
import { getOrganisationInfoById } from "../data/dynamo";

export const sessionSchema = z
    .object({
        sub: z.string().uuid(),
        email: z.string().email(),
        "custom:orgId": z.string().uuid(),
        "cognito:groups": z.array(
            z.union([
                z.literal("system-admins"),
                z.literal("org-admins"),
                z.literal("org-publishers"),
                z.literal("org-staff"),
            ]),
        ),
    })
    .transform((item) => {
        const isSystemAdmin = item["cognito:groups"].includes("system-admins");
        const isOrgAdmin = isSystemAdmin || item["cognito:groups"].includes("org-admins");
        const isOrgPublisher = isSystemAdmin || isOrgAdmin || item["cognito:groups"].includes("org-publishers");
        const isOrgStaff =
            isSystemAdmin || isOrgAdmin || isOrgPublisher || item["cognito:groups"].includes("org-staff");

        return {
            username: item.sub,
            email: item.email,
            orgId: item["custom:orgId"],
            isSystemAdmin,
            isOrgAdmin,
            isOrgPublisher,
            isOrgStaff,
        };
    });

export const sessionSchemaWithOrgDetail = sessionSchema.transform(async (item) => {
    const orgDetail = await getOrganisationInfoById(item.orgId);

    return {
        ...item,
        orgName: orgDetail?.name ?? "",
        adminAreaCodes: orgDetail?.adminAreaCodes ?? [],
    };
});

export type Session = z.infer<typeof sessionSchema>;
export type SessionWithOrgDetail = z.infer<typeof sessionSchemaWithOrgDetail>;
