import { ReactElement } from "react";
import ErrorSummary from "../components/ErrorSummary";
import CsrfForm from "../components/form/CsrfForm";
import DateSelector from "../components/form/DateSelector";
import Select from "../components/form/Select";
import TextInput from "../components/form/TextInput";
import TimeSelector from "../components/form/TimeSelector";
import { BaseLayout } from "../components/layout/Layout";
import { SocialMedia, socialMediaSchema } from "../schemas/social-media.schema";

const title = "Social media message";
const description = "Social media message page for the Create Transport Disruptions Service";

const SocialMediaPosts = (): ReactElement => {
    return (
        <BaseLayout title={title} description={description} errors={[]}>
            <CsrfForm action="/api/social-media" method="post" csrfToken={""}>
                <>
                    <ErrorSummary errors={[]} />
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">Social media message</h1>

                        <TextInput<SocialMedia>
                            display="Message content"
                            inputName="messageContent"
                            widthClass="w-3/4"
                            displaySize="l"
                            textArea
                            rows={3}
                            hint={"You can enter up to 200 characters"}
                            maxLength={500}
                            stateUpdater={() => {
                                ("");
                            }}
                            value={""}
                            initialErrors={[]}
                            schema={socialMediaSchema.shape.messageContent}
                        />

                        <button className="mt-3 govuk-link" data-module="govuk-button">
                            <p className="text-govBlue govuk-body-m">Copy from disruption summary</p>
                        </button>

                        <br />

                        <button className="govuk-button mt-8 govuk-button--secondary" data-module="govuk-button">
                            Upload image
                        </button>
                    </div>
                    <div className="govuk-form-group">
                        <h2 className="govuk-heading-l">Publish time and date</h2>

                        <DateSelector<SocialMedia>
                            display="Date"
                            hint="Enter in format DD/MM/YYYY"
                            value={""}
                            disabled={false}
                            disablePast={false}
                            inputName="publishDate"
                            stateUpdater={() => {
                                ("");
                            }}
                            initialErrors={[]}
                            schema={socialMediaSchema.shape.publishDate}
                        />

                        <TimeSelector<SocialMedia>
                            display="Time"
                            hint="Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm"
                            value={""}
                            disabled={false}
                            inputName="publishTime"
                            stateUpdater={() => {
                                ("");
                            }}
                            initialErrors={[]}
                            schema={socialMediaSchema.shape.publishTime}
                        />

                        <div className="govuk-form-group govuk-!-padding-top-3">
                            <h2 className="govuk-heading-l">Select social media account</h2>

                            <Select<SocialMedia>
                                inputName="socialAccount"
                                selectValues={[]}
                                defaultDisplay="Social account"
                                stateUpdater={() => {
                                    ("");
                                }}
                                value={""}
                                initialErrors={[]}
                                schema={socialMediaSchema.shape.socialAccount}
                                displaySize="l"
                                display={""}
                            />
                            <Select<SocialMedia>
                                inputName="hootsuiteProfile"
                                defaultDisplay="Social account"
                                hint={"Select Hootsuite profile"}
                                display={""}
                                selectValues={[]}
                                stateUpdater={() => {
                                    ("");
                                }}
                                value={""}
                                initialErrors={[]}
                                schema={socialMediaSchema.shape.hootsuiteProfile}
                                displaySize="l"
                            />
                        </div>
                        <input type="hidden" name="disruptionId" value={""} />

                        <button className="govuk-button mt-8" data-module="govuk-button">
                            Save and continue
                        </button>
                    </div>
                </>
            </CsrfForm>
        </BaseLayout>
    );
};

export default SocialMediaPosts;
