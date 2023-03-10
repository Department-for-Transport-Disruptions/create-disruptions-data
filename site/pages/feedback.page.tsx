import { NextPageContext } from "next";
import Link from "next/link";
import { ReactElement } from "react";
import CsrfForm from "../components/CsrfForm";
import { TwoThirdsLayout } from "../components/layout/Layout";
import {
    CONTACT_FEEDBACK_QUESTION,
    SOLVE_FEEDBACK_QUESTION,
    HEAR_ABOUT_US_FEEDBACK_QUESTION,
    GENERAL_FEEDBACK_QUESTION,
} from "../constants";
import { getCsrfToken } from "../utils";

const title = "Feedback - Create Transport Disruption Data Service";
const description = "Feedback page of the Create Transport Disruption Data Service";

interface FeedbackProps {
    csrfToken: string;
    feedbackSubmitted: "submitted" | "not submitted" | "false";
}

const createFeedbackBox = (option: "submitted" | "not submitted"): ReactElement => (
    <div
        className={
            option === "submitted"
                ? "block p-5 mb-12.5 border-4 border-govGreen"
                : "block p-5 mb-12.5 border-4 border-govRed"
        }
    >
        <h2 className="govuk-heading-m">Your feedback was {option}</h2>
        <p className="govuk-body">
            {option === "submitted"
                ? "Thank you for taking the time to improve the service"
                : "The feedback form was empty, at least one question has to be answered"}
        </p>
        <p className="govuk-body">
            <Link className="govuk-link" href="/">
                Click here to return to the homepage
            </Link>
        </p>
    </div>
);

const Feedback = ({ csrfToken, feedbackSubmitted }: FeedbackProps): ReactElement => (
    <TwoThirdsLayout title={title} description={description} errors={[]}>
        <CsrfForm action="/api/feedback" method="post" csrfToken={csrfToken}>
            <>
                {feedbackSubmitted !== "false" ? createFeedbackBox(feedbackSubmitted) : null}
                <h1 className="govuk-heading-l">Help us improve Create Transport Disruption Data</h1>
                <span className="govuk-hint">
                    Thank you for providing feedback and comments. Answer any questions which apply to your experience
                    using Create Transport Disruption Data, and be as specific as possible
                </span>

                <div className="govuk-!-padding-top-3">
                    <fieldset className="govuk-fieldset" aria-describedby="hear-about-service-header">
                        <legend
                            className="govuk-fieldset__legend govuk-fieldset__legend--m"
                            id="hear-about-service-header"
                        >
                            {HEAR_ABOUT_US_FEEDBACK_QUESTION}
                        </legend>
                        <textarea
                            className="govuk-textarea"
                            id="hear-about-service-question"
                            name="hearAboutServiceQuestion"
                            rows={3}
                        />
                    </fieldset>
                </div>

                <div>
                    <fieldset className="govuk-fieldset" aria-describedby="general-feedback-header">
                        <legend
                            className="govuk-fieldset__legend govuk-fieldset__legend--m"
                            id="general-feedback-header"
                        >
                            {GENERAL_FEEDBACK_QUESTION}
                        </legend>
                        <textarea
                            className="govuk-textarea"
                            id="general-feedback-question"
                            name="generalFeedbackQuestion"
                            rows={6}
                        />
                    </fieldset>
                </div>

                <div className="govuk-!-padding-bottom-3">
                    <fieldset className="govuk-fieldset" aria-describedby="contact-header">
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--m" id="contact-header">
                            {CONTACT_FEEDBACK_QUESTION}
                        </legend>
                        <div className="govuk-radios" id="contact-radios">
                            <div className="govuk-radios__item">
                                <input
                                    className="govuk-radios__input"
                                    id="contact-question-yes"
                                    name="contactQuestion"
                                    type="radio"
                                    value="Yes"
                                />
                                <label className="govuk-label govuk-radios__label" htmlFor="contact-question-yes">
                                    Yes
                                </label>
                            </div>
                            <div className="govuk-radios__item">
                                <input
                                    className="govuk-radios__input"
                                    id="contact-question-no"
                                    name="contactQuestion"
                                    type="radio"
                                    value="No"
                                />
                                <label className="govuk-label govuk-radios__label" htmlFor="contact-question-no">
                                    No
                                </label>
                            </div>
                        </div>
                    </fieldset>
                </div>

                <div className="govuk-!-padding-bottom-6">
                    <fieldset className="govuk-fieldset" aria-describedby="problem-header">
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--m" id="problem-header">
                            {SOLVE_FEEDBACK_QUESTION}
                        </legend>
                        <div className="govuk-radios" id="problem-radios">
                            <div className="govuk-radios__item">
                                <input
                                    className="govuk-radios__input"
                                    id="problem-question-yes"
                                    name="problemQuestion"
                                    type="radio"
                                    value="Yes"
                                />
                                <label className="govuk-label govuk-radios__label" htmlFor="problem-question-yes">
                                    Yes
                                </label>
                            </div>
                            <div className="govuk-radios__item">
                                <input
                                    className="govuk-radios__input"
                                    id="problem-question-no"
                                    name="problemQuestion"
                                    type="radio"
                                    value="No"
                                />
                                <label className="govuk-label govuk-radios__label" htmlFor="problem-question-no">
                                    No
                                </label>
                            </div>
                        </div>
                    </fieldset>
                </div>
                <button id="continue-button" className="govuk-button" data-module="govuk-button">
                    Submit
                </button>
            </>
        </CsrfForm>
    </TwoThirdsLayout>
);

export const getServerSideProps = (ctx: NextPageContext): { props: FeedbackProps } => {
    const csrfToken = getCsrfToken(ctx);
    const feedbackSubmittedQueryString = ctx.query?.feedbackSubmitted;
    let feedbackSubmitted: "submitted" | "not submitted" | "false" = "false";
    if (feedbackSubmittedQueryString) {
        feedbackSubmitted = feedbackSubmittedQueryString === "true" ? "submitted" : "not submitted";
    }
    return {
        props: {
            feedbackSubmitted,
            csrfToken,
        },
    };
};

export default Feedback;
