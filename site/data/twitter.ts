import { SocialMediaPostStatus } from "@create-disruptions-data/shared-ts/enums";
import { getParameter } from "@create-disruptions-data/shared-ts/utils/ssm";
import { NextPageContext } from "next";
import { TwitterApi } from "twitter-api-v2";
import { COOKIES_TWITTER_OAUTH_SECRET, COOKIES_TWITTER_OAUTH_TOKEN, DOMAIN_NAME, TWITTER_CALLBACK } from "../constants";
import { SocialMediaAccount } from "../schemas/social-media-accounts.schema";
import { TwitterPost } from "../schemas/social-media.schema";
import { setCookieOnResponseObject } from "../utils/apiUtils";
import logger from "../utils/logger";
import { upsertSocialMediaPost } from "./db";
import { getOrgSocialAccounts } from "./dynamo";
import { getObject } from "./s3";

type TwitterClientParams = {
    orgId?: string;
    twitterId?: string;
    oauthToken?: string;
    oauthSecret?: string;
};

export const getTwitterClient = async ({ orgId, twitterId, oauthToken, oauthSecret }: TwitterClientParams) => {
    const [twitterClientConsumerKeyParam, twitterClientConsumerSecretParam] = await Promise.all([
        getParameter("/social/twitter/consumer_key", logger),
        getParameter("/social/twitter/consumer_secret", logger),
    ]);

    let accessToken = oauthToken;
    let accessSecret = oauthSecret;

    if ((!accessToken || !accessSecret) && orgId && twitterId) {
        const [twitterClientAccessTokenParam, twitterClientAccessSecretParam] = await Promise.all([
            getParameter(getTwitterSsmAccessTokenKey(orgId, twitterId), logger),
            getParameter(getTwitterSsmAccessSecretKey(orgId, twitterId), logger),
        ]);

        accessToken = twitterClientAccessTokenParam.Parameter?.Value;
        accessSecret = twitterClientAccessSecretParam.Parameter?.Value;
    }

    const twitterClientConsumerKey = twitterClientConsumerKeyParam.Parameter?.Value ?? "";
    const twitterClientConsumerSecret = twitterClientConsumerSecretParam.Parameter?.Value ?? "";

    const twitterClient = new TwitterApi({
        appKey: twitterClientConsumerKey,
        appSecret: twitterClientConsumerSecret,
        accessToken: accessToken,
        accessSecret: accessSecret,
    });

    return twitterClient;
};

export const twitterRedirectUri = `${process.env.DOMAIN_NAME as string}/api/twitter-callback`;

export const getTwitterSsmAccessTokenKey = (orgId: string, id: string) => `/social/${orgId}/twitter/${id}/access_token`;
export const getTwitterSsmAccessSecretKey = (orgId: string, id: string) =>
    `/social/${orgId}/twitter/${id}/access_secret`;

export const getTwitterAuthUrl = async (ctx: NextPageContext) => {
    const [twitterClientConsumerKeyParam, twitterClientConsumerSecretParam] = await Promise.all([
        getParameter("/social/twitter/consumer_key", logger),
        getParameter("/social/twitter/consumer_secret", logger),
    ]);

    const twitterClientConsumerKey = twitterClientConsumerKeyParam.Parameter?.Value ?? "";
    const twitterClientConsumerSecret = twitterClientConsumerSecretParam.Parameter?.Value ?? "";

    const twitterClient = new TwitterApi({
        appKey: twitterClientConsumerKey,
        appSecret: twitterClientConsumerSecret,
    });

    const { url, oauth_token, oauth_token_secret } = await twitterClient.generateAuthLink(
        `${DOMAIN_NAME}${TWITTER_CALLBACK}`,
    );

    if (ctx.res) {
        setCookieOnResponseObject(COOKIES_TWITTER_OAUTH_TOKEN, oauth_token, ctx.res);
        setCookieOnResponseObject(COOKIES_TWITTER_OAUTH_SECRET, oauth_token_secret, ctx.res);
    }

    return url;
};

export const sendTweet = async (
    orgId: string,
    post: TwitterPost,
    isUserStaff: boolean,
    authedClient: TwitterApi | null,
) => {
    try {
        if (!authedClient) {
            throw new Error("Not authenticated to twitter");
        }

        let imageId: string | null = null;

        if (post.image) {
            const imageContents = await getObject(
                process.env.IMAGE_BUCKET_NAME || "",
                post.image.key,
                post.image.originalFilename,
            );

            if (!imageContents) {
                throw new Error("Could not read image file");
            }

            imageId = await authedClient.v1.uploadMedia(Buffer.from(imageContents), {
                mimeType: post.image.mimetype,
            });
        }

        await Promise.all([
            authedClient.v2.tweet({
                text: post.messageContent,
                ...(imageId
                    ? {
                          media: {
                              media_ids: [imageId],
                          },
                      }
                    : {}),
            }),
            upsertSocialMediaPost(
                {
                    ...post,
                    status: SocialMediaPostStatus.successful,
                    publishStatus: "PUBLISHED",
                },
                orgId,
                isUserStaff,
                true,
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
            true,
        );
    }
};

export type TwitterDetails = {
    userAdded: string;
    accountName: string;
};

export const getTwitterAccountList = async (orgId: string, operatorOrgId?: string): Promise<SocialMediaAccount[]> => {
    const socialAccounts = await getOrgSocialAccounts(orgId);

    const twitterDetail = socialAccounts
        .filter((account) => account.accountType === "Twitter")
        .map((account) => ({
            ...account,
            expiresIn: "Never",
        }))
        .filter((item) =>
            operatorOrgId ? operatorOrgId === item.createdByOperatorOrgId : !item.createdByOperatorOrgId,
        );

    return twitterDetail;
};
