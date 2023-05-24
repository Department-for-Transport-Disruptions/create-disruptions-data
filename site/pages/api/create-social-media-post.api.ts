import { NextApiRequest, NextApiResponse } from "next";
import { readFile } from "fs/promises";
import {
    COOKIES_SOCIAL_MEDIA_ERRORS,
    CREATE_SOCIAL_MEDIA_POST_PAGE_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
} from "../../constants/index";
import { upsertSocialMediaPost } from "../../data/dynamo";
import { putItem } from "../../data/s3";
import { SocialMediaPost, socialMediaPostSchema } from "../../schemas/social-media.schema";
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
        console.log(JSON.stringify(req.body));
        if (!session) {
            throw new Error("No session found");
        }

        const body = req.body as SocialMediaPost;

        if (!process.env.IMAGE_BUCKET_NAME) {
            throw new Error("No image bucket to upload image to");
        }

        const { files } = await formParse(req);
        const image = Array.isArray(files["image"]) ? files["image"][0] : files["image"];

        const validatedBody = socialMediaPostSchema.safeParse({ ...body, image });

        if (!validatedBody.success) {
            setCookieOnResponseObject(
                COOKIES_SOCIAL_MEDIA_ERRORS,
                JSON.stringify({
                    inputs: body,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );

            redirectTo(res, `${CREATE_SOCIAL_MEDIA_POST_PAGE_PATH}/${body.disruptionId}/${body.socialMediaPostIndex}}`);
            return;
        }

        if (validatedBody.data.image) {
            const imageContents = await readFile(validatedBody.data.image?.filepath);

            console.log(process.env.IMAGE_BUCKET_NAME);
            await putItem(
                process.env.IMAGE_BUCKET_NAME || "",
                `${session.orgId}#${validatedBody.data.disruptionId}#${
                    validatedBody.data.socialMediaPostIndex
                }.${validatedBody.data.image.type.replace("image/", "")}`,
                imageContents,
            );
        }

        await upsertSocialMediaPost(validatedBody.data, session.orgId);

        destroyCookieOnResponseObject(COOKIES_SOCIAL_MEDIA_ERRORS, res);
        redirectTo(res, `${REVIEW_DISRUPTION_PAGE_PATH}/${body.disruptionId}`);
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
