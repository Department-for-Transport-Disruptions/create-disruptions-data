import { getFormattedDate } from "@create-disruptions-data/shared-ts/utils/dates";
import Calendar from "@mui/icons-material/Event";
import { yellow } from "@mui/material/colors";
import { DatePicker, PickersDay, PickersDayProps, PickersTextField, PickersTextFieldProps } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Dayjs } from "dayjs";
import kebabCase from "lodash/kebabCase";
import React, { ReactElement, useEffect, useState, forwardRef, Ref } from "react";
import FormElementWrapper, { FormGroupWrapper } from "./FormElementWrapper";
import { ErrorInfo, FormBase } from "../../interfaces";
import { convertDateTimeToFormat } from "../../utils/dates";

interface DateSelectorProps<T> extends FormBase<T> {
    disabled?: boolean;
    hint?: {
        hidden: boolean;
        text: string;
    };
    disablePast: boolean;
    reset?: boolean;
    suffixId?: string;
    resetError?: boolean;
    minWidth?: string;
    inputDivWidth?: string;
    errorAlign?: boolean;
}

const DateSelector = <T extends object>({
    value,
    display,
    displaySize = "s",
    inputName,
    initialErrors = [],
    disabled = false,
    hint,
    disablePast,
    stateUpdater,
    reset = false,
    suffixId,
    resetError = false,
    minWidth,
    inputDivWidth,
    errorAlign = false,
}: DateSelectorProps<T>): ReactElement => {
    const [dateValue, setDateValue] = useState<Dayjs | null>(!!disabled || !value ? null : getFormattedDate(value));
    const [errors, setErrors] = useState<ErrorInfo[]>(initialErrors);
    const inputId = suffixId ? `${kebabCase(inputName + suffixId)}` : kebabCase(inputName);

    useEffect(() => {
        if (disabled || reset) {
            setErrors([]);
            setDateValue(null);
        }
    }, [disabled, reset]);

    useEffect(() => {
        if (resetError) {
            setErrors([]);
        }
    }, [resetError]);

    useEffect(() => {
        setDateValue(value ? getFormattedDate(value) : null);
    }, [value]);

    useEffect(() => {
        setErrors(initialErrors);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(initialErrors)]);

    return (
        <FormGroupWrapper errorIds={[inputName]} errors={errors} errorAlign={errorAlign}>
            <div
                className={`govuk-form-group govuk-!-margin-bottom-0 ${errorAlign ? "h-full flex flex-col" : ""}`}
                id={inputId}
            >
                <div>
                    <label className={`govuk-label govuk-label--${displaySize}`} htmlFor={`${inputId}-input`}>
                        {display}
                    </label>
                </div>
                {hint ? (
                    <div className={`govuk-hint${hint.hidden ? " govuk-visually-hidden" : ""}`}>{hint.text}</div>
                ) : null}
                <div
                    className={`flex flex-col mt-auto govuk-date-input flex flex-row ${
                        inputDivWidth ? inputDivWidth : ""
                    }`}
                >
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            format="DD/MM/YYYY"
                            slotProps={{
                                textField: {
                                    size: "small",
                                    sx: {
                                        border: "2px solid black",
                                        borderRadius: 0,
                                        fontSize: "1.1875rem",
                                        ".MuiSvgIcon-root": {
                                            color: "blue",
                                        },
                                        maxWidth: "10em",
                                        lineHeight: "1.3157894737",
                                        height: "2.5rem",
                                    },
                                },
                            }}
                            // sx={{
                            // ".MuiInputBase-root": {
                            //     border: "2px solid black",
                            //     borderRadius: 0,
                            //     height: "2.5rem",
                            // },
                            // ".MuiSvgIcon-root": {
                            //     color: "blue",
                            // },
                            // ".MuiInputBase-input": {
                            //     height: "2.5rem",
                            // },
                            // }}
                        />
                    </LocalizationProvider>
                </div>
            </div>
        </FormGroupWrapper>
    );
};

export default DateSelector;
