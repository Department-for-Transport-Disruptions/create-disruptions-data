import { FilledInputProps } from "@mui/material/FilledInput";
import { InputBaseComponentProps } from "@mui/material/InputBase";
import { OutlinedInputProps } from "@mui/material/OutlinedInput";
import { DatePicker, PickersDay, PickersDayProps } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import kebabCase from "lodash/kebabCase";
import React, { ReactElement, useEffect, useState } from "react";
import { z } from "zod";
import FormElementWrapper, { FormGroupWrapper } from "./FormElementWrapper";
import { ErrorInfo, FormBase } from "../../interfaces";
import { convertDateTimeToFormat, getFormattedDate } from "../../utils/dates";
import { handleBlur } from "../../utils/formUtils";

interface DateSelectorProps<T> extends FormBase<T> {
    disabled: boolean;
    hiddenHint?: string;
    disablePast: boolean;
    reset?: boolean;
}

const inputBox = <T extends object>(
    inputRef: React.Ref<HTMLInputElement> | undefined,
    inputProps: InputBaseComponentProps | undefined,
    InputProps: Partial<FilledInputProps> | Partial<OutlinedInputProps> | undefined,
    inputId: string,
    inputName: Extract<keyof T, string>,
    errors: ErrorInfo[],
    disabled: boolean,
    stateUpdater: (change: string, field: keyof T) => void,
    setErrors: React.Dispatch<React.SetStateAction<ErrorInfo[]>>,
    schema?: z.ZodTypeAny,
) => (
    <div className="govuk-date-input flex items-center [&_.MuiSvgIcon-root]:fill-govBlue">
        <div className="govuk-date-input__item govuk-!-margin-right-0">
            <FormElementWrapper errors={errors} errorId={inputName} errorClass="govuk-input--error">
                <input
                    className="govuk-input govuk-date-input__input govuk-input--width-6"
                    name={inputName}
                    id={`${inputId}-input`}
                    type="text"
                    ref={inputRef}
                    {...inputProps}
                    disabled={disabled}
                    placeholder={disabled ? "N/A" : "DD/MM/YYYY"}
                    onBlur={(e) => handleBlur(e.target.value, inputName, stateUpdater, setErrors, schema, disabled)}
                />
            </FormElementWrapper>
        </div>
        {InputProps?.endAdornment}
    </div>
);

const renderWeekPickerDay = (
    _date: Date,
    _selectedDates: Array<Date | null>,
    pickersDayProps: PickersDayProps<Date>,
) => (
    <PickersDay
        {...pickersDayProps}
        classes={{
            selected: "!bg-govBlue",
            dayWithMargin:
                "focus:!border focus:!border-solid hover:!border hover:!border-solid hover:!border-govBlue focus:!border-govYellow",
        }}
    />
);

const DateSelector = <T extends object>({
    value,
    display,
    displaySize = "s",
    inputName,
    initialErrors = [],
    disabled,
    hiddenHint,
    disablePast,
    stateUpdater,
    schema,
    reset = false,
}: DateSelectorProps<T>): ReactElement => {
    const [dateValue, setDateValue] = useState<Date | null>(
        !!disabled || !value ? null : getFormattedDate(value).toDate(),
    );
    const [errors, setErrors] = useState<ErrorInfo[]>(initialErrors);
    const inputId = kebabCase(inputName);

    useEffect(() => {
        if (disabled || reset) {
            setErrors([]);
            setDateValue(null);
        }
    }, [disabled, reset]);

    useEffect(() => {
        setErrors(initialErrors);
    }, [initialErrors]);

    return (
        <FormGroupWrapper errorIds={[inputName]} errors={errors}>
            <div className="govuk-form-group govuk-!-margin-bottom-0" id={inputId}>
                <label className={`govuk-label govuk-label--${displaySize}`} htmlFor={`${inputId}-input`}>
                    {display}
                </label>
                {hiddenHint ? <div className="govuk-hint govuk-visually-hidden">{hiddenHint}</div> : null}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        renderDay={renderWeekPickerDay}
                        value={dateValue}
                        onChange={(newValue) => {
                            setDateValue(newValue);
                            if (newValue) {
                                stateUpdater(convertDateTimeToFormat(newValue, "DD/MM/YYYY"), inputName);
                            }
                        }}
                        renderInput={({ inputRef, inputProps, InputProps }) => {
                            return inputBox(
                                inputRef,
                                inputProps,
                                InputProps,
                                inputId,
                                inputName,
                                errors,
                                disabled,
                                stateUpdater,
                                setErrors,
                                schema,
                            );
                        }}
                        disablePast={disablePast}
                        inputFormat="DD/MM/YYYY"
                        disabled={disabled}
                    />
                </LocalizationProvider>
            </div>
        </FormGroupWrapper>
    );
};

export default DateSelector;
