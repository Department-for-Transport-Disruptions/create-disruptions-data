import { PublishStatus, SocialMediaPostStatus } from "@create-disruptions-data/shared-ts/enums";
import { NextApiRequest, NextApiResponse } from "next";
import { readFile } from "fs/promises";
import {
    COOKIES_TEMPLATE_SOCIAL_MEDIA_ERRORS,
    CREATE_TEMPLATE_SOCIAL_MEDIA_POST_PAGE_PATH,
    REVIEW_TEMPLATE_PAGE_PATH,
    TEMPLATE_OVERVIEW_PAGE_PATH,
} from "../../constants/index";
import { getOrgSocialAccount, upsertSocialMediaPost } from "../../data/dynamo";
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

        if (!fields) {
            throw new Error("No form fields parsed");
        }

        const socialMediaAccountDetail = await getOrgSocialAccount(session.orgId, fields.socialAccount?.toString());

        const imageFile =
            files[0] && files[0].size
                ? {
                      ...files[0],
                      key: `${session.orgId}/${fields.disruptionId as string}/${
                          fields.socialMediaPostIndex as string
                      }.${files[0].mimetype?.replace("image/", "") ?? ""}`,
                  }
                : null;

        const validatedBody = refineImageSchema.safeParse({
            ...fields,
            ...(imageFile ? { image: imageFile } : {}),
            display: socialMediaAccountDetail?.display,
            accountType: socialMediaAccountDetail?.accountType,
        });

        if (!validatedBody.success) {
            setCookieOnResponseObject(
                COOKIES_TEMPLATE_SOCIAL_MEDIA_ERRORS,
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
                `${CREATE_TEMPLATE_SOCIAL_MEDIA_POST_PAGE_PATH}/${fields.disruptionId as string}/${
                    fields.socialMediaPostIndex as string
                }`,
            );
            return;
        }

        if (validatedBody.data.accountType === "Hootsuite" && validatedBody.data.image) {
            const imageContents = await readFile(validatedBody.data.image?.filepath || "");

            await putItem(process.env.IMAGE_BUCKET_NAME || "", validatedBody.data.image.key, imageContents);
        }

        // publishTime and publishDate set to blank to prevent error when creating a disruption (as templates prior had these populated)
        const socialMediaToUpsert = {
            ...validatedBody.data,
            publishTime: "",
            publishDate: "",
            status:
                validatedBody.data.status !== SocialMediaPostStatus.rejected
                    ? SocialMediaPostStatus.pending
                    : SocialMediaPostStatus.rejected,
        };

        const template = await upsertSocialMediaPost(
            socialMediaToUpsert,
            session.orgId,
            session.isOrgStaff,
            false,
            true,
        );

        destroyCookieOnResponseObject(COOKIES_TEMPLATE_SOCIAL_MEDIA_ERRORS, res);

        const redirectPath =
            template?.publishStatus !== PublishStatus.draft ? TEMPLATE_OVERVIEW_PAGE_PATH : REVIEW_TEMPLATE_PAGE_PATH;

        redirectTo(res, `${redirectPath}/${validatedBody.data.disruptionId}`);

        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem creating a template social media post.";
            redirectToError(res, message, "api.create-template-social-media-post", e);
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
