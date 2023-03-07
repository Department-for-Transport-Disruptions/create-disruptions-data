import { ReactElement } from "react";
import DateSelector from "./DateSelector";
import TimeSelector from "./TimeSelector";
import { DisruptionInfo, ErrorInfo } from "../interfaces";

interface DisruptionsDateTimeInfoProps {
    isDisruption: boolean;
    inputs: DisruptionInfo;
    errors?: ErrorInfo[];
}

export const DisruptionsDateTimeInfo = ({ inputs, isDisruption }: DisruptionsDateTimeInfoProps): ReactElement => (
    <>
        <div className="govuk-form-group govuk-!-margin-bottom-0">
            <label
                className="govuk-label govuk-label--s"
                htmlFor={`${isDisruption ? "disruption" : "publish"}-start-date`}
            >
                What is the start date?
            </label>
            <div className="govuk-hint govuk-visually-hidden">Enter in format DD/MM/YYYY</div>
            <DateSelector
                errors={[]}
                input={!!inputs.disruptionStartDate ? new Date(inputs.disruptionStartDate) : null}
                disabled={false}
                disablePast={false}
                inputId={`${isDisruption ? "disruption" : "publish"}-start-date`}
                inputName={`${isDisruption ? "disruption" : "publish"}StartDate`}
            />
        </div>
        <fieldset
            className="govuk-fieldset"
            role="group"
            aria-describedby={`${isDisruption ? "disruption" : "publish"}-start-time-hint`}
        >
            <legend className="govuk-fieldset__legend govuk-!-padding-top-6">
                <h3 className="govuk-heading-s govuk-!-margin-bottom-0">What is the start time?</h3>
            </legend>
            <div id={`${isDisruption ? "disruption" : "publish"}-start-time-hint`} className="govuk-hint">
                Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm.
            </div>
            <TimeSelector
                errors={[]}
                input={isDisruption ? inputs.publishStartTime : inputs.publishStartTime}
                disabled={false}
                inputId={`${isDisruption ? "disruption" : "publish"}-start-time-input`}
                inputName={`${isDisruption ? "disruption" : "publish"}StartTime`}
            />
        </fieldset>
        <div className="govuk-form-group govuk-!-margin-bottom-0 govuk-!-margin-top-6">
            <label
                className="govuk-label govuk-label--s"
                htmlFor={`${isDisruption ? "disruption" : "publish"}-end-date`}
            >
                What is the end date?
            </label>
            <div className="govuk-hint govuk-visually-hidden">Enter in format DD/MM/YYYY</div>
            <DateSelector
                errors={[]}
                disablePast
                input={!!inputs.disruptionEndDate ? new Date(inputs.disruptionEndDate) : null}
                disabled={false}
                inputId={`${isDisruption ? "disruption" : "publish"}-end-date`}
                inputName={`${isDisruption ? "disruption" : "publish"}EndDate`}
            />
        </div>
        <fieldset
            className="govuk-fieldset"
            role="group"
            aria-describedby={`${isDisruption ? "disruption" : "publish"}-end-time-hint`}
        >
            <legend className="govuk-fieldset__legend govuk-!-padding-top-6">
                <h3 className="govuk-heading-s govuk-!-margin-bottom-0"> What is the end time?</h3>
            </legend>
            <div id={`${isDisruption ? "disruption" : "publish"}-end-time-hint`} className="govuk-hint">
                Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm.
            </div>
            <TimeSelector
                errors={[]}
                input={isDisruption ? inputs.disruptionEndTime : inputs.publishEndTime}
                disabled={false}
                inputId={`${isDisruption ? "disruption" : "publish"}-end-time-input`}
                inputName={`${isDisruption ? "disruption" : "publish"}EndTime`}
            />
        </fieldset>
        <fieldset className="govuk-fieldset" role="group">
            <div
                className="govuk-checkboxes flex govuk-checkboxes--small govuk-!-padding-top-6"
                data-module="govuk-checkboxes"
            >
                <div className="govuk-checkboxes__item">
                    <input
                        className="govuk-checkboxes__input"
                        id={`${isDisruption ? "disruption" : "publish"}-no-end-date-time`}
                        name={`${isDisruption ? "disruption" : "publish"}IsNoEndDateTime`}
                        type="checkbox"
                        value={`${isDisruption ? "disruption" : "publish"}NoEndDateTime`}
                        defaultChecked={
                            isDisruption
                                ? inputs.disruptionIsNoEndDateTime == "disruptionNoEndDateTime"
                                : inputs.publishIsNoEndDateTime == "publishNoEndDateTime"
                        }
                    />
                    <label
                        className="govuk-label govuk-checkboxes__label"
                        htmlFor={`${isDisruption ? "disruption" : "publish"}-no-end-date-time`}
                    >
                        No end date/time
                    </label>
                </div>
            </div>
        </fieldset>
    </>
);
