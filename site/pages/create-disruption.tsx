import { BaseLayout } from "components/layout/Layout"

const title = 'Create Disruptions';
const description = 'Create Disruptions page for the Create Transport Disruptions Service';

const CreateDisruption = () => {
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
                        <legend className="govuk-fieldset__legend">
                            What is the start date?
                        </legend>
                        <div id="start-date-hint" className="govuk-hint">
                            Enter in format DD/MM/YYYY
                        </div>
                        <div className="govuk-date-input" id="start-date">
                            <div className="govuk-date-input__item">
                                <div className="govuk-form-group">
                                    <label className="govuk-label govuk-date-input__label" htmlFor="start-date-day-input">
                                        Day
                                    </label>
                                    <input
                                        className="govuk-input govuk-date-input__input govuk-input--width-2"
                                        id="start-date-day-input"
                                        name="startDateDay"
                                        type="text"
                                    />
                                </div>
                            </div>
                            <div className="govuk-date-input__item">
                                <div className="govuk-form-group">
                                    <label className="govuk-label govuk-date-input__label" htmlFor="start-date-month-input">
                                        Month
                                    </label>
                                    <input
                                        className="govuk-input govuk-date-input__input govuk-input--width-2"
                                        id="start-date-month-input"
                                        name="startDateMonth"
                                        type="text"
                                    />
                                </div>
                            </div>
                            <div className="govuk-date-input__item">
                                <div className="govuk-form-group">
                                    <label className="govuk-label govuk-date-input__label" htmlFor="start-date-year-input">
                                        Year
                                    </label>
                                    <input
                                        className="govuk-input govuk-date-input__input govuk-input--width-2"
                                        id="start-date-year-input"
                                        name="startDateYear"
                                        type="text"
                                    />
                                </div>
                            </div>
                        </div>

                        <legend className="govuk-fieldset__legend">
                            What is the start time?
                        </legend>
                        <div id="start-time-hint" className="govuk-hint">
                            Enter in format xxxx
                        </div>
                        <div className="govuk-date-input" id="start-time">
                            <div className="govuk-date-input__item">
                                <div className="govuk-form-group">
                                    <label className="govuk-label govuk-date-input__label" htmlFor="start-time-hours-input">
                                        Hours
                                    </label>
                                    <input
                                        className="govuk-input govuk-date-input__input govuk-input--width-2"
                                        id="start-time-hours-input"
                                        name="startTimeHours"
                                        type="text"
                                    />
                                </div>
                            </div>
                            <div className="govuk-date-input__item">
                                <div className="govuk-form-group">
                                    <label className="govuk-label govuk-date-input__label" htmlFor="start-time-minute-input">
                                        Minute
                                    </label>
                                    <input
                                        className="govuk-input govuk-date-input__input govuk-input--width-2"
                                        id="start-time-minute-input"
                                        name="startTimeMinute"
                                        type="text"
                                    />
                                </div>
                            </div>
                        </div>

                        <legend className="govuk-fieldset__legend">
                            What is the end date?
                        </legend>
                        <div id="end-date-hint" className="govuk-hint">
                            Enter in format DD/MM/YYYY
                        </div>
                        <div className="govuk-date-input" id="end-date">
                            <div className="govuk-date-input__item">
                                <div className="govuk-form-group">
                                    <label className="govuk-label govuk-date-input__label" htmlFor="end-date-day-input">
                                        Day
                                    </label>
                                    <input
                                        className="govuk-input govuk-date-input__input govuk-input--width-2"
                                        id="end-date-day-input"
                                        name="endDateDay"
                                        type="text"
                                    />
                                </div>
                            </div>
                            <div className="govuk-date-input__item">
                                <div className="govuk-form-group">
                                    <label className="govuk-label govuk-date-input__label" htmlFor="end-date-month-input">
                                        Month
                                    </label>
                                    <input
                                        className="govuk-input govuk-date-input__input govuk-input--width-2"
                                        id="end-date-month-input"
                                        name="endDateMonth"
                                        type="text"
                                    />
                                </div>
                            </div>
                            <div className="govuk-date-input__item">
                                <div className="govuk-form-group">
                                    <label className="govuk-label govuk-date-input__label" htmlFor="end-date-year-input">
                                        Year
                                    </label>
                                    <input
                                        className="govuk-input govuk-date-input__input govuk-input--width-2"
                                        id="end-date-year-input"
                                        name="endDateYear"
                                        type="text"
                                    />
                                </div>
                            </div>
                        </div>

                        <legend className="govuk-fieldset__legend">
                            What is the end time?
                        </legend>
                        <div id="end-time-hint" className="govuk-hint">
                            Enter in format xxxx
                        </div>
                        <div className="govuk-date-input" id="end-time">
                            <div className="govuk-date-input__item">
                                <div className="govuk-form-group">
                                    <label className="govuk-label govuk-date-input__label" htmlFor="end-time-hours-input">
                                        Hours
                                    </label>
                                    <input
                                        className="govuk-input govuk-date-input__input govuk-input--width-2"
                                        id="end-time-hours-input"
                                        name="endTimeHours"
                                        type="text"
                                    />
                                </div>
                            </div>
                            <div className="govuk-date-input__item">
                                <div className="govuk-form-group">
                                    <label className="govuk-label govuk-date-input__label" htmlFor="end-time-minute-input">
                                        Minute
                                    </label>
                                    <input
                                        className="govuk-input govuk-date-input__input govuk-input--width-2"
                                        id="end-time-minute-input"
                                        name="endTimeMinute"
                                        type="text"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="govuk-checkboxes mb-5 flex govuk-checkboxes--small" data-module="govuk-checkboxes">
                            <div className="govuk-checkboxes__item">
                                <input className="govuk-checkboxes__input" id="no-end-date" name="noEndDate" type="checkbox" value="noEndDate" />
                                <label className="govuk-label govuk-checkboxes__label" htmlFor="no-end-date">
                                    No end date
                                </label>
                            </div>
                        </div>

                        <legend className="govuk-fieldset__legend">
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
        </BaseLayout>
    );
};

export const getServerSideProps = (): { props: object } => ({
    props: {},
});

export default CreateDisruption;
