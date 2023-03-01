import React, { ReactElement } from 'react';
import { DisruptionInfo, ErrorInfo } from "interfaces";
import DateSelector from "./DateSelector";
import TimeSelector from "./TimeSelector";

interface DisruptionsDateTimeInfoProps {
  isDisruptionValidity: boolean;
  inputs: DisruptionInfo;
  errors?: ErrorInfo[];
}


export const DisruptionsDateTimeInfo = ({ inputs, isDisruptionValidity }: DisruptionsDateTimeInfoProps): ReactElement => (
  <>
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
          dayInput: isDisruptionValidity ? inputs.validityStartDateDay : inputs.publishStartDateDay,
          monthInput: isDisruptionValidity ? inputs.validityStartDateMonth : inputs.publishStartDateMonth,
          yearInput: isDisruptionValidity ? inputs.validityStartDateYear : inputs.publishStartDateYear,
        }}
      />
    </fieldset>
    <fieldset className="govuk-fieldset" role="group" aria-describedby="start-time-hint">
      <legend className="govuk-fieldset__legend govuk-!-padding-top-4">
        What is the start time?
      </legend>
      <div id="start-time-hint" className="govuk-hint" >
        Enter in format HH:MM
      </div>
      <TimeSelector
        errors={[]}
        startOrEnd="start"
        inputs={{
          hourInput: isDisruptionValidity ? inputs.validityStartTimeHour : inputs.publishStartTimeHour,
          minuteInput: isDisruptionValidity ? inputs.validityStartTimeMinute : inputs.publishStartTimeMinute
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
          dayInput: isDisruptionValidity ? inputs.validityEndDateDay : inputs.publishEndDateDay,
          monthInput: isDisruptionValidity ? inputs.validityEndDateMonth : inputs.publishEndDateMonth,
          yearInput: isDisruptionValidity ? inputs.validityEndDateYear : inputs.publishEndDateYear,
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
          hourInput: isDisruptionValidity ? inputs.validityEndTimeHour : inputs.publishEndTimeHour,
          minuteInput: isDisruptionValidity ? inputs.validityEndTimeMinute : inputs.publishEndTimeMinute
        }}
      />
    </fieldset>
    <fieldset className="govuk-fieldset" role="group">
      <div className="govuk-checkboxes flex govuk-checkboxes--small govuk-!-padding-top-4" data-module="govuk-checkboxes">
        <div className="govuk-checkboxes__item">
          <input className="govuk-checkboxes__input"
            id={`${isDisruptionValidity ? 'validity' : 'publish'}-no-end-date-time`}
            name={`${isDisruptionValidity ? 'validity' : 'publish'}IsNoEndDateTime`}
            type="checkbox"
            value={`${isDisruptionValidity ? 'validity' : 'publish'}NoEndDateTime`} />
          <label className="govuk-label govuk-checkboxes__label" htmlFor={`${isDisruptionValidity ? 'validity' : 'publish'}-no-end-date-time`}>
            No end date/time
          </label>
        </div>
      </div>
    </fieldset>
  </>
)