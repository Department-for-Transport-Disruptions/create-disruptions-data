import { ReactElement } from "react";
import { DisruptionsDateTimeInfo } from "../components/DisruptionDateTimeInfo";
import { BaseLayout } from "../components/layout/Layout";
import { DisruptionInfo } from "../interfaces";

const title = "Create Disruptions";
const description = "Create Disruptions page for the Create Transport Disruptions Service";

interface CreateDisruptionProps {
    inputs: DisruptionInfo;
}

const CreateDisruption = ({ inputs }: CreateDisruptionProps): ReactElement => {
    return (
        <BaseLayout title={title} description={description}>
            <>
                <div className="govuk-form-group">
                    <h1 className="govuk-heading-l">When is the disruption?</h1>

                    <DisruptionsDateTimeInfo inputs={inputs} isDisruptionValidity />

                    <fieldset className="govuk-fieldset" role="group" aria-describedby="disruption-repeat-hint">
                        <legend className="govuk-fieldset__legend govuk-!-padding-top-8" id="disruption-repeat-hint">
                            <h3 className="govuk-heading-s govuk-!-margin-bottom-0">Does this disruption repeat?</h3>
                        </legend>
                        <div className="govuk-radios" data-module="govuk-radios">
                            <div className="govuk-radios__item">
                                <input
                                    className="govuk-radios__input"
                                    id="disruption-repeats"
                                    name="disruptionRepeats"
                                    type="radio"
                                    value="yes"
                                />
                                <label className="govuk-label govuk-radios__label" htmlFor="disruption-repeats">
                                    Yes
                                </label>
                            </div>
                            <div className="govuk-radios__item">
                                <input
                                    className="govuk-radios__input"
                                    id="disruption-does-not-repeat"
                                    name="disruptionRepeats"
                                    type="radio"
                                    value="no"
                                />
                                <label className="govuk-label govuk-radios__label" htmlFor="disruption-does-not-repeat">
                                    No
                                </label>
                            </div>
                        </div>
                    </fieldset>

                    <h1 className="govuk-heading-l govuk-!-padding-top-8">
                        When does the disruption need to be published?
                    </h1>

                    <DisruptionsDateTimeInfo inputs={inputs} isDisruptionValidity={false} />

                    <button className="govuk-button mt-8" data-module="govuk-button">
                        Save and continue
                    </button>
                </div>
            </>
        </BaseLayout>
    );
};

export const getServerSideProps = (): { props: object } => {
    const inputs: DisruptionInfo = {
        validityStartDate: "",
        validityEndDate: "",
        validityStartTimeHour: "",
        validityStartTimeMinute: "",
        validityEndTimeHour: "",
        validityEndTimeMinute: "",
        publishStartDate: "",
        publishEndDate: "",
        publishStartTimeHour: "",
        publishStartTimeMinute: "",
        publishEndTimeHour: "",
        publishEndTimeMinute: "",
    };

    return {
        props: { inputs },
    };
};

export default CreateDisruption;
