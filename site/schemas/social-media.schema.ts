import { File } from "formidable";
import { z } from "zod";
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "../constants";
import { setZodDefaultError, zodDate, zodTime } from "../utils";

export const socialMediaPostSchema = z.object({
    disruptionId: z.string().uuid(),
    messageContent: z.string(setZodDefaultError("Enter a message content for this social media post")).min(1).max(200, {
        message: "Message content must not exceed 200 characters",
    }),
    socialAccount: z.string(setZodDefaultError("Select a social account")),
    hootsuiteProfile: z.string(setZodDefaultError("Select a Hootsuite profile")),
    publishDate: zodDate("Enter a publish date for the social media post"),
    publishTime: zodTime("Enter a publish time for the social media post"),
    socialMediaPostIndex: z.coerce.number().default(0),
    image: z.any().optional(),
});

export const refineImageSchema = socialMediaPostSchema
    .transform((item) => ({
        ...item,
        image: {
            filepath: (item.image as File).filepath || "",
            type: (item.image as File).mimetype || "",
            size: (item.image as File).size,
            key: `${item.disruptionId}/${item.socialMediaPostIndex}.${
                item.image ? (item.image as File)?.mimetype?.replace("image/", "") ?? "" : ""
            }`,
        },
    }))
    .refine((item) => {
        console.log(item);
        return item.image && item.image.size ? item.image.size <= MAX_FILE_SIZE : true;
    }, `Max image size is 5MB.`)
    .refine(
        (item) =>
            item.image && item.image.size ? ACCEPTED_IMAGE_TYPES.includes(item.image.type ?? "undefined") : true,
        "Only .jpg, .jpeg and .png formats are supported.",
    );

export type SocialMediaPost = z.infer<typeof socialMediaPostSchema>;

export type SocialMediaPostTransformed = z.infer<typeof refineImageSchema>;
