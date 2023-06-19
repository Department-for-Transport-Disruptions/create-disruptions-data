import { SocialMediaPostStatus } from "@create-disruptions-data/shared-ts/enums";
import dayjs from "dayjs";
import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies, setCookie } from "nookies";
import { z } from "zod";
import { readFile } from "fs/promises";
import { IncomingMessage, ServerResponse } from "http";
import {
    COOKIES_POLICY_COOKIE,
    COOKIE_CSRF,
    COOKIES_ID_TOKEN,
    COOKIE_PREFERENCES_COOKIE,
    DISRUPTION_DETAIL_PAGE_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
    COOKIES_REFRESH_TOKEN,
    HOOTSUITE_URL,
} from "../../constants";
import { upsertSocialMediaPost } from "../../data/dynamo";
import { getHootsuiteToken } from "../../data/hoostuite";
import { getParameter, getParametersByPath, putParameter } from "../../data/ssm";
import { PageState } from "../../interfaces";
import { hootsuiteMediaSchema, hootsuiteTokenSchema, hootsuiteMediaStatusSchema } from "../../schemas/hootsuite.schema";
import { SocialMediaPost } from "../../schemas/social-media.schema";
import logger from "../logger";

export const setCookieOnResponseObject = (
    cookieName: string,
    cookieValue: string,
    res: NextApiResponse | ServerResponse<IncomingMessage>,
    lifetime?: number,
    httpOnly = true,
): void => {
    // From docs: All cookies are httponly by default, and cookies sent over SSL are secure by
    // default. An error will be thrown if you try to send secure cookies over an insecure socket.
    setCookie({ res }, cookieName, cookieValue, {
        path: "/",
        sameSite: "strict",
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

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const publishToHootsuite = async (socialMediaPosts: SocialMediaPost[], orgId: string) => {
    const socialMediaPostsById = socialMediaPosts.reduce(
        (acc: Record<string, SocialMediaPost[]>, obj: SocialMediaPost) => {
            const group = obj.socialAccount;
            if (!acc[group]) {
                acc[group] = [];
            }
            acc[group].push(obj);
            return acc;
        },
        {},
    );

    // console.log(socialMediaPostsById);
    // console.log(JSON.stringify(Object.values(socialMediaPostsById)));
    const resp = [
        [
            {
                disruptionId: "7fa330c1-2b42-4108-af9c-923725bf2e42",
                messageContent: "a test",
                socialAccount: "25858639",
                hootsuiteProfile: "138196022",
                publishDate: "19/06/2023",
                publishTime: "1615",
                socialMediaPostIndex: 0,
                image: {
                    filepath: "/var/folders/85/5c4z0mfs49n56jgsyk737gf80000gp/T/9c16888a243958da64b95f901",
                    mimetype: "image/png",
                    size: 70872,
                    key: "d9f6962b-1d67-4d0b-9cf2-f123315fd14c/7fa330c1-2b42-4108-af9c-923725bf2e42/0.png",
                    originalFilename: "1200px-SNice.svg.png",
                },
                status: "Rejected",
            },
            {
                disruptionId: "7fa330c1-2b42-4108-af9c-923725bf2e42",
                messageContent: "a test 2",
                socialAccount: "25858639",
                hootsuiteProfile: "138196022",
                publishDate: "19/06/2023",
                publishTime: "1615",
                socialMediaPostIndex: 1,
                status: "Successful",
            },
            {
                disruptionId: "7fa330c1-2b42-4108-af9c-923725bf2e42",
                messageContent: "this is another test",
                socialAccount: "25858639",
                hootsuiteProfile: "138196022",
                publishDate: "19/06/2023",
                publishTime: "1700",
                socialMediaPostIndex: 2,
                image: {
                    filepath: "/var/folders/85/5c4z0mfs49n56jgsyk737gf80000gp/T/9c16888a243958da64b95f903",
                    mimetype: "image/png",
                    size: 70872,
                    key: "d9f6962b-1d67-4d0b-9cf2-f123315fd14c/7fa330c1-2b42-4108-af9c-923725bf2e42/2.png",
                    originalFilename: "1200px-SNice.svg.png",
                },
                status: "Rejected",
            },
            {
                disruptionId: "7fa330c1-2b42-4108-af9c-923725bf2e42",
                messageContent: "another 234",
                socialAccount: "25858639",
                hootsuiteProfile: "138196022",
                publishDate: "19/06/2023",
                publishTime: "1700",
                socialMediaPostIndex: 4,
                image: {
                    filepath: "/var/folders/85/5c4z0mfs49n56jgsyk737gf80000gp/T/9c16888a243958da64b95f908",
                    mimetype: "image/png",
                    size: 70872,
                    key: "d9f6962b-1d67-4d0b-9cf2-f123315fd14c/7fa330c1-2b42-4108-af9c-923725bf2e42/4.png",
                    originalFilename: "1200px-SNice.svg.png",
                },
                status: "Pending",
            },
            {
                disruptionId: "7fa330c1-2b42-4108-af9c-923725bf2e42",
                messageContent: "ummm",
                socialAccount: "25858639",
                hootsuiteProfile: "138196022",
                publishDate: "19/06/2023",
                publishTime: "1700",
                socialMediaPostIndex: 5,
                image: {
                    filepath: "/var/folders/85/5c4z0mfs49n56jgsyk737gf80000gp/T/92c66c7839b44099a8e5b4e00",
                    mimetype: "image/png",
                    size: 70872,
                    key: "d9f6962b-1d67-4d0b-9cf2-f123315fd14c/7fa330c1-2b42-4108-af9c-923725bf2e42/5.png",
                    originalFilename: "1200px-SNice.svg.png",
                },
                status: "Pending",
            },
        ],
    ];
    await Promise.all(
        Object.values(socialMediaPostsById).map(async (socialMediaPosts) => {
            const refreshTokens = await getParametersByPath(`/social/${orgId}/hootsuite`);

            if (!refreshTokens || (refreshTokens && refreshTokens.Parameters?.length === 0)) {
                throw new Error("Refresh token is required when creating a social media post");
            }
            const refreshToken = refreshTokens.Parameters?.find((rt) =>
                rt.Name?.includes(`${socialMediaPosts[0].socialAccount}`),
            );
            if (!refreshToken) {
                throw new Error("Refresh token is required when creating a social media post");
            }
            const [clientId, clientSecret] = await Promise.all([
                getParameter(`/social/hootsuite/client_id`),
                getParameter(`/social/hootsuite/client_secret`),
            ]);

            if (!clientId || !clientSecret) {
                throw new Error("clientId and clientSecret must be defined");
            }

            const credentials = `${clientId.Parameter?.Value || ""}:${clientSecret.Parameter?.Value || ""}`;

            const authToken = `Basic ${Buffer.from(credentials).toString("base64")}`;
            const responseToken = await getHootsuiteToken(refreshToken?.Value || "", authToken);
            let tokenResult = { refresh_token: "", access_token: "" };
            let rejectSocialMediaPostGroup = false;
            if (responseToken.ok) {
                const parsedTokenData = hootsuiteTokenSchema.safeParse(await responseToken.json());

                if (!parsedTokenData.success) {
                    rejectSocialMediaPostGroup = true;
                    console.log("Could not parse data from hootsuite token endpoint");
                } else {
                    tokenResult = parsedTokenData.data;
                    const key = refreshToken?.Name || "";
                    await putParameter(key, tokenResult?.refresh_token ?? "", "SecureString", true);
                }
            } else {
                rejectSocialMediaPostGroup = true;
                console.log("Could not retrieve token from hootsuite");
            }
            if (!rejectSocialMediaPostGroup) {
                socialMediaPosts
                    .filter((s) => s.status === SocialMediaPostStatus.pending)
                    .map(async (socialMediaPost) => {
                        let rejectSocialMediaPost = false;

                        let imageLink = { id: "", url: "" };
                        let canUpload = false;

                        if (socialMediaPost.image) {
                            const responseImage = await fetch(`${HOOTSUITE_URL}v1/media`, {
                                method: "POST",
                                body: JSON.stringify({
                                    sizeBytes: socialMediaPost.image.size,
                                    mimeType: socialMediaPost.image.mimetype,
                                }),
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${tokenResult?.access_token ?? ""}`,
                                },
                            });

                            if (responseImage.ok) {
                                const parsedImageData = hootsuiteMediaSchema.safeParse(await responseImage.json());
                                let image;
                                if (!parsedImageData.success) {
                                    rejectSocialMediaPost = true;
                                    console.log("Could not parse data from hootsuite media endpoint");
                                } else {
                                    image = parsedImageData.data;

                                    const imageContents = await readFile(socialMediaPost.image.filepath || "");
                                    imageLink = { url: image?.data?.uploadUrl ?? "", id: image?.data?.id ?? "" };

                                    const uploadResponse = await fetch(imageLink.url, {
                                        method: "PUT",
                                        headers: {
                                            "Content-Type": socialMediaPost.image.mimetype,
                                        },
                                        body: imageContents,
                                    });
                                    if (uploadResponse.ok) {
                                        for (let i = 0; i < 3; i++) {
                                            const imageStatus = await fetch(
                                                `${HOOTSUITE_URL}v1/media/${imageLink.id}`,
                                                {
                                                    method: "GET",
                                                    headers: {
                                                        Authorization: `Bearer ${tokenResult?.access_token ?? ""}`,
                                                    },
                                                },
                                            );
                                            if (imageStatus.ok) {
                                                const parsedImageState = hootsuiteMediaStatusSchema.safeParse(
                                                    await imageStatus.json(),
                                                );
                                                let imageState;
                                                if (!parsedImageState.success) {
                                                    rejectSocialMediaPost = true;
                                                    console.log(
                                                        "Could not parse data from hootsuite media by id endpoint",
                                                    );
                                                } else {
                                                    imageState = parsedImageState.data;
                                                }
                                                if (imageState?.data?.state === "READY") {
                                                    rejectSocialMediaPost = false;
                                                    canUpload = true;

                                                    break;
                                                } else {
                                                    await delay(1000);
                                                    rejectSocialMediaPost = false;
                                                }
                                            } else {
                                                rejectSocialMediaPost = true;
                                                console.log("Cannot retrieve media details from hootsuite");
                                            }
                                        }
                                        if (!canUpload) {
                                            await delay(4000);
                                            canUpload = true;
                                        }
                                    } else {
                                        rejectSocialMediaPost = true;
                                        console.log("Cannot upload image to hootsuite");
                                    }
                                }
                            } else {
                                rejectSocialMediaPost = true;
                                console.log("Cannot retrieve upload url from hootsuite");
                            }
                        }

                        const formattedDate = dayjs(
                            `${socialMediaPost.publishDate} ${socialMediaPost.publishTime}`,
                            "DD/MM/YYYY HHmm",
                        ).toISOString();

                        const createSocialPostResponse = await fetch(`${HOOTSUITE_URL}v1/messages`, {
                            method: "POST",
                            body: JSON.stringify({
                                text: socialMediaPost.messageContent,
                                scheduledSendTime: formattedDate,
                                socialProfileIds: [socialMediaPost.hootsuiteProfile],
                                ...(imageLink.id ? { media: [{ id: imageLink.id }] } : {}),
                            }),
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${tokenResult?.access_token ?? ""}`,
                            },
                        });

                        if (!createSocialPostResponse.ok) {
                            rejectSocialMediaPost = true;
                            console.log("Failed to create social media post");
                        } else {
                            await upsertSocialMediaPost(
                                {
                                    ...socialMediaPost,
                                    status: SocialMediaPostStatus.successful,
                                },
                                orgId,
                            );
                        }

                        if (rejectSocialMediaPost) {
                            await upsertSocialMediaPost(
                                {
                                    ...socialMediaPost,
                                    status: SocialMediaPostStatus.rejected,
                                },
                                orgId,
                            );
                        }
                    });
            } else {
                await Promise.all([
                    socialMediaPosts.map(async (socialMediaPost) =>
                        upsertSocialMediaPost(
                            {
                                ...socialMediaPost,
                                status: SocialMediaPostStatus.rejected,
                            },
                            orgId,
                        ),
                    ),
                ]);
            }
        }),
    );
};
