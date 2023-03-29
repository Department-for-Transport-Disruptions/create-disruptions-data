import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
import { AWS_SES_IDENTITY_ARN, FEEDBACK_EMAIL_ADDRESS, STAGE } from "../../constants";
import { Feedback } from "../../interfaces";

export const buildFeedbackContent = (feedbackQuestions: Feedback[]): string => {
    const questionsAndAnswers = feedbackQuestions.map((question) => {
        return `Question: ${question.question}\nAnswer: ${question.answer}`;
    });

    return questionsAndAnswers.join("\n");
};

export const setFeedbackMailOptions = (feedback: Feedback[]): SendEmailCommand => {
    const subject = STAGE === "prod" ? "Feedback received" : `${STAGE} - Feedback received`;

    return new SendEmailCommand({
        Destination: {
            /* required */
            ToAddresses: FEEDBACK_EMAIL_ADDRESS ? [FEEDBACK_EMAIL_ADDRESS] : [],
        },
        Message: {
            /* required */
            Body: {
                /* required */
                Text: {
                    Charset: "UTF-8",
                    Data: buildFeedbackContent(feedback),
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: subject,
            },
        },
        Source: FEEDBACK_EMAIL_ADDRESS,
        SourceArn: AWS_SES_IDENTITY_ARN,
    });
};

export const createMailTransporter = (): SESClient => {
    return new SESClient({ region: "us-east-1" });
};
