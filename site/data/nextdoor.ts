import { addSocialAccountToOrg, getOrgSocialAccounts } from "./dynamo";
import { getParameter, putParameter } from "./ssm";
import { NEXTDOOR_URL } from "../constants";
import { nextdoorMeSchema, nextdoorTokenSchema } from "../schemas/nextdoor.schema";
import { SocialMediaAccount } from "../schemas/social-media-accounts.schema";

export const nextdoorRedirectUri = `${process.env.DOMAIN_NAME as string}/api/nextdoor-callback`;

export const getNextdoorAuthHeader = async () => {
    const { nextdoorClientId, nextdoorClientSecret } = await getNextdoorClientIdAndSecret();
    const key = `${nextdoorClientId}:${nextdoorClientSecret}`;

    return `Basic ${Buffer.from(key).toString("base64")}`;
};

export const getNextdoorSsmKey = (orgId: string, id: string) => `/social/${orgId}/nextdoor/${id}/refresh_token`;

export const addNextdoorAccount = async (
    code: string,
    orgId: string,
    addedBy: string,
    createdByOperatorOrgId?: string | null,
) => {
    const authHeader = await getNextdoorAuthHeader();

    const tokenResponse = await fetch(`${NEXTDOOR_URL}v2/token`, {
        method: "POST",
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: nextdoorRedirectUri,
        }),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: authHeader,
        },
    });

    if (!tokenResponse.ok) {
        const message = `An error has occurred: ${tokenResponse.status}`;
        throw new Error(message);
    }

    const tokenResult = nextdoorTokenSchema.parse(await tokenResponse.json());

    const userDetailsResponse = await fetch(`${NEXTDOOR_URL}external/api/partner/v1/me/`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${tokenResult.accessToken}`,
        },
    });

    if (!userDetailsResponse.ok) {
        const message = `An error has occurred: ${userDetailsResponse.status}`;
        throw new Error(message);
    }

    const userDetails = nextdoorMeSchema.parse(await userDetailsResponse.json());

    await Promise.all([
        addSocialAccountToOrg(
            orgId,
            userDetails.id,
            userDetails.firstname && userDetails.lastname
                ? `${userDetails.firstname} ${userDetails.lastname}`
                : `${userDetails.agencyName}`,
            addedBy,
            "Nextdoor",
            createdByOperatorOrgId,
        ),
        putParameter(getNextdoorSsmKey(orgId, userDetails.id), tokenResult.accessToken, "SecureString", true),
    ]);
};

export const getNextdoorClientIdAndSecret = async () => {
    const [nextdoorClientIdKeyParam, nextdoorClientSecretParam] = await Promise.all([
        getParameter("/social/nextdoor/client_id"),
        getParameter("/social/nextdoor/client_secret"),
    ]);

    const nextdoorClientId = nextdoorClientIdKeyParam.Parameter?.Value ?? "";
    const nextdoorClientSecret = nextdoorClientSecretParam.Parameter?.Value ?? "";

    return { nextdoorClientId, nextdoorClientSecret };
};

export const getNextdoorAuthUrl = async () => {
    const { nextdoorClientId } = await getNextdoorClientIdAndSecret();
    const url = `https://www.nextdoor.com/v3/authorize/?scope=openid%20post:write%20post:read%20agency.boundary%20profile:read&client_id=${nextdoorClientId}&redirect_uri=${nextdoorRedirectUri}`;

    return url;
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
