import { Consequence } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { MAX_CONSEQUENCES } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { SocialMediaPostStatus } from "@create-disruptions-data/shared-ts/enums";
import cryptoRandomString from "crypto-random-string";
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
    COOKIES_REFRESH_TOKEN,
} from "../../constants";
import { upsertConsequence } from "../../data/dynamo";
import { getAccessToken, publishToHootsuite } from "../../data/hootsuite";
import { getAuthedTwitterClient, sendTweet } from "../../data/twitter";
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

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const publishSocialMedia = async (
    socialMediaPosts: SocialMediaPost[],
    orgId: string,
    isUserStaff: boolean,
    canPublish: boolean,
) => {
    const authedTwitterClients: Record<string, TwitterApi> = {};
    const hootsuiteAccessTokens: Record<string, string> = {};

    const uniqueTwitterSocialAccounts = new Set(
        socialMediaPosts.filter((post) => post.accountType === "Twitter").map((post) => post.socialAccount),
    );

    const uniqueHootsuiteSocialAccounts = new Set(
        socialMediaPosts.filter((post) => post.accountType === "Hootsuite").map((post) => post.socialAccount),
    );

    for (const socialAccount of uniqueHootsuiteSocialAccounts) {
        const accessToken = await getAccessToken(orgId, socialAccount);
        hootsuiteAccessTokens[socialAccount] = accessToken;
    }

    for (const socialAccount of uniqueTwitterSocialAccounts) {
        const authedClient = await getAuthedTwitterClient(orgId, socialAccount);

        if (authedClient) {
            authedTwitterClients[socialAccount] = authedClient;
        }
    }

    const socialMediaPromises = socialMediaPosts.map((post) => {
        if (post.status === SocialMediaPostStatus.pending) {
            if (post.accountType === "Twitter") {
                return sendTweet(orgId, post, isUserStaff, canPublish, authedTwitterClients[post.socialAccount]);
            }

            return publishToHootsuite(post, orgId, isUserStaff, canPublish, hootsuiteAccessTokens[post.socialAccount]);
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

export const formatCreateDisruptionBody = (body: object) => {
    const validity = Object.entries(body)
        .filter((item) => item.toString().startsWith("validity"))
        .map((arr: string[]) => {
            const [, values] = arr;

            return {
                disruptionStartDate: values[0],
                disruptionStartTime: values[1],
                disruptionEndDate: values[2],
                disruptionEndTime: values[3],
                disruptionNoEndDateTime: values[4],
                disruptionRepeats: values[5],
                disruptionRepeatsEndDate: values[6],
            };
        });

    const disruptionRepeatsEndDate = Object.entries(body)
        .filter((item) => item.toString().startsWith("disruptionRepeatsEndDate"))
        .map((arr: string[]) => {
            const [, values] = arr;
            let endDate = values;
            if (Array.isArray(values)) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                endDate = values[0] ? values[0] : values[1];
            }
            return endDate;
        });

    const displayId: unknown[] = Object.entries(body)
        .filter((item) => item.includes("displayId"))
        .flat();

    const cleansedBody = Object.fromEntries(
        Object.entries(body).filter((item) => !item.toString().startsWith("validity")),
    );

    return {
        ...cleansedBody,
        validity,
        disruptionRepeatsEndDate: disruptionRepeatsEndDate ? disruptionRepeatsEndDate[0] : disruptionRepeatsEndDate,
        displayId: displayId && displayId.length > 1 && displayId[1] ? displayId[1] : cryptoRandomString({ length: 6 }),
    };
};

export const handleUpsertConsequence = async (
    consequence: Consequence | Pick<Consequence, "disruptionId" | "consequenceIndex">,
    orgId: string,
    isOrgStaff: boolean,
    isTemplate: boolean,
    inputs: unknown,
    errorCookie: string,
    res: NextApiResponse,
) => {
    try {
        return await upsertConsequence(consequence, orgId, isOrgStaff, isTemplate);
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
