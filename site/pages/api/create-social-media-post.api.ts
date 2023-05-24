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
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );

            redirectTo(
                res,
                `${CREATE_SOCIAL_MEDIA_POST_PAGE_PATH}/${fields.disruptionId as string}/${
                    fields.socialMediaPostIndex as string
                }`,
            );
            return;
        }

        if (validatedBody.data.image) {
            const imageContents = await readFile(validatedBody.data.image?.filepath || "");

            await putItem(process.env.IMAGE_BUCKET_NAME || "", validatedBody.data.image.key, imageContents);
        }

        await upsertSocialMediaPost(validatedBody.data, session.orgId);

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
