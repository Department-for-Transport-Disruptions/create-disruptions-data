import { SocialMediaPostStatus } from "@create-disruptions-data/shared-ts/enums";
import { getNextdoorAuthHeader } from "@create-disruptions-data/shared-ts/utils";
import { getParameter, getParametersByPath, putParameter } from "@create-disruptions-data/shared-ts/utils/ssm";
import { addSocialAccountToOrg, getOrgSocialAccounts, upsertSocialMediaPost } from "./dynamo";
import { getItem } from "./s3";
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

export const getNextdoorAccessTokens = async (orgId: string) => {
    const refreshTokenParams = await getParametersByPath(`/social/nextdoor/${orgId}`, logger, true);

    if (!refreshTokenParams.Parameters) {
        throw new Error("Refresh token not found");
    }

    const refreshTokens = refreshTokenParams.Parameters.filter(
        (token) => token.Name?.includes("refresh_token") || false,
    ).map((token) => ({
        nextdoorUserId: token.Name?.split("/")?.[4].replace("-refresh_token", "") || "",
        value: token.Value,
    }));

    return refreshTokens;
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
): Promise<{ nextdoorUserId: string; boundaries: NextdoorAgencyBoundaries }[]> => {
    const accessTokens = await getNextdoorAccessTokens(orgId);

    const agencyBoundaryResponses = await Promise.all(
        accessTokens.map(async (accessToken) => {
            let hasNextPage: boolean = true;
            let cursor: string | null = null;
            const results = [];
            const url = `${NEXTDOOR_URL}external/api/partner/v1/agency/boundary`;

            while (hasNextPage) {
                try {
                    const requestUrl: string = cursor
                        ? `${url}?after=${cursor}&enable_pagination=true`
                        : `${url}?enable_pagination=true`;

                    const response = await fetch(requestUrl, {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${accessToken.value}`,
                            Accept: "application/json",
                        },
                    });
                    if (!response.ok) {
                        hasNextPage = false;
                        const message = "An error has occurred retrieving agency boundary results";
                        throw new Error(message);
                    }
                    const responseBody = nextdoorAgencyBoundaryResultSchema.safeParse(await response.json());
                    if (!responseBody.success) {
                        hasNextPage = false;
                        throw new Error(JSON.stringify(responseBody.error));
                    }
                    results.push(...responseBody.data.result);

                    cursor = responseBody.data.cursor || null;
                    hasNextPage = responseBody.data.has_next_page || false;
                } catch (error) {
                    hasNextPage = false;
                    logger.error(error);
                    throw error;
                }
            }

            const responseWithUserId = {
                nextdoorUserId: accessToken.nextdoorUserId,
                boundaries: results,
            };
            return responseWithUserId;
        }),
    );

    return agencyBoundaryResponses || [];
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

        let url: string | null = null;

        if (socialMediaPost.image) {
            const imageContents = await getItem(
                process.env.IMAGE_BUCKET_NAME || "",
                socialMediaPost.image.key,
                socialMediaPost.image.originalFilename,
                false,
            );

            if (!imageContents) {
                throw new Error("Could not read image file");
            }

            url = imageContents;
        }

        const createSocialPostResponse = await fetch(`${NEXTDOOR_URL}external/api/partner/v1/post/create/`, {
            method: "POST",
            body: JSON.stringify({
                body_text: socialMediaPost.messageContent,
                ...(socialMediaPost.nextdoorAgencyBoundaries
                    ? { group_ids: socialMediaPost.nextdoorAgencyBoundaries.map((boundary) => boundary.groupId) }
                    : {}),
                ...(url
                    ? {
                          media_attachments: [url],
                      }
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
