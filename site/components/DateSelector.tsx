import React, { ReactElement } from 'react';
import { ErrorInfo } from '../interfaces';
import FormElementWrapper from './FormElementWrapper';
import camelCase from 'lodash/camelCase';
interface DateSelectorProps {
    inputs?: {
        dayInput: string;
        monthInput: string;
        yearInput: string;
    };
    errors?: ErrorInfo[];
    startOrEnd: 'start' | 'end';
    type?: string
}

const DateSelector = ({ inputs, startOrEnd, errors = [], type }: DateSelectorProps): ReactElement => (
    <FormElementWrapper errors={errors} errorId={`${startOrEnd}-day-input`} errorClass="govuk-date-input--error">
        <div className="govuk-date-input" id={`${startOrEnd}-date`}>
            <div className="govuk-date-input__item">
                <div className="govuk-form-group">
                    <label className="govuk-label govuk-date-input__label" htmlFor={`${startOrEnd}-day-input`}>
                        Day
                    </label>
                    <input
                        className={`govuk-input govuk-date-input__input govuk-input--width-2 ${errors.length > 0 ? 'govuk-input--error' : ''
                            } `}
                        id={`${startOrEnd}-day-input`}
                        name={`${startOrEnd}DateDay`}
                        type="text"
                        defaultValue={inputs?.dayInput}
                    />
                </div>
            </div>

            <div className="govuk-date-input__item">
                <div className="govuk-form-group">
                    <label className="govuk-label govuk-date-input__label" htmlFor={`${startOrEnd}-month-input`}>
                        Month
                    </label>
                    <input
                        className={`govuk-input govuk-date-input__input govuk-input--width-2 ${errors.length > 0 ? 'govuk-input--error' : ''
                            } `}
                        id={`${type}-${startOrEnd}-month-input`}
                        name={`${type}${type ? camelCase(startOrEnd) : startOrEnd}DateMonth`}
                        type="text"
                        defaultValue={inputs?.monthInput}
                    />
                </div>
            </div>
            <div className="govuk-date-input__item">
                <div className="govuk-form-group">
                    <label className="govuk-label govuk-date-input__label" htmlFor={`${startOrEnd}-year-input`}>
                        Year
                    </label>
                    <input
                        className={`govuk-input govuk-date-input__input govuk-input--width-4 ${errors.length > 0 ? 'govuk-input--error' : ''
                            } `}
                        id={`$${type}-${startOrEnd}-year-input`}
                        name={`${type}${type ? camelCase(startOrEnd) : startOrEnd}DateYear`}
                        type="text"
                        defaultValue={inputs?.yearInput}
                    />
                </div>
            </div>
        </div>
    </FormElementWrapper>
);

export default DateSelector;
