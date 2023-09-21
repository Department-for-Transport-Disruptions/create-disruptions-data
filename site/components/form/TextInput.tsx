import kebabCase from "lodash/kebabCase";
import { ReactElement, useEffect, useState } from "react";
import FormElementWrapper, { FormGroupWrapper } from "./FormElementWrapper";
import { ErrorInfo, FormBase } from "../../interfaces";

interface TextInputProps<T> extends FormBase<T> {
    widthClass: string;
    maxLength: number;
    textArea?: boolean;
    rows?: number;
    hint?: string;
    isPassword?: boolean;
    resetError?: boolean;
}

const TextInput = <T extends object>({
    value,
    display,
    inputName,
    displaySize = "s",
    initialErrors = [],
    widthClass,
    maxLength,
    textArea = false,
    rows,
    hint,
    stateUpdater,
    isPassword,
    resetError = false,
}: TextInputProps<T>): ReactElement => {
    const [errors, setErrors] = useState<ErrorInfo[]>(initialErrors);
    const inputId = kebabCase(inputName);

    useEffect(() => {
        if (resetError) {
            setErrors([]);
        }
    }, [resetError, setErrors]);

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
                    {textArea ? (
                        <textarea
                            className={`govuk-textarea ${widthClass}`}
                            name={inputName}
                            id={`${inputId}-input`}
                            rows={rows}
                            maxLength={maxLength}
                            value={value}
                            onChange={(e) => {
                                stateUpdater(e.target.value, inputName);
                            }}
                            aria-describedby={!!hint ? `${inputId}-hint` : undefined}
                        />
                    ) : (
                        <input
                            className={`govuk-input ${widthClass}`}
                            id={`${inputId}-input`}
                            name={inputName}
                            type={isPassword ? "password" : "text"}
                            maxLength={maxLength}
                            value={value}
                            onChange={(e) => {
                                stateUpdater(e.target.value, inputName);
                            }}
                            aria-describedby={!!hint ? `${inputId}-hint` : undefined}
                        />
                    )}
                </FormElementWrapper>
            </div>
        </FormGroupWrapper>
    );
};

export default TextInput;
