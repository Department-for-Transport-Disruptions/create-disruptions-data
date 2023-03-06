import { FilledInputProps } from "@mui/material/FilledInput";
import { InputBaseComponentProps } from "@mui/material/InputBase";
import { OutlinedInputProps } from "@mui/material/OutlinedInput";
import { DatePicker, PickersDay, PickersDayProps } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import React, { ReactElement, useState } from "react";
import { ErrorInfo } from "../interfaces";
import { PageState } from "../pages/create-disruption";
import FormElementWrapper from "./FormElementWrapper";

interface DateSelectorProps {
    input: Date | null;
    errors?: ErrorInfo[];
    disabled: boolean;
    inputId: string;
    inputName: string;
    disablePast: boolean;
    pageState: PageState;
    updatePageState: Function;
    updaterFunction: Function;
}

const inputBox = (
    inputRef: React.Ref<HTMLInputElement> | undefined,
    inputProps: InputBaseComponentProps | undefined,
    InputProps: Partial<FilledInputProps> | Partial<OutlinedInputProps> | undefined,
    disabled: boolean,
    inputId: string,
    inputName: string,
    pageState: PageState,
    updatePageState: Function,
    updaterFunction: Function,
) => (
    <div className="govuk-date-input flex items-center [&_.MuiSvgIcon-root]:fill-govBlue">
        <div className="govuk-date-input__item govuk-!-margin-right-0">
            <FormElementWrapper
                errors={pageState.errors}
                errorId={inputId}
                errorClass="govuk-input--error"
            >
                <input
                    className="govuk-input govuk-date-input__input govuk-input--width-6"
                    id={inputId}
                    name={inputName}
                    type="text"
                    ref={inputRef}
                    {...inputProps}
                    disabled={disabled}
                    placeholder={disabled ? "N/A" : "DD/MM/YYYY"}
                    onBlur={(e) => {
                        const input = e.target.value;
                        if (!input) {
                            updaterFunction(pageState, updatePageState, inputId, input, {
                                id: inputId,
                                errorMessage: "Select a date",
                            });
                        } else {
                            updaterFunction(pageState, updatePageState, inputId, input);
                        }
                    }}
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

const DateSelector = ({
    input = null,
    disabled,
    inputId,
    inputName,
    disablePast,
    pageState,
    updatePageState,
    updaterFunction,
}: DateSelectorProps): ReactElement => {
    const [value, setValue] = useState(!!disabled ? null : input);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
                renderDay={renderWeekPickerDay}
                value={value}
                onChange={(newValue) => {
                    updaterFunction(pageState, updatePageState, inputId, newValue);
                    setValue(newValue);
                }}
                renderInput={({ inputRef, inputProps, InputProps }) => {
                    return inputBox(
                        inputRef,
                        inputProps,
                        InputProps,
                        disabled,
                        inputId,
                        inputName,
                        pageState,
                        updatePageState,
                        updaterFunction,
                    );
                }}
                disablePast={disablePast}
                inputFormat="DD/MM/YYYY"
                disabled={disabled}
            />
        </LocalizationProvider>
    );
};

export default DateSelector;
