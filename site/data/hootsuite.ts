import { SocialMediaPostStatus } from "@create-disruptions-data/shared-ts/enums";
import { NextPageContext } from "next";
import { randomUUID } from "crypto";
import { addSocialAccountToOrg, getOrgSocialAccounts, upsertSocialMediaPost } from "./dynamo";
import { getObject } from "./s3";
import { getParameter, putParameter } from "./ssm";
import { COOKIES_HOOTSUITE_STATE, HOOTSUITE_URL } from "../constants";
import {
    HootsuiteMedia,
    hootsuiteMeSchema,
    hootsuiteMediaSchema,
    hootsuiteMediaStatusSchema,
    hootsuiteSocialProfilesSchema,
    hootsuiteTokenSchema,
} from "../schemas/hootsuite.schema";
import { SocialMediaAccount } from "../schemas/social-media-accounts.schema";
import { HootsuitePost, SocialMediaImage } from "../schemas/social-media.schema";
import { notEmpty } from "../utils";
import { delay, setCookieOnResponseObject } from "../utils/apiUtils";
import { formatAndDefaultDateTime, formatDate } from "../utils/dates";
import logger from "../utils/logger";

let hootsuiteClientId: string | null = null;
let hootsuiteClientSecret: string | null = null;

const getHootsuiteClientIdAndSecret = async () => {
    if (hootsuiteClientId && hootsuiteClientSecret) {
        return {
            hootsuiteClientId,
            hootsuiteClientSecret,
        };
    }

    const [hootsuiteClientIdParam, hootsuiteClientSecretParam] = await Promise.all([
        getParameter(`/social/hootsuite/client_id`),
        getParameter(`/social/hootsuite/client_secret`),
    ]);

    hootsuiteClientId = hootsuiteClientIdParam.Parameter?.Value ?? "";
    hootsuiteClientSecret = hootsuiteClientSecretParam.Parameter?.Value ?? "";

    return {
        hootsuiteClientId,
        hootsuiteClientSecret,
    };
};

export const hootsuiteRedirectUri = `${process.env.DOMAIN_NAME as string}/api/hootsuite-callback`;

const getSsmKey = (orgId: string, id: string) => `/social/${orgId}/hootsuite/${id}/refresh_token`;

export const addHootsuiteAccount = async (
    code: string,
    orgId: string,
    addedBy: string,
    createdByOperatorOrgId?: string | null,
) => {
    const authHeader = await getHootsuiteAuthHeader();

    const tokenResponse = await fetch(`${HOOTSUITE_URL}oauth2/token`, {
        method: "POST",
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: hootsuiteRedirectUri,
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

    const tokenResult = hootsuiteTokenSchema.parse(await tokenResponse.json());

    const userDetailsResponse = await fetch(`${HOOTSUITE_URL}v1/me`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${tokenResult.accessToken}`,
        },
    });

    if (!userDetailsResponse.ok) {
        const message = `An error has occurred: ${userDetailsResponse.status}`;
        throw new Error(message);
    }

    const userDetails = hootsuiteMeSchema.parse(await userDetailsResponse.json());

    await Promise.all([
        addSocialAccountToOrg(orgId, userDetails.id, userDetails.email, addedBy, "Hootsuite", createdByOperatorOrgId),
        putParameter(getSsmKey(orgId, userDetails.id), tokenResult.refreshToken, "SecureString", true),
    ]);
};

export const refreshHootsuiteToken = async (
    refreshToken: string,
    authHeader: string,
    orgId: string,
    socialId: string,
) => {
    const resp = await fetch(`${HOOTSUITE_URL}oauth2/token`, {
        method: "POST",
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken ?? "",
        }),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: authHeader,
        },
    });

    if (!resp.ok) {
        throw new Error("Unable to retrieve tokens for hootsuite");
    }

    const parsedTokens = hootsuiteTokenSchema.parse(await resp.json());

    await putParameter(getSsmKey(orgId, socialId), parsedTokens.refreshToken, "SecureString", true);

    return parsedTokens.accessToken;
};

const getHootsuiteUserDetails = async (accessToken: string) => {
    const userDetailsResponse = await fetch(`${HOOTSUITE_URL}v1/me`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!userDetailsResponse.ok) {
        throw new Error("Not authorised to retrieve hootsuite user details");
    }

    return hootsuiteMeSchema.parse(await userDetailsResponse.json());
};

const getHootsuiteProfiles = async (hootsuiteAccessToken: string) => {
    const socialProfilesResponse = await fetch(`${HOOTSUITE_URL}v1/socialProfiles`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${hootsuiteAccessToken}`,
        },
    });

    if (!socialProfilesResponse.ok) {
        throw new Error("Not authorised to retrieve hootsuite profiles");
    }

    return hootsuiteSocialProfilesSchema.parse(await socialProfilesResponse.json());
};

export const getHootsuiteAuthHeader = async () => {
    const { hootsuiteClientId, hootsuiteClientSecret } = await getHootsuiteClientIdAndSecret();
    const key = `${hootsuiteClientId}:${hootsuiteClientSecret}`;

    return `Basic ${Buffer.from(key).toString("base64")}`;
};

export const getAccessToken = async (orgId: string, socialId: string) => {
    const refreshTokenParam = await getParameter(getSsmKey(orgId, socialId), true);

    if (!refreshTokenParam.Parameter?.Value) {
        throw new Error("Refresh token not found");
    }

    const refreshToken = refreshTokenParam.Parameter.Value;
    const authHeader = await getHootsuiteAuthHeader();

    return refreshHootsuiteToken(refreshToken, authHeader, orgId, socialId);
};

