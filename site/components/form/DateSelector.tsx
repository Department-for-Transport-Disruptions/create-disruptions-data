import { getFormattedDate } from "@create-disruptions-data/shared-ts/utils/dates";
import Calendar from "@mui/icons-material/Event";
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

const inputBox = forwardRef((props: PickersTextFieldProps, ref: Ref<HTMLDivElement>) => (
    <FormElementWrapper
        errors={props?.inputProps?.errors || []}
        errorId={props.name || ""}
        errorClass="govuk-input--error"
    >
        <PickersTextField {...props} className={props.className} ref={ref} id={props.id} />
    </FormElementWrapper>
));

const inputBox2 = <T extends object>(
    inputRef: React.Ref<HTMLInputElement> | undefined,
    inputProps: InputBaseComponentProps | undefined,
    InputProps: Partial<FilledInputProps> | Partial<OutlinedInputProps> | undefined,
    inputId: string,
    inputName: Extract<keyof T, string>,
    errors: ErrorInfo[],
    disabled: boolean,
    minWidth?: string,
    inputDivWidth?: string,
) => (
    <div className="govuk-date-input flex flex-row [&_.MuiSvgIcon-root]:fill-govBlue">
        <div className={`govuk-date-input__item govuk-!-margin-right-0 ${inputDivWidth ? inputDivWidth : ""}`}>
            <FormElementWrapper errors={errors} errorId={inputName} errorClass="govuk-input--error">
                <input
                    className={`govuk-input govuk-date-input__input govuk-input--width-6 ${minWidth ? minWidth : ""}`}
                    name={inputName}
                    id={`${inputId}-input`}
                    type="text"
                    ref={inputRef}
                    {...inputProps}
                    disabled={disabled}
                    placeholder={disabled ? "N/A" : "DD/MM/YYYY"}
                />
            </FormElementWrapper>
        </div>
        <div className="flex items-end pb-5">{InputProps?.endAdornment}</div>
    </div>
);

inputBox.displayName = "InputBox";

const renderWeekPickerDay = (props: PickersDayProps<Dayjs>) => (
    <PickersDay
        {...props}
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
                            slots={{
                                // day: renderWeekPickerDay,
                                textField: inputBox,
                            }}
                            value={dateValue}
                            onChange={(newValue) => {
                                setDateValue(newValue);
                                if (newValue) {
                                    stateUpdater(convertDateTimeToFormat(newValue, "DD/MM/YYYY"), inputName);
                                } else {
                                    stateUpdater("", inputName);
                                }
                            }}
                            onAccept={() => setErrors([])}
                            slotProps={{
                                textField: {
                                    InputProps: {
                                        className: `govuk-input govuk-date-input__input govuk-input--width-6  ${
                                            minWidth ? `${minWidth} mr-4` : ""
                                        } focus:outline focus:outline-yellow-400 active:outline active:outline-yellow-400${
                                            !!errors.find((err) => err.id === inputName)
                                                ? "border-[#d4351c] focus:border-black active:border-black"
                                                : ""
                                        }`,
                                    },
                                    inputProps: {
                                        className: `govuk-input govuk-date-input__input govuk-input--width-6  ${
                                            minWidth ? `${minWidth} mr-4` : ""
                                        } hover:outline hover:outline-yellow-400`,
                                        errors: errors,
                                    },
                                    disabled: disabled,
                                    placeholder: disabled ? "N/A" : "DD/MM/YYYY",
                                    id: inputId,
                                    name: inputName,
                                    error: !!errors.find((err) => err.id === inputName),
                                    className: `govuk-date-input__item [&_.MuiSvgIcon-root]:fill-govBlue`,
                                },
                            }}
                            disablePast={disablePast}
                            format="DD/MM/YYYY"
                            enableAccessibleFieldDOMStructure
                            disabled={disabled}
                            aria-describedby={hint ? `${inputName}-hint` : undefined}
                        />
                    </LocalizationProvider>
                </div>
            </div>
        </FormGroupWrapper>
    );
};

export default DateSelector;
