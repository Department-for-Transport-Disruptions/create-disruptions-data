import dayjs from "dayjs";
import { NextApiRequest, NextApiResponse } from "next";
import { readFile } from "fs/promises";
import {
    COOKIES_SOCIAL_MEDIA_ERRORS,
    CREATE_SOCIAL_MEDIA_POST_PAGE_PATH,
    DISRUPTION_DETAIL_PAGE_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
} from "../../constants/index";
import { upsertSocialMediaPost } from "../../data/dynamo";
import { putItem } from "../../data/s3";
import { getParameter, putParameter } from "../../data/ssm";
import { refineImageSchema } from "../../schemas/social-media.schema";
import { flattenZodErrors } from "../../utils";
import {
    destroyCookieOnResponseObject,
    getReturnPage,
    redirectTo,
    redirectToError,
    setCookieOnResponseObject,
} from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";
import { formParse } from "../../utils/apiUtils/fileUpload";

const createSocialMediaPost = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const queryParam = getReturnPage(req);

        const session = getSession(req);

        if (!session) {
            throw new Error("No session found");
        }

        if (!process.env.IMAGE_BUCKET_NAME) {
            throw new Error("No image bucket to upload image to");
        }

        const { files, fields } = await formParse(req);

        if (!fields?.disruptionId && !fields?.socialMediaPostIndex) {
            throw new Error("No image data to upload");
        }

        const imageFile =
            files[0] && files[0].size
                ? {
                      ...files[0],
                      key: `${session.orgId}/${fields.disruptionId as string}/${
                          fields.socialMediaPostIndex as string
                      }.${files[0].mimetype?.replace("image/", "") ?? ""}`,
                  }
                : null;

        const validatedBody = refineImageSchema.safeParse({ ...fields, ...(imageFile ? { image: imageFile } : {}) });

        if (!validatedBody.success) {
            setCookieOnResponseObject(
                COOKIES_SOCIAL_MEDIA_ERRORS,
                JSON.stringify({
                    inputs: fields,
                    errors: imageFile
                        ? [
                              ...flattenZodErrors(validatedBody.error),
                              { errorMessage: "Re-upload the image", id: "image" },
                          ]
                        : flattenZodErrors(validatedBody.error),
                }),
                res,
            );

            redirectTo(
                res,
                `${CREATE_SOCIAL_MEDIA_POST_PAGE_PATH}/${fields.disruptionId as string}/${
                    fields.socialMediaPostIndex as string
                }${queryParam ? `?${queryParam}` : ""}`,
            );
            return;
        }

        //NOTE TO SELF WE NEED TO MOVE THIS TO PUBLISH.API.JS
        const refreshToken = await getParameter(
            `/social/${session.orgId}/hootsuite/${validatedBody.data.socialAccount ?? ""}`,
        );

        if (!refreshToken) {
            throw new Error("Refresh token is required when creating a social media post");
        }
        // const rep = {
        //     messageContent: "this is the ultimate test",
        //     publishDate: "30/05/2023",
        //     publishTime: "1200",
        //     socialAccount: "25825334",
        //     hootsuiteProfile: "1659487521879871490",
        //     disruptionId: "c53ee4ae-14b5-4daa-b210-e007cea8286c",
        //     socialMediaPostIndex: "1",
        // };

        const clientId = await getParameter(`/social/hootsuite/client_id`);
        const clientSecret = await getParameter(`/social/hootsuite/client_secret`);
        if (!clientId || !clientSecret) {
            throw new Error("clientId and clientSecret must be defined");
        }

        const key = `${clientId.Parameter?.Value || ""}:${clientSecret.Parameter?.Value || ""}`;

        const authToken = `Basic ${Buffer.from(key).toString("base64")}`;

        const resp = await fetch(`https://platform.hootsuite.com/oauth2/token`, {
            method: "POST",
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken.Parameter?.Value ?? "",
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: authToken,
            },
        });

        if (resp.ok) {
            const tokenResult = await resp.json();
            console.log(tokenResult);
            const key = `/social/${session.orgId}/hootsuite/${validatedBody.data.socialAccount ?? ""}`;
            await putParameter(key, tokenResult.refresh_token ?? "", "SecureString", true);

            let imageLink = { id: "", url: "" };
            if (validatedBody.data.image) {
                const imageContents = await readFile(validatedBody.data.image?.filepath || "");

                await putItem(process.env.IMAGE_BUCKET_NAME || "", validatedBody.data.image.key, imageContents);

                const responseImage = await fetch(`https://platform.hootsuite.com/v1/media`, {
                    method: "POST",
                    body: JSON.stringify({
                        sizeBytes: validatedBody.data.image.size,
                        mimeType: validatedBody.data.image.mimetype,
                        // mediaFileData: imageContents,
                    }),
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${tokenResult.access_token ?? ""}`,
                    },
                });
                console.log(responseImage.status);
                if (responseImage.ok) {
                    console.log("yay 1");
                    const image = await responseImage.json();
                    console.log(responseImage.status, JSON.stringify(image));
                    imageLink = { url: image.data.uploadUrl, id: image.data.id };

                    const uploadResponse = await fetch(imageLink.url, {
                        method: "PUT",
                        headers: {
                            "Content-Type": validatedBody.data.image.mimetype,
                        },
                        body: imageContents,
                    });
                    if (uploadResponse.ok) {
                        console.log("image uploaded");
                    }
                }
            }

            const formattedDate = dayjs(
                `${validatedBody.data.publishDate} ${validatedBody.data.publishTime}`,
                "DD/MM/YYYY HHmm",
            ).toISOString();

            console.log(
                JSON.stringify({
                    text: validatedBody.data.messageContent,
                    scheduledSendTime: formattedDate,
                    socialProfileIds: [validatedBody.data.hootsuiteProfile],
                    ...(imageLink.id ? { media: [{ id: imageLink.id }] } : {}),
                }),
            );
            //tomorrow you need to call the /media url to upload images and then in that way you can send it via the post
            console.log("imageID", imageLink.id);
            const createSocialPostResponse = await fetch(`https://platform.hootsuite.com/v1/messages`, {
                method: "POST",
                body: JSON.stringify({
                    text: validatedBody.data.messageContent,
                    scheduledSendTime: formattedDate,
                    socialProfileIds: [validatedBody.data.hootsuiteProfile],
                    ...(imageLink.id ? { media: [{ id: imageLink.id }] } : {}),
                    // ...(imageLink.url ? { mediaUrls: [{ url: imageLink.url }] } : {}),
                }),
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${tokenResult.access_token ?? ""}`,
                },
            });
            const respe = {
                data: [
                    {
                        id: "12776159376",
                        state: "SCHEDULED",
                        text: "another one",
                        scheduledSendTime: "2023-06-15T09:20:00Z",
                        socialProfile: { id: "138133798" },
                        mediaUrls: null,
                        media: null,
                        webhookUrls: null,
                        tags: null,
                        targeting: null,
                        privacy: null,
                        location: null,
                        emailNotification: false,
                        postUrl: null,
                        postId: null,
                        reviewers: null,
                        createdByMember: { id: "25825334" },
                        lastUpdatedByMember: { id: "25825334" },
                        extendedInfo: null,
                        sequenceNumber: null,
                    },
                ],
            };
            const test = await createSocialPostResponse.json();
            console.log(createSocialPostResponse.status, JSON.stringify(test));
            if (createSocialPostResponse.ok) {
                console.log("yay");
            }
        }

        await upsertSocialMediaPost(validatedBody.data, session.orgId, session.isOrgStaff);

        destroyCookieOnResponseObject(COOKIES_SOCIAL_MEDIA_ERRORS, res);

        const redirectPath =
            queryParam && decodeURIComponent(queryParam).includes(DISRUPTION_DETAIL_PAGE_PATH)
                ? DISRUPTION_DETAIL_PAGE_PATH
                : REVIEW_DISRUPTION_PAGE_PATH;
        redirectTo(res, `${redirectPath}/${validatedBody.data.disruptionId}`);

        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem creating a social media post.";
            redirectToError(res, message, "api.create-social-media-post", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export const config = {
    api: {
        bodyParser: false,
    },
};

export default createSocialMediaPost;
