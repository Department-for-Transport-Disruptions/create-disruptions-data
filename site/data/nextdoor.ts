import { SocialMediaPostStatus } from "@create-disruptions-data/shared-ts/enums";
import { getNextdoorAuthHeader } from "@create-disruptions-data/shared-ts/utils";
import { getParameter, putParameter } from "@create-disruptions-data/shared-ts/utils/ssm";
import { addSocialAccountToOrg, getOrgSocialAccounts, upsertSocialMediaPost } from "./dynamo";
import { NEXTDOOR_AUTH_URL, NEXTDOOR_URL } from "../constants";
import { NotAnAgencyAccountError } from "../errors";
import {
    NextdoorAgencyBoundaries,
    nextdoorAgencyBoundaryResultSchema,
    nextdoorMeSchema,
    nextdoorTokenSchema,
} from "../schemas/nextdoor.schema";
import { SocialMediaAccount } from "../schemas/social-media-accounts.schema";
import { NextdoorPost } from "../schemas/social-media.schema";
import logger from "../utils/logger";

export const nextdoorRedirectUri = `${process.env.DOMAIN_NAME as string}/api/nextdoor-callback`;

export const getNextdoorSsmKey = (orgId: string, nextdoorUserId: string) =>
    `/social/nextdoor/${orgId}/${nextdoorUserId}-refresh_token`;

export const getNextdoorAccessToken = async (orgId: string, nextdoorUserId: string) => {
    const refreshTokenParam = await getParameter(getNextdoorSsmKey(orgId, nextdoorUserId), logger, true);

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

    if (!userDetails.agencyId) {
        throw new NotAnAgencyAccountError();
    }

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
        putParameter(
            getNextdoorSsmKey(createdByOperatorOrgId ? createdByOperatorOrgId : orgId, userDetails.id),
            tokenResult.accessToken,
            "SecureString",
            true,
            logger,
        ),
    ]);
};

export const getNextdoorClientIdAndSecret = async () => {
    const [nextdoorClientIdKeyParam, nextdoorClientSecretParam] = await Promise.all([
        getParameter("/social/nextdoor/client_id", logger),
        getParameter("/social/nextdoor/client_secret", logger),
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

export const getNextdoorAgencyBoundaries = async (
    orgId: string,
    nextdoorUserId: string,
): Promise<NextdoorAgencyBoundaries> => {
    const accessToken = await getNextdoorAccessToken(orgId, nextdoorUserId);
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
                ...(socialMediaPost.nextdoorAgencyBoundaries
                    ? { group_ids: socialMediaPost.nextdoorAgencyBoundaries.map((boundary) => boundary.groupId) }
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
