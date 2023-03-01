import React, { ReactElement } from 'react';
import { ErrorInfo } from '../interfaces';
import FormElementWrapper from './FormElementWrapper';

interface TimeSelectorProps {
    inputs?: {
        hourInput: string;
        minuteInput: string;
    };
    errors?: ErrorInfo[];
    startOrEnd: 'start' | 'end';
}

const TimeSelector = ({ inputs, startOrEnd, errors = [] }: TimeSelectorProps): ReactElement => (
        <FormElementWrapper errors={errors} errorId={`${startOrEnd}-day-input`} errorClass="govuk-date-input--error">
            <div className="govuk-date-input" id={`${startOrEnd}-date`}>
                <div className="govuk-date-input__item">
                    <div className="govuk-form-group">
                        <label className="govuk-label govuk-date-input__label" htmlFor={`${startOrEnd}-hour-input`}>
                            Hour
                        </label>
                        <input
                            className={`govuk-input govuk-date-input__input govuk-input--width-2 ${
                                errors.length > 0 ? 'govuk-input--error' : ''
                            } `}
                            id={`${startOrEnd}-hour-input`}
                            name={`${startOrEnd}Hour`}
                            type="text"
                            defaultValue={inputs?.hourInput}
                        />
                    </div>
                </div>
                <div className="govuk-date-input__item">
                    <div className="govuk-form-group">
                        <label className="govuk-label govuk-date-input__label" htmlFor={`${startOrEnd}-minute-input`}>
                            Minute
                        </label>
                        <input
                            className={`govuk-input govuk-date-input__input govuk-input--width-2 ${
                                errors.length > 0 ? 'govuk-input--error' : ''
                            } `}
                            id={`${startOrEnd}-minute-input`}
                            name={`${startOrEnd}Minute`}
                            type="text"
                            defaultValue={inputs?.minuteInput}
                        />
                    </div>
                </div>
            </div>
        </FormElementWrapper>
);

export default TimeSelector;
