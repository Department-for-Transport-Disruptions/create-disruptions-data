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
    socialMediaPostIndex: z.number().default(0),
    image: z
        .any()
        .refine((file: File) => file?.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
        .refine(
            (file: File) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
            "Only .jpg, .jpeg, .png and .webp formats are supported.",
        )
        .optional(),
});

export type SocialMediaPost = z.infer<typeof socialMediaPostSchema>;

export interface File {
    size: number;
    type: string;
}
