import { getOrgSocialAccounts } from "./dynamo";
import { SocialMediaAccount } from "../schemas/social-media-accounts.schema";

export const getNextdoorAuthUrl = () => {
    return "";
};

export const getNextdoorAccountList = async (orgId: string, operatorOrgId?: string): Promise<SocialMediaAccount[]> => {
    const socialAccounts = await getOrgSocialAccounts(orgId);

    const nextdoorDetail = socialAccounts
        .filter((account) => account.accountType === "Nextdoor")
        .map((account) => ({
            ...account,
            expiresIn: "Never",
        }))
        .filter((item) =>
            operatorOrgId ? operatorOrgId === item.createdByOperatorOrgId : !item.createdByOperatorOrgId,
        );

    return nextdoorDetail;
};

export const getNextdoorGroupIds = (): number[] => [1, 2];
