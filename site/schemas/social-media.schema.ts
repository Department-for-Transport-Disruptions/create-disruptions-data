import { SocialMediaPostStatus } from "@create-disruptions-data/shared-ts/enums";
import { getDatetimeFromDateAndTime } from "@create-disruptions-data/shared-ts/utils/dates";
import { z } from "zod";
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "../constants";
import { setZodDefaultError } from "../utils";
import { isAtLeast5MinutesAfter } from "../utils/dates";

const socialMediaImageSchema = z.object({
    filepath: z.string(),
    mimetype: z.string(),
    size: z.number(),
    key: z.string(),
    url: z.string().optional(),
    originalFilename: z.string(),
});

const baseSchema = {
    disruptionId: z.string().uuid(),
    messageContent: z.string(setZodDefaultError("Enter a message content for this social media post")).min(1).max(280, {
        message: "Message content must not exceed 280 characters",
    }),
    display: z.string().optional(),
    socialAccount: z.string(setZodDefaultError("Select a social account")),
    socialMediaPostIndex: z.coerce.number().default(0),
    status: z.nativeEnum(SocialMediaPostStatus).default(SocialMediaPostStatus.pending),
    createdByOperatorOrgId: z.string().optional(),
};

const hootsuiteSchema = z.object({
    ...baseSchema,
    hootsuiteProfile: z.string(setZodDefaultError("Select a Hootsuite profile")),
    publishDate: z.string().optional(),
    publishTime: z.string().optional(),
    image: socialMediaImageSchema.optional(),
    accountType: z.literal("Hootsuite"),
});

const twitterSchema = z.object({
    ...baseSchema,
    accountType: z.literal("Twitter"),
});

export const socialMediaPostSchema = z.discriminatedUnion(
    "accountType",
    [hootsuiteSchema, twitterSchema],
    setZodDefaultError("Select a social media profile"),
);

export const refineImageSchema = socialMediaPostSchema
    .refine((item) => (item.accountType === "Hootsuite" ? !!item.hootsuiteProfile : true), {
        path: ["hootsuiteProfile"],
        message: "Select a Hootsuite profile",
    })
    .refine((item) => (item.accountType === "Hootsuite" && !!item.publishTime ? !!item.publishDate : true), {
        path: ["publishDate"],
        message: "Enter a publish date for the social media post",
    })
    .refine((item) => (item.accountType === "Hootsuite" && !!item.publishDate ? !!item.publishTime : true), {
        path: ["publishTime"],
        message: "Enter a publish time for the social media post",
    })
    .refine(
        (item) => {
            return item.accountType === "Hootsuite" && item.image && item.image.size
                ? item.image.size <= MAX_FILE_SIZE
                : true;
        },
        { path: ["image"], message: `Max image size is 5MB.` },
    )
    .refine(
        (item) =>
            item.accountType === "Hootsuite" && item.image && item.image.size
                ? ACCEPTED_IMAGE_TYPES.includes(item.image.mimetype ?? "undefined")
                : true,
        { path: ["image"], message: "Only .jpg, .jpeg and .png formats are supported." },
    )
    .refine(
        (item) =>
            item.accountType === "Hootsuite" && item.publishDate && item.publishTime
                ? isAtLeast5MinutesAfter(getDatetimeFromDateAndTime(item.publishDate, item.publishTime))
                : true,
        {
            path: ["publishDate"],
            message: "Publish date/time must be at least 5 minutes into the future.",
        },
    );

export type SocialMediaPost = z.infer<typeof socialMediaPostSchema>;
export type HootsuitePost = z.infer<typeof hootsuiteSchema>;
export type TwitterPost = z.infer<typeof twitterSchema>;

export type SocialMediaImage = z.infer<typeof socialMediaImageSchema>;

export type SocialMediaPostTransformed = z.infer<typeof refineImageSchema>;
