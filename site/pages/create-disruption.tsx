import React, { ReactElement } from "react";
import { BaseLayout } from "components/layout/Layout"
import { DisruptionInfo } from "interfaces";
import { DisruptionsDateTimeInfo } from "components/DisruptionDateTimeInfo";

const title = 'Create Disruptions';
const description = 'Create Disruptions page for the Create Transport Disruptions Service';

interface CreateDisruptionProps {
    inputs: DisruptionInfo
}

const CreateDisruption = ({ inputs }: CreateDisruptionProps): ReactElement => {
    return (
        <BaseLayout title={title} description={description}>
            <>
                <div className="govuk-form-group">
                    <fieldset className="govuk-fieldset" role="group" aria-describedby="when-is-the-disruption">
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                            <h1 className="govuk-fieldset__heading">
                                When is the disruption?
                            </h1>
                        </legend>

                        <DisruptionsDateTimeInfo inputs={inputs} isDisruptionValidity />
                        <legend className="govuk-fieldset__legend govuk-!-padding-top-4">
                            Does this disruption repeat?
                        </legend>
                        <div className="govuk-radios" data-module="govuk-radios">
                            <div className="govuk-radios__item">
                                <input className="govuk-radios__input" id="disruption-repeats" name="disruptionRepeats" type="radio" value="yes" />
                                <label className="govuk-label govuk-radios__label" htmlFor="disruption-repeats">
                                    Yes
                                </label>
                            </div>
                            <div className="govuk-radios__item">
                                <input className="govuk-radios__input" id="disruption-does-not-repeat" name="disruptionRepeats" type="radio" value="no" />
                                <label className="govuk-label govuk-radios__label" htmlFor="disruption-does-not-repeat">
                                    No
                                </label>
                            </div>
                        </div>
                    </fieldset>
                    <fieldset className="govuk-fieldset" role="group" aria-describedby="disruption-need-to-be-published">
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                            <h1 className="govuk-fieldset__heading  govuk-!-padding-top-8">
                                When does the disruption need to be published?
                            </h1>
                        </legend>
                        <DisruptionsDateTimeInfo inputs={inputs} isDisruptionValidity={false} />
                    </fieldset>
                    <button className="govuk-button mt-8" data-module="govuk-button">
                        Save and continue
                    </button>
                </div>
            </>
        </BaseLayout>
    );
};

export const getServerSideProps = (): { props: object } => {
    let inputs: DisruptionInfo = {
        validityStartDateDay: '',
        validityStartDateMonth: '',
        validityStartDateYear: '',
        validityEndDateDay: '',
        validityEndDateMonth: '',
        validityEndDateYear: '',
        validityStartTimeHours: '',
        validityStartTimeMinute: '',
        validityEndTimeHours: '',
        validityEndTimeMinute: '',
        publishStartDateDay: '',
        publishStartDateMonth: '',
        publishStartDateYear: '',
        publishEndDateDay: '',
        publishEndDateMonth: '',
        publishEndDateYear: '',
        publishStartTimeHours: '',
        publishStartTimeMinute: '',
        publishEndTimeHours: '',
        publishEndTimeMinute: '',
    }

    return ({
        props: { inputs }
    })
};

export default CreateDisruption;
