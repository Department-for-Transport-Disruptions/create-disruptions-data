import React, { ReactElement } from 'react';
import { DisruptionInfo, ErrorInfo } from "interfaces";
import DateSelector from "./DateSelector";
import TimeSelector from "./TimeSelector";

interface DisruptionsDateTimeInfoProps {
  isDisruptionValidity: boolean;
  inputs?: DisruptionInfo;
  errors?: ErrorInfo[];
}


export const DisruptionsDateTimeInfo = ({ inputs, isDisruptionValidity }: DisruptionsDateTimeInfoProps): ReactElement => (
  <>
    <legend className="govuk-fieldset__legend govuk-!-padding-top-4">
      What is the start date?
    </legend>
    <div id="start-date-hint" className="govuk-hint">
      Enter in format DD/MM/YYYY
    </div>
    <DateSelector
      errors={[]}
      startOrEnd="start"
      inputs={{
        dayInput: isDisruptionValidity ? inputs.validityStartDateDay : inputs.publishStartDateDay,
        monthInput: isDisruptionValidity ? inputs.validityStartDateMonth : inputs.publishStartDateMonth,
        yearInput: isDisruptionValidity ? inputs.validityStartDateYear : inputs.publishStartDateYear,
      }}
    />

    <legend className="govuk-fieldset__legend govuk-!-padding-top-4">
      What is the start time?
    </legend>
    <div id="start-time-hint" className="govuk-hint">
      Enter in format xxxx
    </div>
    <TimeSelector
      errors={[]}
      startOrEnd="start"
      inputs={{
        hoursInput: isDisruptionValidity ? inputs.validityStartTimeHours : inputs.publishStartTimeHours,
        minuteInput: isDisruptionValidity ? inputs.validityStartTimeMinute : inputs.publishStartTimeMinute
      }}
    />

    <legend className="govuk-fieldset__legend govuk-!-padding-top-4">
      What is the end date?
    </legend>
    <div id="end-date-hint" className="govuk-hint">
      Enter in format DD/MM/YYYY
    </div>
    <DateSelector
      errors={[]}
      startOrEnd="end"
      inputs={{
        dayInput: isDisruptionValidity ? inputs.validityEndDateDay : inputs.publishEndDateDay,
        monthInput: isDisruptionValidity ? inputs.validityEndDateMonth : inputs.publishEndDateMonth,
        yearInput: isDisruptionValidity ? inputs.validityEndDateYear : inputs.publishEndDateYear,
      }}
    />

    <legend className="govuk-fieldset__legend govuk-!-padding-top-4">
      What is the end time?
    </legend>
    <div id="end-time-hint" className="govuk-hint">
      Enter in format xxxx
    </div>
    <TimeSelector
      errors={[]}
      startOrEnd="end"
      inputs={{
        hoursInput: isDisruptionValidity ? inputs.validityEndTimeHours : inputs.publishEndTimeHours,
        minuteInput: isDisruptionValidity ? inputs.validityEndTimeMinute : inputs.publishEndTimeMinute
      }}
    />
    <div className="govuk-checkboxes flex govuk-checkboxes--small govuk-!-padding-top-4" data-module="govuk-checkboxes">
      <div className="govuk-checkboxes__item">
        <input className="govuk-checkboxes__input" id="no-end-date" name="noEndDate" type="checkbox" value="noEndDate" />
        <label className="govuk-label govuk-checkboxes__label" htmlFor="no-end-date">
          No end date
        </label>
      </div>
    </div>
  </>
)