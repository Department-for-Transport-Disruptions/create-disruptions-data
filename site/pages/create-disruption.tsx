import React, { ReactElement } from "react";
import DateSelector from "components/DateSelector";
import TimeSelector from "components/TimeSelector";
import { BaseLayout } from "components/layout/Layout"
import { DisruptionValidity } from "interfaces";

const title = 'Create Disruptions';
const description = 'Create Disruptions page for the Create Transport Disruptions Service';

interface CreateDisruptionProps {
    inputs: DisruptionValidity
}

const CreateDisruption = ({ inputs }: CreateDisruptionProps): ReactElement => {
    return (
        <BaseLayout title={title} description={description}>
            <>
                <div className="govuk-form-group">
                    <h1 class="govuk-heading-l">
                        When is the disruption?
                    </h1>
                    <fieldset className="govuk-fieldset" role="group" aria-describedby="start-date-hint">
                        <legend className="govuk-fieldset__legend govuk-!-padding-top-2">
                            What is the start date?
                        </legend>
                        <div id="start-date-hint" className="govuk-hint">
                            Enter in format DD/MM/YYYY
                        </div>
                        <DateSelector
                            errors={[]}
                            startOrEnd="start"
                            inputs={{
                                dayInput: inputs.startDateDay,
                                monthInput: inputs.startDateMonth,
                                yearInput: inputs.startDateYear,
                            }}
                        />
                    </fieldset>
                    <fieldset className="govuk-fieldset" role="group" aria-describedby="start-time-hint">
                        <legend className="govuk-fieldset__legend govuk-!-padding-top-4">
                            What is the start time?
                        </legend>
                        <div id="start-time-hint" className="govuk-hint" >
                            Enter in format xxxx
                        </div>
                        <TimeSelector
                            errors={[]}
                            startOrEnd="start"
                            inputs={{
                                hourInput: inputs.startTimeHour,
                                minuteInput: inputs.startTimeMinute
                            }}
                        />
                    </fieldset>
                    <fieldset className="govuk-fieldset" role="group" aria-describedby="end-date-hint">
                        <legend className="govuk-fieldset__legend govuk-!-padding-top-4">
                            What is the end date?
                        </legend>
                        <div id="end-date-hint" className="govuk-hint" >
                            Enter in format DD/MM/YYYY
                        </div>
                        <DateSelector
                            errors={[]}
                            startOrEnd="end"
                            inputs={{
                                dayInput: inputs.startDateDay,
                                monthInput: inputs.startDateMonth,
                                yearInput: inputs.startDateYear,
                            }}
                        />
                    </fieldset>
                    <fieldset className="govuk-fieldset" role="group" aria-describedby="end-time-hint">
                        <legend className="govuk-fieldset__legend govuk-!-padding-top-4">
                            What is the end time?
                        </legend>
                        <div id="end-time-hint" className="govuk-hint" >
                            Enter in format HH:MM
                        </div>
                        <TimeSelector
                            errors={[]}
                            startOrEnd="end"
                            inputs={{
                                hourInput: inputs.endTimeHour,
                                minuteInput: inputs.endTimeMinute
                            }}
                        />
                    </fieldset>
                    <fieldset className="govuk-fieldset" role="group">
                        <div className="govuk-checkboxes flex govuk-checkboxes--small govuk-!-padding-top-4" data-module="govuk-checkboxes">
                            <div className="govuk-checkboxes__item">
                                <input className="govuk-checkboxes__input" id="no-end-date-time" name="noEndDateTime" type="checkbox" value="noEndDateTime" />
                                <label className="govuk-label govuk-checkboxes__label" htmlFor="no-end-date-time">
                                    No end date/time
                                </label>
                            </div>
                        </div>
                    </fieldset>
                    <fieldset className="govuk-fieldset" role="group" aria-describedby="disruption-repeat-hint">
                        <legend className="govuk-fieldset__legend govuk-!-padding-top-4" id="disruption-repeat-hint">
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
                </div>
            </>
        </BaseLayout >
    );
};

export const getServerSideProps = (): { props: object } => {
    let inputs: DisruptionValidity = {
        startDateDay: '',
        startDateMonth: '',
        startDateYear: '',
        endDateDay: '',
        endDateMonth: '',
        endDateYear: '',
        startTimeHour: '',
        startTimeMinute: '',
        endTimeHour: '',
        endTimeMinute: '',
    }

    return ({
        props: { inputs }
    })
};

export default CreateDisruption;
