import { UserType } from "@aws-sdk/client-cognito-identity-provider";
export declare const getAllUsersInGroup: (groupName: string, nextToken?: string) => Promise<UserType[]>;
export declare const getAllUsersEmailsInGroups: (groupNames: string[], orgIds: string[]) => Promise<{
    email: string;
    orgId: string;
}[]>;
export declare const getUsersByAttributeByOrgIds: (attributeToHave: string, attributeToGet: string, attributeToHaveValue: string, orgIdsAndAdminAreaCodes: {
    [key: string]: string[];
}) => Promise<{
    [key: string]: {
        emails: string[];
        adminAreaCodes: string[];
    };
} | null>;