export const getHootsuiteDetails = async (
    orgId: string,
    socialId: string,
    addedBy: string,
    createdByOperatorOrgId?: string,
): Promise<SocialMediaAccount | null> => {
    try {
        const hootsuiteAccessToken = await getAccessToken(orgId, socialId);

        const [hootsuiteUserDetails, hootsuiteProfiles] = await Promise.all([
            getHootsuiteUserDetails(hootsuiteAccessToken),
            getHootsuiteProfiles(hootsuiteAccessToken),
        ]);

        return {
            accountType: "Hootsuite",
            addedBy,
            display: hootsuiteUserDetails.email,
            id: socialId,
            expiresIn: "Never",
            hootsuiteProfiles,
            ...(createdByOperatorOrgId ? { createdByOperatorOrgId: createdByOperatorOrgId } : {}),
        };
    } catch (e) {
        logger.error(e);
        return null;
    }
};

export const getHootsuiteAccountList = async (orgId: string, operatorOrgId?: string): Promise<SocialMediaAccount[]> => {
    const socialAccounts = await getOrgSocialAccounts(orgId);

    const hootsuiteAccounts = socialAccounts.filter((account) => account.accountType === "Hootsuite");

    const hootsuiteDetail = await Promise.all(
        hootsuiteAccounts.map(async (account) =>
            getHootsuiteDetails(orgId, account.id, account.addedBy, account.createdByOperatorOrgId),
        ),
    );

    return hootsuiteAccounts
        .map((account) => {
            const detail = hootsuiteDetail.find((acc) => acc?.id === account.id);

            if (detail) {
                return detail;
            }

            const defaultAccount: SocialMediaAccount = {
                accountType: "Hootsuite",
                addedBy: account.addedBy,
                display: account.display,
                expiresIn: "N/A",
                id: account.id,
                createdByOperatorOrgId: account.createdByOperatorOrgId,
            };

            return defaultAccount;
        })
        .filter((item) =>
            operatorOrgId ? operatorOrgId === item.createdByOperatorOrgId : !item.createdByOperatorOrgId,
        )
        .filter(notEmpty);
};

export const getHootsuiteAuthUrl = async (ctx: NextPageContext) => {
    const state = randomUUID();
    const { hootsuiteClientId } = await getHootsuiteClientIdAndSecret();

    if (ctx.res) {
        setCookieOnResponseObject(COOKIES_HOOTSUITE_STATE, state, ctx.res);
    }

    return `${HOOTSUITE_URL}oauth2/auth?response_type=code&scope=offline&redirect_uri=${hootsuiteRedirectUri}&client_id=${hootsuiteClientId}&state=${state}`;
};

const waitForImage = async (accessToken: string, imageId: string) => {
    for (let i = 0; i < 5; i++) {
        const imageStatus = await fetch(`${HOOTSUITE_URL}v1/media/${imageId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!imageStatus.ok) {
            throw new Error("Cannot retrieve media details from hootsuite");
        }

        const parsedImageState = hootsuiteMediaStatusSchema.safeParse(await imageStatus.json());

        if (!parsedImageState.success) {
            throw new Error("Could not parse data from hootsuite media by id endpoint");
        }

        const imageState = parsedImageState.data;

        if (imageState.state === "READY") {
            break;
        } else {
            await delay(1000);
        }
    }
};

export const processHootsuiteImage = async (image: SocialMediaImage, accessToken: string) => {
    const responseImage = await fetch(`${HOOTSUITE_URL}v1/media`, {
        method: "POST",
        body: JSON.stringify({
            sizeBytes: image.size,
            mimeType: image.mimetype,
        }),
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!responseImage.ok) {
        logger.error(await responseImage.text());
        throw new Error("Failed to request image upload to hootsuite");
    }

    const parsedImageData = hootsuiteMediaSchema.safeParse(await responseImage.json());

    if (!parsedImageData.success) {
        throw new Error("Could not parse data from hootsuite media endpoint");
    }

    const parsedImage = parsedImageData.data;

    const imageContents = await getObject(process.env.IMAGE_BUCKET_NAME || "", image.key, image.originalFilename);

    if (!imageContents) {
        throw new Error("Could not read image file");
    }

    const uploadResponse = await fetch(parsedImage.uploadUrl, {
        method: "PUT",
        headers: {
            "Content-Type": image.mimetype,
        },
        body: Buffer.from(imageContents),
    });

    if (!uploadResponse.ok) {
        logger.error(await uploadResponse.text());
        throw new Error("Cannot upload image to hootsuite");
    }

    await waitForImage(accessToken, parsedImage.id);

    return parsedImage;
};

export const publishToHootsuite = async (
    socialMediaPost: HootsuitePost,
    orgId: string,
    isUserStaff: boolean,
    canPublish: boolean,
    accessToken: string,
) => {
    try {
        if (!accessToken) {
            throw new Error("Not authenticated to Hootsuite");
        }
        let image: HootsuiteMedia | null = null;

        if (socialMediaPost.image) {
            image = await processHootsuiteImage(socialMediaPost.image, accessToken);
        }

        const formattedDate =
            socialMediaPost.publishDate && socialMediaPost.publishTime
                ? formatDate(socialMediaPost.publishDate, socialMediaPost.publishTime)
                : formatAndDefaultDateTime();

        const createSocialPostResponse = await fetch(`${HOOTSUITE_URL}v1/messages`, {
            method: "POST",
            body: JSON.stringify({
                text: socialMediaPost.messageContent,
                scheduledSendTime: formattedDate,
                socialProfileIds: [socialMediaPost.hootsuiteProfile],
                ...(image ? { media: [{ id: image.id }] } : {}),
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
