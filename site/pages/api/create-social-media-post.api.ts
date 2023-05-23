import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_SOCIAL_MEDIA_ERRORS,
    CREATE_SOCIAL_MEDIA_POST_PAGE_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
} from "../../constants/index";
import { upsertSocialMediaPost } from "../../data/dynamo";
import { putItem } from "../../data/s3";
import { SocialMediaPost, imageSchema, socialMediaPostSchema } from "../../schemas/social-media.schema";
import { flattenZodErrors } from "../../utils";
import {
    destroyCookieOnResponseObject,
    redirectTo,
    redirectToError,
    setCookieOnResponseObject,
} from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";

const createSocialMediaPost = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const validatedBody = imageSchema.safeParse(req.body.image);
        console.log(JSON.stringify(validatedBody));
        res.send(JSON.stringify(req.body));

        return;
        // const body = req.body as SocialMediaPost;

        // if (!body.disruptionId) {
        //     throw new Error("No disruptionId found");
        // }

        // if (!process.env.IMAGE_BUCKET_NAME) {
        //     throw new Error("No image bucket to upload image to");
        // }

        // const session = getSession(req);

        // if (!session) {
        //     throw new Error("No session found");
        // }

        // const validatedBody = socialMediaPostSchema.safeParse(body);

        // if (!validatedBody.success) {
        //     setCookieOnResponseObject(
        //         COOKIES_SOCIAL_MEDIA_ERRORS,
        //         JSON.stringify({
        //             inputs: body,
        //             errors: flattenZodErrors(validatedBody.error),
        //         }),
        //         res,
        //     );

        //     redirectTo(res, `${CREATE_SOCIAL_MEDIA_POST_PAGE_PATH}/${body.disruptionId}/${body.socialMediaPostIndex}}`);
        //     return;
        // }
        // await putItem(
        //     process.env.IMAGE_BUCKET_NAME,
        //     `${session.orgId}#${body.disruptionId}#${body.socialMediaPostIndex}.${body.image.type}`,
        //     Buffer.from(body.image, "binary"),
        // );
        // await upsertSocialMediaPost(validatedBody.data, session.orgId);

        // destroyCookieOnResponseObject(COOKIES_SOCIAL_MEDIA_ERRORS, res);
        // redirectTo(res, `${REVIEW_DISRUPTION_PAGE_PATH}/${body.disruptionId}`);
        // return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem creating a social media post.";
            redirectToError(res, message, "api.create-social-media-posy", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default createSocialMediaPost;
