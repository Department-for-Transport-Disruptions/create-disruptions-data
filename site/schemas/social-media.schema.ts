import { SocialMediaPostStatus } from "@create-disruptions-data/shared-ts/enums";
import { z } from "zod";
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "../constants";
import { setZodDefaultError, zodDate, zodTime } from "../utils";
import { getDatetimeFromDateAndTime } from "../utils/dates";

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
    image: z
        .object({
            filepath: z.string(),
            mimetype: z.string(),
            size: z.number(),
            key: z.string(),
            url: z.string().optional(),
            originalFilename: z.string(),
        })
        .optional(),
    status: z.nativeEnum(SocialMediaPostStatus).default(SocialMediaPostStatus.pending),
});

export const refineImageSchema = socialMediaPostSchema
    .refine(
        (item) => {
            return item.image && item.image.size ? item.image.size <= MAX_FILE_SIZE : true;
        },
        { path: ["image"], message: `Max image size is 5MB.` },
    )
    .refine(
        (item) =>
            item.image && item.image.size ? ACCEPTED_IMAGE_TYPES.includes(item.image.mimetype ?? "undefined") : true,
        { path: ["image"], message: "Only .jpg, .jpeg and .png formats are supported." },
    )
    .refine((item) => getDatetimeFromDateAndTime(item.publishDate, item.publishTime).isSameOrAfter(new Date()), {
        path: ["publishDate"],
        message: "Publish date/time must be in the future.",
    });

export type SocialMediaPost = z.infer<typeof socialMediaPostSchema>;

export type SocialMediaPostTransformed = z.infer<typeof refineImageSchema>;
