import React, { ReactElement } from 'react';
import { ErrorInfo } from '../interfaces';
import FormElementWrapper from './FormElementWrapper';
import camelCase from 'lodash/camelCase';
interface TimeSelectorProps {
    inputs?: {
        hourInput: string;
        minuteInput: string;
    };
    errors?: ErrorInfo[];
    startOrEnd: 'start' | 'end';
    type?: string
}

const TimeSelector = ({ inputs, startOrEnd, errors = [], type }: TimeSelectorProps): ReactElement => (
    <FormElementWrapper errors={errors} errorId={`${startOrEnd}-day-input`} errorClass="govuk-date-input--error">
        <div className="govuk-date-input" id={`${startOrEnd}-date`}>
            <div className="govuk-date-input__item">
                <div className="govuk-form-group">
                    <label className="govuk-label govuk-date-input__label" htmlFor={`${type}-${startOrEnd}-hour-input`}>
                        Hour
                    </label>
                    <input
                        className={`govuk-input govuk-date-input__input govuk-input--width-2 ${errors.length > 0 ? 'govuk-input--error' : ''
                            } `}
                        id={`${type}-${startOrEnd}-hour-input`}
                        name={`${type}${type ? camelCase(startOrEnd) : startOrEnd}Hour`}
                        type="text"
                        defaultValue={inputs?.hourInput}
                    />
                </div>
            </div>
            <div className="govuk-date-input__item">
                <div className="govuk-form-group">
                    <label className="govuk-label govuk-date-input__label" htmlFor={`${type}-${startOrEnd}-minute-input`}>
                        Minute
                    </label>
                    <input
                        className={`govuk-input govuk-date-input__input govuk-input--width-2 ${errors.length > 0 ? 'govuk-input--error' : ''
                            } `}
                        id={`${type}-${startOrEnd}-minute-input`}
                        name={`${type}${type ? camelCase(startOrEnd) : startOrEnd}Minute`}
                        type="text"
                        defaultValue={inputs?.minuteInput}
                    />
                </div>
            </div>
        </div>
    </FormElementWrapper>
);

export default TimeSelector;
