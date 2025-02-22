import { IncomingMessage, ServerResponse } from "http";
import { Consequence } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { MAX_CONSEQUENCES } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { SocialMediaPostStatus } from "@create-disruptions-data/shared-ts/enums";
import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies, setCookie } from "nookies";
import { TwitterApi } from "twitter-api-v2";
import { z } from "zod";
import { notEmpty } from "..";
import {
    COOKIES_ID_TOKEN,
    COOKIES_POLICY_COOKIE,
    COOKIES_REFRESH_TOKEN,
    COOKIE_CSRF,
    COOKIE_PREFERENCES_COOKIE,
    DISRUPTION_DETAIL_PAGE_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
} from "../../constants";
import { upsertConsequence } from "../../data/db";
import { getHootsuiteAccessToken, publishToHootsuite } from "../../data/hootsuite";
import { getNextdoorAccessToken, publishToNextdoor } from "../../data/nextdoor";
import { getTwitterClient, sendTweet } from "../../data/twitter";
import { TooManyConsequencesError } from "../../errors";
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

    if (disruptionId || !!data) {
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

export const publishSocialMedia = async (socialMediaPosts: SocialMediaPost[], orgId: string, isUserStaff: boolean) => {
    const authedTwitterClients: Record<string, TwitterApi> = {};
    const hootsuiteAccessTokens: Record<string, string> = {};
    const nextdoorAccessTokens: Record<string, string> = {};

    const uniqueTwitterSocialAccounts = new Set(
        socialMediaPosts.filter((post) => post.accountType === "Twitter").map((post) => post.socialAccount),
    );

    const uniqueHootsuiteSocialAccounts = new Set(
        socialMediaPosts.filter((post) => post.accountType === "Hootsuite").map((post) => post.socialAccount),
    );

    const uniqueNextdoorSocialAccounts = new Set(
        socialMediaPosts.filter((post) => post.accountType === "Nextdoor").map((post) => post.socialAccount),
    );

    for (const socialAccount of uniqueHootsuiteSocialAccounts) {
        const accessToken = await getHootsuiteAccessToken(orgId, socialAccount);
        hootsuiteAccessTokens[socialAccount] = accessToken;
    }

    for (const socialAccount of uniqueNextdoorSocialAccounts) {
        const accessToken = await getNextdoorAccessToken(orgId, socialAccount);
        nextdoorAccessTokens[socialAccount] = accessToken;
    }

    for (const socialAccount of uniqueTwitterSocialAccounts) {
        const authedClient = await getTwitterClient({ orgId, twitterId: socialAccount });

        if (authedClient) {
            authedTwitterClients[socialAccount] = authedClient;
        }
    }

    const socialMediaPromises = socialMediaPosts.map((post) => {
        if (post.status === SocialMediaPostStatus.pending) {
            if (post.accountType === "Twitter") {
                return sendTweet(orgId, post, isUserStaff, authedTwitterClients[post.socialAccount]);
            }
            if (post.accountType === "Hootsuite") {
                return publishToHootsuite(post, orgId, isUserStaff, hootsuiteAccessTokens[post.socialAccount]);
            }
            if (post.accountType === "Nextdoor") {
                return publishToNextdoor(post, orgId, isUserStaff, nextdoorAccessTokens[post.socialAccount]);
            }
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

export const handleUpsertConsequence = async (
    consequence: Consequence,
    orgId: string,
    user: string,
    isOrgStaff: boolean,
    isTemplate: boolean,
    inputs: unknown,
    errorCookie: string,
    res: NextApiResponse,
) => {
    try {
        return await upsertConsequence(consequence, orgId, user, isOrgStaff, isTemplate);
    } catch (e) {
        if (e instanceof TooManyConsequencesError) {
            setCookieOnResponseObject(
                errorCookie,
                JSON.stringify({
                    inputs,
                    errors: [
                        {
                            id: "",
                            errorMessage: `Max consequence limit of ${MAX_CONSEQUENCES} has been reached`,
                        },
                    ],
                }),
                res,
            );
        }

        throw e;
    }
};

export const formatAddOrEditUserBody = (body: object) => {
    const operatorOrg = Object.entries(body)
        .filter((item) => item.includes("operatorOrg"))
        .flat();

    const cleansedBody = Object.fromEntries(Object.entries(body).filter((item) => !item[0].startsWith("operatorOrg")));

    return {
        ...cleansedBody,
        operatorOrg: operatorOrg[1] ? (JSON.parse(operatorOrg[1] as string) as object) : undefined,
    };
};
