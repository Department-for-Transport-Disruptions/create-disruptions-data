import { SocialMediaPostStatus } from "@create-disruptions-data/shared-ts/enums";
import { NextPageContext } from "next";
import { setCookie } from "nookies";
import { TwitterApi, UserV2Result } from "twitter-api-v2";
import { addSocialAccountToOrg, getOrgSocialAccounts, upsertSocialMediaPost } from "./dynamo";
import { getParameter, putParameter } from "./ssm";
import { COOKIES_TWITTER_CODE_VERIFIER, COOKIES_TWITTER_STATE } from "../constants";
import { SocialMediaAccount } from "../schemas/social-media-accounts.schema";
import { TwitterPost } from "../schemas/social-media.schema";
import { notEmpty } from "../utils";
import logger from "../utils/logger";

let twitterClientV2: TwitterApi | null = null;

const getTwitterClient = async () => {
    if (twitterClientV2) {
        return twitterClientV2;
    }

    const [twitterClientIdParam, twitterClientSecretParam] = await Promise.all([
        getParameter("/social/twitter/client_id"),
        getParameter("/social/twitter/client_secret"),
    ]);

    const twitterClientId = twitterClientIdParam.Parameter?.Value ?? "";
    const twitterClientSecret = twitterClientSecretParam.Parameter?.Value ?? "";

    twitterClientV2 = new TwitterApi({
        clientId: twitterClientId,
        clientSecret: twitterClientSecret,
    });

    return twitterClientV2;
};

export const twitterRedirectUri = `${process.env.DOMAIN_NAME as string}/api/twitter-callback`;

const getSsmKey = (orgId: string, id: string) => `/social/${orgId}/twitter/${id}/refresh_token`;

export const addTwitterAccount = async (code: string, codeVerifier: string, orgId: string, addedBy: string) => {
    const twitterClient = await getTwitterClient();

    const { refreshToken, client } = await twitterClient.loginWithOAuth2({
        code: code.toString(),
        codeVerifier,
        redirectUri: twitterRedirectUri,
    });

    if (!refreshToken) {
        throw new Error("No refresh token returned by Twitter");
    }

    let twitterDetails: UserV2Result | null = null;

    try {
        twitterDetails = await client.v2.me();
    } catch (e) {
        logger.error(e);
        throw new Error("Twitter auth failed");
    }

    await addSocialAccountToOrg(orgId, twitterDetails.data.id, twitterDetails.data.name, addedBy, "Twitter");

    await putParameter(getSsmKey(orgId, twitterDetails.data.id), refreshToken, "SecureString", true);
};

export const refreshTwitterToken = async (refreshToken: string, orgId: string, socialId: string) => {
    try {
        const twitterClient = await getTwitterClient();

        const { refreshToken: newRefreshToken, client: authedClient } = await twitterClient.refreshOAuth2Token(
            refreshToken,
        );

        if (!newRefreshToken) {
            throw new Error("No refresh token returned by Twitter");
        }

        await putParameter(getSsmKey(orgId, socialId), newRefreshToken, "SecureString", true);

        return authedClient;
    } catch (e) {
        return null;
    }
};

export const getTwitterAuthUrl = async (ctx: NextPageContext) => {
    const twitterClient = await getTwitterClient();

    const { url, state, codeVerifier } = twitterClient.generateOAuth2AuthLink(twitterRedirectUri, {
        scope: ["tweet.write", "offline.access", "tweet.read", "users.read"],
    });

    setCookie(ctx, COOKIES_TWITTER_CODE_VERIFIER, codeVerifier, {
        sameSite: "lax",
        path: "/",
    });
    setCookie(ctx, COOKIES_TWITTER_STATE, state, {
        sameSite: "lax",
        path: "/",
    });

    return url;
};

export const getAuthedTwitterClient = async (orgId: string, socialId: string) => {
    try {
        const refreshTokenParam = await getParameter(getSsmKey(orgId, socialId), true);

        if (!refreshTokenParam.Parameter?.Value) {
            return null;
        }

        const refreshToken = refreshTokenParam.Parameter.Value;

        return refreshTwitterToken(refreshToken, orgId, socialId);
    } catch (e) {
        return null;
    }
};

export const sendTweet = async (orgId: string, post: TwitterPost, isUserStaff: boolean, canPublish: boolean) => {
    try {
        const authedClient = await getAuthedTwitterClient(orgId, post.socialAccount);

        if (!authedClient) {
            throw new Error("Not authenticated to twitter");
        }

        await Promise.all([
            authedClient.v2.tweet({
                text: post.messageContent,
            }),
            upsertSocialMediaPost(
                {
                    ...post,
                    status: SocialMediaPostStatus.successful,
                },
                orgId,
                isUserStaff,
                canPublish,
            ),
        ]);
    } catch (e) {
        logger.error(e);
        await upsertSocialMediaPost(
            {
                ...post,
                status: SocialMediaPostStatus.rejected,
            },
            orgId,
            isUserStaff,
            canPublish,
        );
    }
};

export type TwitterDetails = {
    userAdded: string;
    accountName: string;
};

export const getTwitterAccountList = async (orgId: string): Promise<SocialMediaAccount[]> => {
    const socialAccounts = await getOrgSocialAccounts(orgId);

    const twitterDetail = socialAccounts
        .map((account): SocialMediaAccount | null => {
            if (account.accountType !== "Twitter") {
                return null;
            }

            return {
                ...account,
                expiresIn: "Never",
            };
        })
        .filter(notEmpty);

    return twitterDetail;
};
