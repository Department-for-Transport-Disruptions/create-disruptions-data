import { SocialMediaPostStatus } from "@create-disruptions-data/shared-ts/enums";
import { getDatetimeFromDateAndTime } from "@create-disruptions-data/shared-ts/utils/dates";
import { zodDate, zodTime } from "@create-disruptions-data/shared-ts/utils/zod";
import { z } from "zod";
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "../constants";
import { setZodDefaultError } from "../utils";
import { isAtLeast5MinutesAfter } from "../utils/dates";

export const socialMediaPostSchema = z.object({
    disruptionId: z.string().uuid(),
    messageContent: z.string(setZodDefaultError("Enter a message content for this social media post")).min(1).max(200, {
        message: "Message content must not exceed 200 characters",
    }),
    socialAccount: z.string(setZodDefaultError("Select a social account")),
    hootsuiteProfile: z.string(setZodDefaultError("Select a Hootsuite profile")).optional(),
    publishDate: zodDate("Enter a publish date for the social media post").optional(),
    publishTime: zodTime("Enter a publish time for the social media post").optional(),
    socialMediaPostIndex: z.coerce.number().default(0),
    accountType: z.enum(["Twitter", "Hootsuite"]),
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
    .refine((item) => (item.accountType === "Hootsuite" ? !!item.hootsuiteProfile : true), {
        path: ["hootsuiteProfile"],
        message: "Select a Hootsuite profile",
    })
    .refine((item) => (item.accountType === "Hootsuite" ? !!item.publishDate : true), {
        path: ["publishDate"],
        message: "Enter a publish date for the social media post",
    })
    .refine((item) => (item.accountType === "Hootsuite" ? !!item.publishTime : true), {
        path: ["publishTime"],
        message: "Enter a publish time for the social media post",
    })
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
    .refine(
        (item) =>
            item.accountType === "Hootsuite"
                ? item.publishDate &&
                  item.publishTime &&
                  isAtLeast5MinutesAfter(getDatetimeFromDateAndTime(item.publishDate, item.publishTime))
                : true,
        {
            path: ["publishDate"],
            message: "Publish date/time must be at least 5 minutes into the future.",
        },
    );

export type SocialMediaPost = z.infer<typeof socialMediaPostSchema>;

export type SocialMediaPostTransformed = z.infer<typeof refineImageSchema>;
