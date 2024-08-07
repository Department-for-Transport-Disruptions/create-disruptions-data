import { UserGroups } from "@create-disruptions-data/shared-ts/enums";
import { zodUuid } from "@create-disruptions-data/shared-ts/utils/zod";
import { z } from "zod";
import { getOrganisationInfoById } from "../data/dynamo";
import { defaultModes } from "./organisation.schema";

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
            group: item["cognito:groups"],
            name: item.given_name && item.family_name ? `${item.given_name} ${item.family_name}` : item.email,
            operatorOrgId: item["custom:operatorOrgId"] ?? null,
            isSystemAdmin,
            isOrgAdmin,
            isOrgPublisher,
            isOrgStaff,
            isOperatorUser,
        };
    });

export const sessionSchemaWithOrgDetail = sessionSchema.transform(async (item) => {
    const orgDetail = await getOrganisationInfoById(item.orgId);

    return {
        ...item,
        orgName: orgDetail?.name ?? "",
        adminAreaCodes: orgDetail?.adminAreaCodes ?? [],
        mode: orgDetail?.mode && !item.isOperatorUser ? orgDetail.mode : defaultModes,
        showUnderground:
            (orgDetail?.adminAreaCodes.includes("147") && orgDetail?.adminAreaCodes.includes("082")) ?? false,
    };
});

export type Session = z.infer<typeof sessionSchema>;
export type SessionWithOrgDetail = z.infer<typeof sessionSchemaWithOrgDetail>;
