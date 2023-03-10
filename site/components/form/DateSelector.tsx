import { FilledInputProps } from "@mui/material/FilledInput";
import { InputBaseComponentProps } from "@mui/material/InputBase";
import { OutlinedInputProps } from "@mui/material/OutlinedInput";
import { DatePicker, PickersDay, PickersDayProps } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import React, { ReactElement, useState } from "react";
import FormElementWrapper, { FormGroupWrapper } from "./FormElementWrapper";
import { ErrorInfo, FormBase } from "../../interfaces";
import { handleBlur } from "../../utils/formUtils";

interface DateSelectorProps<T> extends FormBase<T> {
    disabled: boolean;
    hiddenHint?: string;
    disablePast: boolean;
}

const inputBox = <T extends object>(
    inputRef: React.Ref<HTMLInputElement> | undefined,
    inputProps: InputBaseComponentProps | undefined,
    InputProps: Partial<FilledInputProps> | Partial<OutlinedInputProps> | undefined,
    inputId: Extract<keyof T, string>,
    inputName: string,
    errorMessage: string,
    errors: ErrorInfo[],
    disabled: boolean,
    optional: boolean,
    stateUpdater: (change: string, field: keyof T) => void,
    setErrors: React.Dispatch<React.SetStateAction<ErrorInfo[]>>,
) => (
    <div className="govuk-date-input flex items-center [&_.MuiSvgIcon-root]:fill-govBlue">
        <div className="govuk-date-input__item govuk-!-margin-right-0">
            <FormElementWrapper errors={errors} errorId={inputId} errorClass="govuk-input--error">
                <input
                    className="govuk-input govuk-date-input__input govuk-input--width-6"
                    id={inputId}
                    name={inputName}
                    type="text"
                    ref={inputRef}
                    {...inputProps}
                    disabled={disabled}
                    placeholder={disabled ? "N/A" : "DD/MM/YYYY"}
                    onBlur={(e) => handleBlur(e.target.value, inputId, errorMessage, stateUpdater, setErrors, optional)}
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
    inputId,
    display,
    displaySize = "s",
    inputName,
    errorMessage = "",
    initialErrors = [],
    disabled,
    hiddenHint,
    optional = false,
    disablePast,
    stateUpdater,
}: DateSelectorProps<T>): ReactElement => {
    const [dateValue, setDateValue] = useState<Date | null>(!!disabled || !value ? null : new Date(value));
    const [errors, setErrors] = useState<ErrorInfo[]>(initialErrors);

    return (
        <FormGroupWrapper errorIds={[inputId]} errors={errors}>
            <div className="govuk-form-group govuk-!-margin-bottom-0">
                <label className={`govuk-label govuk-label--${displaySize}`} htmlFor={inputId}>
                    {display}
                </label>
                {hiddenHint ? <div className="govuk-hint govuk-visually-hidden">{hiddenHint}</div> : null}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        renderDay={renderWeekPickerDay}
                        value={dateValue}
                        onChange={(newValue) => {
                            setDateValue(newValue);
                        }}
                        renderInput={({ inputRef, inputProps, InputProps }) => {
                            return inputBox(
                                inputRef,
                                inputProps,
                                InputProps,
                                inputId,
                                inputName,
                                errorMessage,
                                errors,
                                disabled,
                                optional,
                                stateUpdater,
                                setErrors,
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
