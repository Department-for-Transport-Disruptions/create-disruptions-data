import kebabCase from "lodash/kebabCase";
import { ReactElement, useState } from "react";
import FormElementWrapper, { FormGroupWrapper } from "./FormElementWrapper";
import { ErrorInfo, FormBase } from "../../interfaces";
import { handleBlur } from "../../utils/formUtils";

interface TextInputProps<T> extends FormBase<T> {
    widthClass: string;
    maxLength: number;
    textArea?: boolean;
    rows?: number;
    hint?: string;
    readOnly?: boolean;
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
    schema,
    readOnly = false,
}: TextInputProps<T>): ReactElement => {
    const [errors, setErrors] = useState<ErrorInfo[]>(initialErrors);
    const inputId = kebabCase(inputName);

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
                            className={readOnly ? widthClass : `govuk-textarea ${widthClass}`}
                            name={inputName}
                            id={`${inputId}-input`}
                            rows={rows}
                            maxLength={maxLength}
                            defaultValue={value}
                            onBlur={(e) => handleBlur(e.target.value, inputName, stateUpdater, setErrors, schema)}
                            readOnly={readOnly}
                        />
                    ) : (
                        <input
                            className={readOnly ? widthClass : `govuk-input ${widthClass}`}
                            id={`${inputId}-input`}
                            name={inputName}
                            type="text"
                            maxLength={maxLength}
                            defaultValue={value}
                            onBlur={(e) => handleBlur(e.target.value, inputName, stateUpdater, setErrors, schema)}
                            readOnly={readOnly}
                        />
                    )}
                </FormElementWrapper>
            </div>
        </FormGroupWrapper>
    );
};

export default TextInput;
