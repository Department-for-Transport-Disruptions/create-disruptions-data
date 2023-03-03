import React, { ReactElement, useState } from "react";
import { ErrorInfo } from "../interfaces";
import FormElementWrapper from "./FormElementWrapper";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker, PickersDay, PickersDayProps } from "@mui/x-date-pickers";
import { InputBaseComponentProps } from "@mui/material/InputBase";
import { FilledInputProps } from "@mui/material/FilledInput";
import { OutlinedInputProps } from "@mui/material/OutlinedInput";

interface DateSelectorProps {
    input: Date | null;
    errors?: ErrorInfo[];
    disabled: boolean;
    inputId: string;
    inputName: string;
    disablePast: boolean;
}

const inputBox = (
    errors: ErrorInfo[],
    inputRef: React.Ref<any> | undefined,
    inputProps: InputBaseComponentProps | undefined,
    InputProps: Partial<FilledInputProps> | Partial<OutlinedInputProps> | undefined,
    disabled: boolean,
    inputId: string,
    inputName: string,
) => (
    <FormElementWrapper errors={errors} errorId={inputId} errorClass="govuk-date-input--error">
        <div className="govuk-date-input flex items-center [&_.MuiSvgIcon-root]:fill-govBlue">
            <div className="govuk-date-input__item govuk-!-margin-right-0">
                <div className="govuk-form-group">
                    <input
                        className={`govuk-input govuk-date-input__input govuk-input--width-6 ${
                            errors.length > 0 ? "govuk-input--error" : ""
                        } `}
                        id={inputId}
                        name={inputName}
                        type="text"
                        ref={inputRef}
                        {...inputProps}
                        disabled={disabled}
                    />
                </div>
            </div>
            {InputProps?.endAdornment}
        </div>
    </FormElementWrapper>
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

const DateSelector = ({
    input = null,
    errors = [],
    disabled,
    inputId,
    inputName,
    disablePast,
}: DateSelectorProps): ReactElement => {
    const [value, setValue] = useState(input);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
                renderDay={renderWeekPickerDay}
                value={value}
                onChange={(newValue) => {
                    setValue(newValue);
                }}
                renderInput={({ inputRef, inputProps, InputProps }) => {
                    return inputBox(errors, inputRef, inputProps, InputProps, disabled, inputId, inputName);
                }}
                disablePast={disablePast}
                inputFormat="DD/MM/YYYY"
            />
        </LocalizationProvider>
    );
};

export default DateSelector;
