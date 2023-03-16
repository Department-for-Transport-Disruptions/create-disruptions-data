import { lowerCase, startCase } from "lodash";
import kebabCase from "lodash/kebabCase";
import { ReactElement, useEffect, useRef, useState } from "react";
import FormElementWrapper, { FormGroupWrapper } from "./FormElementWrapper";
import { ErrorInfo, FormBase } from "../../interfaces";
import { handleBlur } from "../../utils/formUtils";

interface TimeSelectorProps<T> extends FormBase<T> {
    disabled: boolean;
    hint?: string;
    reset?: boolean;
    showError?: boolean;
}

const TimeSelector = <T extends object>({
    value,
    display,
    displaySize = "s",
    inputName,
    initialErrors = [],
    disabled,
    hint,
    schema,
    stateUpdater,
    reset = false,
    showError = false,
}: TimeSelectorProps<T>): ReactElement => {
    const [errors, setErrors] = useState<ErrorInfo[]>(initialErrors);
    const ref = useRef<HTMLInputElement>(null);
    const inputId = kebabCase(inputName);

    useEffect(() => {
        if (disabled || reset) {
            setErrors([]);

            if (ref.current) {
                ref.current.value = "";
            }
        }
    }, [disabled, reset]);

    useEffect(() => {
        if (showError) {
            setErrors([
                {
                    id: inputName,
                    errorMessage: `Enter a ${lowerCase(
                        startCase(inputName.replace("disruption", "")),
                    )} for the disruption`,
                },
            ]);
        }
    }, [showError, inputName]);

    return (
        <FormGroupWrapper errorIds={[inputName]} errors={errors}>
            <div className="govuk-form-group" id={inputId}>
                <label className={`govuk-label govuk-label--${displaySize}`} htmlFor={`${inputId}-input`}>
                    {display}
                </label>
                {hint ? (
                    <div id={`${inputId}-hint`} className="govuk-hint">
                        {hint}
                    </div>
                ) : null}
                <FormElementWrapper errors={errors} errorId={inputName} errorClass="govuk-input--error">
                    <input
                        ref={ref}
                        className="govuk-input govuk-date-input__input govuk-input--width-4"
                        name={inputName}
                        id={`${inputId}-input`}
                        type="text"
                        defaultValue={value}
                        disabled={disabled}
                        placeholder={disabled ? "N/A" : "hhmm"}
                        aria-describedby={hint ? `${inputId}-hint` : ""}
                        onBlur={(e) => handleBlur(e.target.value, inputName, stateUpdater, setErrors, schema, disabled)}
                    />
                </FormElementWrapper>
            </div>
        </FormGroupWrapper>
    );
};

export default TimeSelector;
