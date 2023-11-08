import { UserGroups } from "@create-disruptions-data/shared-ts/enums";
import { zodUuid } from "@create-disruptions-data/shared-ts/utils/zod";
import { z } from "zod";
import { defaultModes } from "./organisation.schema";
import { getOrganisationInfoById } from "../data/dynamo";

export const sessionSchema = z
    .object({
        sub: zodUuid("Invalid uuid provided for sub"),
        email: z.string().email(),
        given_name: z.string().optional(),
        family_name: z.string().optional(),
        "custom:orgId": z.string().uuid(),
        "custom:operatorOrgId": z.string().uuid().optional(),
        "cognito:groups": z.array(z.nativeEnum(UserGroups)).optional(),
    })
    .transform((item) => {
        const isSystemAdmin = item["cognito:groups"]?.includes(UserGroups.systemAdmins) ?? false;
        const isOrgAdmin = item["cognito:groups"]?.includes(UserGroups.orgAdmins) ?? false;
        const isOrgPublisher = item["cognito:groups"]?.includes(UserGroups.orgPublishers) ?? false;
        const isOrgStaff = item["cognito:groups"]?.includes(UserGroups.orgStaff) ?? false;
        const isOperatorUser = item["cognito:groups"]?.includes(UserGroups.operators) ?? false;

        return {
            username: item.sub,
            email: item.email,
            orgId: item["custom:orgId"],
            operatorOrgId: item["custom:operatorOrgId"] || null,
            name: item.given_name && item.family_name ? `${item.given_name} ${item.family_name}` : item.email,
            isOperatorUser,
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
        mode: item.isOperatorUser ? defaultModes : orgDetail?.mode ?? defaultModes,
    };
});

export type Session = z.infer<typeof sessionSchema>;
export type SessionWithOrgDetail = z.infer<typeof sessionSchemaWithOrgDetail>;
