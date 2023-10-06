import { SocialMediaPostStatus } from "@create-disruptions-data/shared-ts/enums";
import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies, setCookie } from "nookies";
import { TwitterApi } from "twitter-api-v2";
import { z } from "zod";
import { IncomingMessage, ServerResponse } from "http";
import { notEmpty } from "..";
import {
    COOKIES_POLICY_COOKIE,
    COOKIE_CSRF,
    COOKIES_ID_TOKEN,
    COOKIE_PREFERENCES_COOKIE,
    DISRUPTION_DETAIL_PAGE_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
    COOKIES_REFRESH_TOKEN,
} from "../../constants";
import { getAccessToken, publishToHootsuite } from "../../data/hootsuite";
import { getAuthedTwitterClient, sendTweet } from "../../data/twitter";
import { PageState } from "../../interfaces";
import { SocialMediaPost } from "../../schemas/social-media.schema";
import logger from "../logger";

export const setCookieOnResponseObject = (
    cookieName: string,
    cookieValue: string,
    res: NextApiResponse | ServerResponse<IncomingMessage>,
    lifetime?: number,
    httpOnly = true,
    sameSite: "lax" | "strict" | "none" = "lax",
): void => {
    // From docs: All cookies are httponly by default, and cookies sent over SSL are secure by
    // default. An error will be thrown if you try to send secure cookies over an insecure socket.
    setCookie({ res }, cookieName, cookieValue, {
        path: "/",
        sameSite,
        secure: process.env.NODE_ENV !== "development",
        maxAge: lifetime,
        httpOnly,
    });
};

export const destroyCookieOnResponseObject = (
    cookieName: string,
    res: NextApiResponse | ServerResponse<IncomingMessage>,
): void => {
    setCookieOnResponseObject(cookieName, "", res, 0);
};

export const redirectTo = (res: NextApiResponse | ServerResponse, location: string): void => {
    res.writeHead(302, {
        Location: location,
    });
    res.end();
};

export const redirectToError = (
    res: NextApiResponse | ServerResponse,
    message?: string,
    context?: string,
    error?: Error,
): void => {
    if (message && context && error) {
        logger.error(message, { context, error: error.stack });
    }

    redirectTo(res, "/500");
};

export const cleardownCookies = (req: NextApiRequest, res: NextApiResponse) => {
    const cookies = parseCookies({ req });

    const saveList = [
        COOKIES_POLICY_COOKIE,
        COOKIE_PREFERENCES_COOKIE,
        COOKIES_ID_TOKEN,
        COOKIES_REFRESH_TOKEN,
        COOKIE_CSRF,
    ];

    Object.keys(cookies).forEach((cookie) => {
        if (!saveList.includes(cookie)) {
            destroyCookieOnResponseObject(cookie, res);
        }
    });
};

export const getPageState = <T>(errorCookie: string, schemaObject: z.ZodType<T>, disruptionId?: string, data?: T) => {
    const inputsProps: PageState<Partial<T>> = {
        errors: [],
        inputs: {},
        disruptionId: disruptionId || "",
    };

    if (errorCookie) {
        return { ...(JSON.parse(errorCookie) as PageState<Partial<T>>), disruptionId: disruptionId || "" };
    }

    if (disruptionId) {
        const parsedData = schemaObject.safeParse(data);

        if (parsedData.success) {
            inputsProps.inputs = parsedData.data;
        }
    }

    return inputsProps;
};

export const getReturnPage = (req: NextApiRequest) => {
    const queryParam = req.headers.referer?.split("?")[1];
    const decodedQueryParam = queryParam ? decodeURIComponent(queryParam) : null;
    return decodedQueryParam?.includes(REVIEW_DISRUPTION_PAGE_PATH) ||
        decodedQueryParam?.includes(DISRUPTION_DETAIL_PAGE_PATH)
        ? queryParam
        : null;
};

export const isDisruptionFromTemplate = (req: NextApiRequest) => {
    const queryParam = req.headers.referer?.split("?")[1];

    const decodedQueryParam = queryParam ? decodeURIComponent(queryParam) : null;
    return decodedQueryParam?.includes(DISRUPTION_DETAIL_PAGE_PATH) && decodedQueryParam.includes("template=true")
        ? queryParam
        : null;
};

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const publishSocialMedia = async (
    socialMediaPosts: SocialMediaPost[],
    orgId: string,
    isUserStaff: boolean,
    canPublish: boolean,
) => {
    const accessTokensTwitter = {} as { [key: string]: TwitterApi | null };
    const accessTokensHootsuite = {} as { [key: string]: string };
    const uniqueTwitterSocialAccounts = new Set<string>();
    const uniqueHootsuiteSocialAccounts = new Set<string>();

    socialMediaPosts.forEach((post) => {
        if (post.accountType === "Twitter") {
            uniqueTwitterSocialAccounts.add(post.socialAccount);
        } else {
            uniqueHootsuiteSocialAccounts.add(post.socialAccount);
        }
    });

    const accessTokenPromisesHootsuite = [...uniqueHootsuiteSocialAccounts].map(async (socialAccount) => {
        if (!accessTokensHootsuite[socialAccount]) {
            const accessToken = await getAccessToken(orgId, socialAccount);
            accessTokensHootsuite[socialAccount] = accessToken;
        }
    });

    const accessTokenPromisesTwitter = [...uniqueTwitterSocialAccounts].map(async (socialAccount) => {
        if (!accessTokensHootsuite[socialAccount]) {
            const accessToken = await getAuthedTwitterClient(orgId, socialAccount);
            accessTokensTwitter[socialAccount] = accessToken;
        }
    });

    await Promise.all(accessTokenPromisesHootsuite);
    await Promise.all(accessTokenPromisesTwitter);

    const socialMediaPromises = socialMediaPosts.map((post) => {
        if (post.status === SocialMediaPostStatus.pending) {
            if (post.accountType === "Twitter") {
                return sendTweet(orgId, post, isUserStaff, canPublish, accessTokensTwitter[post.socialAccount]);
            }

            return publishToHootsuite(post, orgId, isUserStaff, canPublish, accessTokensHootsuite[post.socialAccount]);
        }

        return null;
    });

    await Promise.all(socialMediaPromises);
};

export const redirectToWithQueryParams = (
    req: NextApiRequest,
    res: NextApiResponse,
    queryParamsToForward: string[],
    location: string,
    paramsToAdd?: string[],
) => {
    const queryStringParams = queryParamsToForward
        .map((p) => {
            const paramValue = req.query[p];

            return paramValue ? `${p}=${paramValue.toString()}` : null;
        })
        .filter(notEmpty);

    redirectTo(
        res,
        `${location}${
            [...queryStringParams, ...(paramsToAdd || [])].length > 0
                ? `?${[...queryStringParams, ...(paramsToAdd || [])].join("&")}`
                : ""
        }`,
    );
};
