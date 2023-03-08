import Mail from "nodemailer/lib/mailer";

import { SERVICE_EMAIL_ADDRESS, STAGE } from "../../constants";
import { Feedback } from "../../interfaces";

export const buildFeedbackContent = (feedbackQuestions: Feedback[]): string => {
    const questionsAndAnswers = feedbackQuestions.map((question) => {
        return `Question: ${question.question}\nAnswer: ${question.answer}`;
    });

    return questionsAndAnswers.join("\n");
};

export const setFeedbackMailOptions = (feedbackSubmitterEmailAddress: string, feedback: Feedback[]): Mail.Options => {
    const subject = STAGE === "prod" ? "Feedback received" : `${STAGE} - Feedback received`;
    return {
        from: SERVICE_EMAIL_ADDRESS,
        to: SERVICE_EMAIL_ADDRESS,
        cc: feedbackSubmitterEmailAddress,
        subject: subject,
        text: buildFeedbackContent(feedback),
    };
};
