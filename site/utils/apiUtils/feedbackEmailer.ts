import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
import { STAGE } from "../../constants";
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
            ToAddresses: process.env.EMAIL_ADDRESS ? [process.env.EMAIL_ADDRESS] : [],
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
        Source: process.env.EMAIL_ADDRESS,
        SourceArn: process.env.AWS_SES_TEST_IDENTITY,
    });
};

export const createMailTransporter = (): SESClient => {
    return new SESClient({ region: "us-east-1" });
};
