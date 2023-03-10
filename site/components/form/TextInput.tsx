import { ReactElement, useState } from "react";
import FormElementWrapper, { FormGroupWrapper } from "./FormElementWrapper";
import { ErrorInfo, FormBase } from "../../interfaces";
import { handleBlur } from "../../utils/formUtils";

interface TextInputProps<T> extends FormBase<T> {
    widthClass: string;
    maxLength: number;
    minLength?: number;
    textArea?: boolean;
    rows?: number;
    hint?: string;
}

const TextInput = <T extends object>({
    value,
    inputId,
    display,
    displaySize = "s",
    inputName,
    errorMessage = "",
    initialErrors = [],
    widthClass,
    maxLength,
    minLength = 0,
    textArea = false,
    rows,
    hint,
    optional = false,
    stateUpdater,
}: TextInputProps<T>): ReactElement => {
    const [errors, setErrors] = useState<ErrorInfo[]>(initialErrors);

    return (
        <FormGroupWrapper errorIds={[inputId]} errors={errors}>
            <div className="govuk-form-group">
                <label className={`govuk-label govuk-label--${displaySize}`} htmlFor={inputId}>
                    {display}
                </label>
                {hint ? (
                    <div id={`${inputId}-hint`} className="govuk-hint">
                        {hint}
                    </div>
                ) : null}
                <FormElementWrapper errors={errors} errorId={inputId} errorClass="govuk-input--error">
                    {textArea ? (
                        <textarea
                            className={`govuk-textarea ${widthClass}`}
                            id={inputId}
                            name={inputName}
                            rows={rows}
                            maxLength={maxLength}
                            defaultValue={value}
                            onBlur={(e) =>
                                handleBlur(
                                    e.target.value,
                                    inputId,
                                    errorMessage,
                                    stateUpdater,
                                    setErrors,
                                    optional,
                                    (input: string) => input.length >= minLength,
                                )
                            }
                        />
                    ) : (
                        <input
                            className={`govuk-input ${widthClass}`}
                            id={inputId}
                            name={inputName}
                            type="text"
                            maxLength={maxLength}
                            defaultValue={value}
                            onBlur={(e) =>
                                handleBlur(
                                    e.target.value,
                                    inputId,
                                    errorMessage,
                                    stateUpdater,
                                    setErrors,
                                    optional,
                                    (input: string) => input.length >= minLength,
                                )
                            }
                        />
                    )}
                </FormElementWrapper>
            </div>
        </FormGroupWrapper>
    );
};

export default TextInput;
