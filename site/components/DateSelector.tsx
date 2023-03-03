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
    startOrEnd: "start" | "end";
    disabled: boolean;
    inputId: string;
}

const inputBox = (
    startOrEnd: "start" | "end",
    hasErrors: boolean,
    inputRef: React.Ref<any> | undefined,
    inputProps: InputBaseComponentProps | undefined,
    InputProps: Partial<FilledInputProps> | Partial<OutlinedInputProps> | undefined,
    disabled: boolean,
    inputId: string,
) => (
    <div className="govuk-date-input flex items-center [&_.MuiSvgIcon-root]:fill-govBlue" id={`${startOrEnd}-date`}>
        <div className="govuk-date-input__item govuk-!-margin-right-0">
            <div className="govuk-form-group">
                <input
                    className={`govuk-input govuk-date-input__input govuk-input--width-6 ${
                        hasErrors ? "govuk-input--error" : ""
                    } `}
                    id={inputId}
                    name={`${inputId.includes("publish") ? "publish" : "validity"}-${startOrEnd}DateDay`}
                    type="text"
                    ref={inputRef}
                    {...inputProps}
                    disabled={disabled}
                />
            </div>
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

const DateSelector = ({
    input = null,
    startOrEnd,
    errors = [],
    disabled,
    inputId,
}: DateSelectorProps): ReactElement => {
    const [value, setValue] = useState(input);

    return (
        <FormElementWrapper errors={errors} errorId={`${startOrEnd}-day-input`} errorClass="govuk-date-input--error">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                    renderDay={renderWeekPickerDay}
                    value={value}
                    onChange={(newValue) => {
                        setValue(newValue);
                    }}
                    renderInput={({ inputRef, inputProps, InputProps }) => {
                        return inputBox(
                            startOrEnd,
                            errors.length > 0,
                            inputRef,
                            inputProps,
                            InputProps,
                            disabled,
                            inputId,
                        );
                    }}
                    disablePast={startOrEnd === "end"}
                    inputFormat="DD/MM/YYYY"
                />
            </LocalizationProvider>
        </FormElementWrapper>
    );
};

export default DateSelector;
