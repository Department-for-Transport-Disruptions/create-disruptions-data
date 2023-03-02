import React, { ReactElement, useState } from "react";
import { ErrorInfo } from "../interfaces";
import FormElementWrapper from "./FormElementWrapper";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker, PickersDay, PickersDayProps, pickersDayClasses } from "@mui/x-date-pickers";
import { InputBaseComponentProps } from "@mui/material/InputBase";
import { FilledInputProps } from "@mui/material/FilledInput";
import { OutlinedInputProps } from "@mui/material/OutlinedInput";
import { ThemeProvider } from "@mui/system";
import { createTheme } from "@mui/material";

const color = "#1d70b8";

interface DateSelectorProps {
    input: Date | null;
    errors?: ErrorInfo[];
    startOrEnd: "start" | "end";
    isPublishInfo: boolean;
    disabled: boolean;
}

const inputBox = (
    startOrEnd: "start" | "end",
    hasErrors: boolean,
    inputRef: React.Ref<any> | undefined,
    inputProps: InputBaseComponentProps | undefined,
    InputProps: Partial<FilledInputProps> | Partial<OutlinedInputProps> | undefined,
    disabled: boolean,
    isPublishInfo: boolean
) => (
    <div className="govuk-date-input flex items-center" id={`${startOrEnd}-date`}>
        <div className="govuk-date-input__item govuk-!-margin-right-0">
            <div className="govuk-form-group">
                <input
                    className={`govuk-input govuk-date-input__input govuk-input--width-6 ${
                        hasErrors ? "govuk-input--error" : ""
                    } `}
                    id={`${isPublishInfo && 'publish-'}${startOrEnd}-day-input`}
                    name={`${startOrEnd}DateDay`}
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
) => {
    return (
        <PickersDay
            {...pickersDayProps}
            sx={{
                [`&&.${pickersDayClasses.selected}`]: {
                    backgroundColor: color,
                },
                [`&&.${pickersDayClasses.dayWithMargin}:focus`]: {
                    border: "1px solid #ffdd00",
                },
                [`&&.${pickersDayClasses.dayWithMargin}:hover`]: {
                    border: `1px solid ${color}`,
                },
            }}
        />
    );
};

const DateSelector = ({ input = null, startOrEnd, errors = [], disabled, isPublishInfo }: DateSelectorProps): ReactElement => {
    const [value, setValue] = useState(input);
    const theme = createTheme({
        components: {
            MuiIconButton: {
                styleOverrides: {
                    sizeMedium: {
                        color,
                    },
                },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        color,
                    },
                },
            },
            MuiInputLabel: {
                styleOverrides: {
                    root: {
                        color,
                    },
                },
            },
        },
    });
    return (
        <FormElementWrapper errors={errors} errorId={`${startOrEnd}-day-input`} errorClass="govuk-date-input--error">
            <ThemeProvider theme={theme}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        renderDay={renderWeekPickerDay}
                        label="Custom input"
                        value={value}
                        onChange={(newValue) => {
                            setValue(newValue);
                        }}
                        renderInput={({ inputRef, inputProps, InputProps }) => {
                            return inputBox(startOrEnd, errors.length > 0, inputRef, inputProps, InputProps, disabled, isPublishInfo);
                        }}
                        disablePast={startOrEnd === "end"}
                    />
                </LocalizationProvider>
            </ThemeProvider>
        </FormElementWrapper>
    );
};

export default DateSelector;
