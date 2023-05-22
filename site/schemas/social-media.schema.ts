import { z } from "zod";
import { setZodDefaultError, zodDate, zodTime } from "../utils";

export const socialMediaPostSchema = z.object({
    disruptionId: z.string().uuid(),
    messageContent: z.string(setZodDefaultError("Enter a message content for this social media post")).min(1).max(200, {
        message: "Message content must not exceed 200 characters",
    }),
    socialAccount: z.string(),
    hootsuiteProfile: z.string(),
    publishDate: zodDate("Enter a publish date for the social media post"),
    publishTime: zodTime("Enter a publish time for the social media post"),
});

export type SocialMediaPost = z.infer<typeof socialMediaPostSchema>;
