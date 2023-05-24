import { NextApiRequest, NextApiResponse } from "next";
import { readFile } from "fs/promises";
import {
    COOKIES_SOCIAL_MEDIA_ERRORS,
    CREATE_SOCIAL_MEDIA_POST_PAGE_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
} from "../../constants/index";
import { upsertSocialMediaPost } from "../../data/dynamo";
import { putItem } from "../../data/s3";
import { refineImageSchema } from "../../schemas/social-media.schema";
import { flattenZodErrors } from "../../utils";
import {
    destroyCookieOnResponseObject,
    redirectTo,
    redirectToError,
    setCookieOnResponseObject,
} from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";
import { formParse } from "../../utils/apiUtils/fileUpload";

const createSocialMediaPost = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const session = getSession(req);

        console.log("here6");
        if (!session) {
            throw new Error("No session found");
        }

        console.log("here7");
        if (!process.env.IMAGE_BUCKET_NAME) {
            throw new Error("No image bucket to upload image to");
        }

        console.log("here5");

        const { files, fields } = await formParse(req);
        console.log("here4");
        if (!fields?.disruptionId && !fields?.socialMediaPostIndex) {
            throw new Error("No image data to upload");
        }

        const image = Array.isArray(files["image"]) ? files["image"][0] : files["image"];

        console.log("here3");
        const validatedBody = refineImageSchema.safeParse({ ...fields, image });

        if (!validatedBody.success) {
            setCookieOnResponseObject(
                COOKIES_SOCIAL_MEDIA_ERRORS,
                JSON.stringify({
                    inputs: fields,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );

            redirectTo(
                res,
                `${CREATE_SOCIAL_MEDIA_POST_PAGE_PATH}/${fields.disruptionId as string}/${
                    fields.socialMediaPostIndex as string
                }}`,
            );
            return;
        }

        console.log("here2");

        const isImage = validatedBody.data.image && validatedBody.data.image.size;
        if (isImage) {
            const imageContents = await readFile(validatedBody.data.image?.filepath || "");

            const key = `${session.orgId}/${validatedBody.data.image.key}`;
            await putItem(process.env.IMAGE_BUCKET_NAME || "", key, imageContents);
        }

        console.log("here");
        await upsertSocialMediaPost(
            { ...validatedBody.data, image: isImage ? validatedBody.data.image : undefined },
            session.orgId,
        );

        destroyCookieOnResponseObject(COOKIES_SOCIAL_MEDIA_ERRORS, res);
        redirectTo(res, `${REVIEW_DISRUPTION_PAGE_PATH}/${validatedBody.data.disruptionId}`);
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
