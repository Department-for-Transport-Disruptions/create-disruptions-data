import { ReactElement } from "react";
import DateSelector from "./DateSelector";
import TimeSelector from "./TimeSelector";
import { DisruptionInfo, ErrorInfo } from "../interfaces";

interface DisruptionsDateTimeInfoProps {
    isDisruptionValidity: boolean;
    inputs: DisruptionInfo;
    errors?: ErrorInfo[];
}

export const DisruptionsDateTimeInfo = ({
    inputs,
    isDisruptionValidity,
}: DisruptionsDateTimeInfoProps): ReactElement => (
    <>
        <fieldset
            className="govuk-fieldset"
            role="group"
            aria-describedby={`${isDisruptionValidity ? "validity" : "publish"}-start-date-hint`}
        >
            <legend className="govuk-fieldset__legend govuk-!-padding-top-2">
                <h3 className="govuk-heading-s govuk-!-margin-bottom-0">What is the start date?</h3>
            </legend>
            <div id={`${isDisruptionValidity ? "validity" : "publish"}-start-date-hint`} className="govuk-hint">
                Enter in format DD/MM/YYYY
            </div>
            <DateSelector
                errors={[]}
                startOrEnd="start"
                input={!!inputs.validityStartDate ? new Date(inputs.validityStartDate) : null}
                disabled={false}
                isPublishInfo={false}
            />
        </fieldset>
        <fieldset
            className="govuk-fieldset"
            role="group"
            aria-describedby={`${isDisruptionValidity ? "validity" : "publish"}-start-time-hint`}
        >
            <legend className="govuk-fieldset__legend govuk-!-padding-top-8">
                <h3 className="govuk-heading-s govuk-!-margin-bottom-0">What is the start time?</h3>
            </legend>
            <div id={`${isDisruptionValidity ? "validity" : "publish"}-start-time-hint`} className="govuk-hint">
                Enter in format HH:MM
            </div>
            <TimeSelector
                errors={[]}
                startOrEnd="start"
                inputs={{
                    hourInput: isDisruptionValidity ? inputs.validityStartTimeHour : inputs.publishStartTimeHour,
                    minuteInput: isDisruptionValidity ? inputs.validityStartTimeMinute : inputs.publishStartTimeMinute,
                }}
                type={isDisruptionValidity ? "validity" : "publish"}
            />
        </fieldset>
        <fieldset
            className="govuk-fieldset"
            role="group"
            aria-describedby={`${isDisruptionValidity ? "validity" : "publish"}-end-date-hint`}
        >
            <legend className="govuk-fieldset__legend govuk-!-padding-top-8">
                <h3 className="govuk-heading-s govuk-!-margin-bottom-0">What is the end date?</h3>
            </legend>
            <div id={`${isDisruptionValidity ? "validity" : "publish"}-end-date-hint`} className="govuk-hint">
                Enter in format DD/MM/YYYY
            </div>
            <DateSelector
                errors={[]}
                startOrEnd="end"
                input={!!inputs.validityEndDate ? new Date(inputs.validityEndDate) : null}
                disabled={false}
                isPublishInfo
            />
        </fieldset>
        <fieldset
            className="govuk-fieldset"
            role="group"
            aria-describedby={`${isDisruptionValidity ? "validity" : "publish"}-end-time-hint`}
        >
            <legend className="govuk-fieldset__legend govuk-!-padding-top-8">
                <h3 className="govuk-heading-s govuk-!-margin-bottom-0"> What is the end time?</h3>
            </legend>
            <div id={`${isDisruptionValidity ? "validity" : "publish"}-end-time-hint`} className="govuk-hint">
                Enter in format HH:MM
            </div>
            <TimeSelector
                errors={[]}
                startOrEnd="end"
                inputs={{
                    hourInput: isDisruptionValidity ? inputs.validityEndTimeHour : inputs.publishEndTimeHour,
                    minuteInput: isDisruptionValidity ? inputs.validityEndTimeMinute : inputs.publishEndTimeMinute,
                }}
                type={isDisruptionValidity ? "validity" : "publish"}
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
                        id={`${isDisruptionValidity ? "validity" : "publish"}-no-end-date-time`}
                        name={`${isDisruptionValidity ? "validity" : "publish"}IsNoEndDateTime`}
                        type="checkbox"
                        value={`${isDisruptionValidity ? "validity" : "publish"}NoEndDateTime`}
                    />
                    <label
                        className="govuk-label govuk-checkboxes__label"
                        htmlFor={`${isDisruptionValidity ? "validity" : "publish"}-no-end-date-time`}
                    >
                        No end date/time
                    </label>
                </div>
            </div>
        </fieldset>
    </>
);
