import { SocialMediaPostStatus } from "@create-disruptions-data/shared-ts/enums";
import { addSocialAccountToOrg, getOrgSocialAccounts, upsertSocialMediaPost } from "./dynamo";
import { getParameter, putParameter } from "./ssm";
import { NEXTDOOR_AUTH_URL, NEXTDOOR_URL } from "../constants";
import {
    GroupIds,
    nextdoorAgencyBoundaryResultSchema,
    nextdoorMeSchema,
    nextdoorTokenSchema,
} from "../schemas/nextdoor.schema";
import { SocialMediaAccount } from "../schemas/social-media-accounts.schema";
import { NextdoorPost } from "../schemas/social-media.schema";
import logger from "../utils/logger";

export const nextdoorRedirectUri = `${process.env.DOMAIN_NAME as string}/api/nextdoor-callback`;

export const getNextdoorAuthHeader = async () => {
    const { nextdoorClientId, nextdoorClientSecret } = await getNextdoorClientIdAndSecret();
    const key = `${nextdoorClientId}:${nextdoorClientSecret}`;

    return `Basic ${Buffer.from(key).toString("base64")}`;
};

export const getNextdoorSsmKey = (orgId: string) => `/social/${orgId}/nextdoor/refresh_token`;

export const getNextdoorAccessToken = async (orgId: string) => {
    const refreshTokenParam = await getParameter(getNextdoorSsmKey(orgId), true);

    if (!refreshTokenParam.Parameter?.Value) {
        throw new Error("Refresh token not found");
    }

    const refreshToken = refreshTokenParam.Parameter.Value;

    return refreshToken;
};

export const addNextdoorAccount = async (
    code: string,
    orgId: string,
    addedBy: string,
    createdByOperatorOrgId?: string | null,
) => {
    const authHeader = await getNextdoorAuthHeader();

    const tokenResponse = await fetch(`${NEXTDOOR_AUTH_URL}v2/token`, {
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
        const message = `An error has occurred whilst authenticating Nextdoor user: ${tokenResponse.status}`;
        throw new Error(message);
    }

    const tokenResult = nextdoorTokenSchema.parse(await tokenResponse.json());

    const userDetailsResponse = await fetch(`${NEXTDOOR_URL}external/api/partner/v1/me/`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${tokenResult.accessToken}`,
            Accept: "application/json",
        },
    });

    if (!userDetailsResponse.ok) {
        const message = `An error has occurred retrieving account information: ${userDetailsResponse.status}`;
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
        putParameter(getNextdoorSsmKey(orgId), tokenResult.accessToken, "SecureString", true),
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
    const url = `https://www.nextdoor.com/v3/authorize/?scope=openid%20post:write%20post:read%20agency.boundary:read%20profile:read&client_id=${nextdoorClientId}&redirect_uri=${nextdoorRedirectUri}`;

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

export const getNextdoorGroupIds = async (orgId: string): Promise<GroupIds> => {
    const accessToken = await getNextdoorAccessToken(orgId);
    const agencyBoundaryResponse = await fetch(`${NEXTDOOR_URL}external/api/partner/v1/agency/boundary/`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
        },
    });

    if (!agencyBoundaryResponse.ok) {
        const message = `An error has occurred retrieving agency boundary results: ${agencyBoundaryResponse.status}`;
        throw new Error(message);
    }

    const boundaryDetails = nextdoorAgencyBoundaryResultSchema.parse(await agencyBoundaryResponse.json());

    return boundaryDetails;
};

export const publishToNextdoor = async (
    socialMediaPost: NextdoorPost,
    orgId: string,
    isUserStaff: boolean,
    canPublish: boolean,
    accessToken: string,
) => {
    try {
        if (!accessToken) {
            throw new Error("Not authenticated to Nextdoor");
        }

        const createSocialPostResponse = await fetch(`${NEXTDOOR_URL}external/api/partner/v1/post/create/`, {
            method: "POST",
            body: JSON.stringify({
                body_text: socialMediaPost.messageContent,
                ...(socialMediaPost.groupIds
                    ? { group_ids: socialMediaPost.groupIds.map((group) => group.groupId) }
                    : {}),
            }),
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!createSocialPostResponse.ok) {
            logger.error(await createSocialPostResponse.text());
            throw new Error("Failed to create social media post");
        }

        await upsertSocialMediaPost(
            {
                ...socialMediaPost,
                status: SocialMediaPostStatus.successful,
            },
            orgId,
            isUserStaff,
            canPublish,
            undefined,
        );
    } catch (e) {
        logger.error(e);
        await upsertSocialMediaPost(
            {
                ...socialMediaPost,
                status: SocialMediaPostStatus.rejected,
                publishStatus: "PUBLISHED",
            },
            orgId,
            isUserStaff,
            canPublish,
        );
    }
};
