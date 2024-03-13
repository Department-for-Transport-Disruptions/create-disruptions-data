import { SocialMediaPostStatus } from "@create-disruptions-data/shared-ts/enums";
import { NextApiRequest, NextApiResponse } from "next";
import { readFile } from "fs/promises";
import {
    COOKIES_SOCIAL_MEDIA_ERRORS,
    CREATE_SOCIAL_MEDIA_POST_PAGE_PATH,
    DISRUPTION_DETAIL_PAGE_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
} from "../../constants/index";
import { getOrgSocialAccount, upsertSocialMediaPost } from "../../data/dynamo";
import { putItem } from "../../data/s3";
import { NextdoorAgencyBoundaryInput } from "../../schemas/nextdoor.schema";
import { refineImageSchema, SocialMediaPost } from "../../schemas/social-media.schema";
import { flattenZodErrors } from "../../utils";
import {
    destroyCookieOnResponseObject,
    getReturnPage,
    redirectToError,
    redirectToWithQueryParams,
    setCookieOnResponseObject,
} from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";
import { formParse } from "../../utils/apiUtils/fileUpload";

const formatCreateSocialMediaPostBody = (body: object) => {
    const nextdoorAgencyBoundaries = Object.entries(body)
        .filter((item) => item.toString().startsWith("nextdoorAgencyBoundaries"))
        .map((arr: string[]) => {
            const [, values] = arr;
            return JSON.parse(values) as NextdoorAgencyBoundaryInput[];
        });

    const cleansedBody = Object.fromEntries(
        Object.entries(body).filter((item) => !item.toString().startsWith("nextdoorAgencyBoundaries")),
    );

    return {
        ...cleansedBody,
        nextdoorAgencyBoundaries,
    };
};

const createSocialMediaPost = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const queryParam = getReturnPage(req);

        const { template } = req.query;

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

        const body = JSON.parse(JSON.stringify(fields)) as SocialMediaPost;

        const formattedBody = formatCreateSocialMediaPostBody(body);

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
            ...formattedBody,
            ...(imageFile ? { image: imageFile } : {}),
            display: socialMediaAccountDetail?.display,
            accountType: socialMediaAccountDetail?.accountType,
        });

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

            redirectToWithQueryParams(
                req,
                res,
                template ? ["template"] : [],
                `${CREATE_SOCIAL_MEDIA_POST_PAGE_PATH}/${fields.disruptionId as string}/${
                    fields.socialMediaPostIndex as string
                }`,
                queryParam ? [queryParam] : [],
            );
            return;
        }

        if (validatedBody.data.image) {
            const imageContents = await readFile(validatedBody.data.image?.filepath || "");

            await putItem(
                process.env.IMAGE_BUCKET_NAME || "",
                validatedBody.data.image.key,
                imageContents,
                validatedBody.data.image?.mimetype || "",
            );
        }

        // publishTime and publishDate set to blank to prevent error when creating a disruption (as templates prior had these populated)
        const socialMediaToUpsert =
            template === "true" ||
            validatedBody.data.accountType === "Twitter" ||
            validatedBody.data.accountType === "Nextdoor"
                ? {
                      ...validatedBody.data,
                      publishTime: "",
                      publishDate: "",
                      status:
                          validatedBody.data.status !== SocialMediaPostStatus.rejected
                              ? SocialMediaPostStatus.pending
                              : SocialMediaPostStatus.rejected,
                  }
                : {
                      ...validatedBody.data,
                      status:
                          validatedBody.data.status !== SocialMediaPostStatus.rejected
                              ? SocialMediaPostStatus.pending
                              : SocialMediaPostStatus.rejected,
                  };

        await upsertSocialMediaPost(socialMediaToUpsert, session.orgId, session.isOrgStaff, false, template === "true");

        destroyCookieOnResponseObject(COOKIES_SOCIAL_MEDIA_ERRORS, res);

        const redirectPath =
            queryParam && decodeURIComponent(queryParam).includes(DISRUPTION_DETAIL_PAGE_PATH)
                ? DISRUPTION_DETAIL_PAGE_PATH
                : REVIEW_DISRUPTION_PAGE_PATH;

        redirectToWithQueryParams(
            req,
            res,
            template ? ["template"] : [],
            `${redirectPath}/${validatedBody.data.disruptionId}`,
        );

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
