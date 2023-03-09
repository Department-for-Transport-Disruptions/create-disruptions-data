import { ReactElement, useState } from "react";
import FormElementWrapper, { FormGroupWrapper } from "./FormElementWrapper";
import { ErrorInfo, FormBase } from "../../interfaces";
import { handleBlur } from "../../utils/formUtils";

interface TimeSelectorProps<T> extends FormBase<T> {
    disabled: boolean;
    hint?: string;
}

const TimeSelector = <T extends object>({
    value,
    inputId,
    display,
    inputName,
    errorMessage = "",
    initialErrors = [],
    disabled,
    hint,
    optional = false,
    stateUpdater,
}: TimeSelectorProps<T>): ReactElement => {
    const [errors, setErrors] = useState<ErrorInfo[]>(initialErrors);

    return (
        <FormGroupWrapper errorIds={[inputId]} errors={errors}>
            <div className="govuk-form-group">
                <label className="govuk-label govuk-label--s" htmlFor={inputId}>
                    {display}
                </label>
                {hint ? (
                    <div id={`${inputId}-hint`} className="govuk-hint">
                        {hint}
                    </div>
                ) : null}
                <FormElementWrapper errors={errors} errorId={inputId} errorClass="govuk-input--error">
                    <input
                        className="govuk-input govuk-date-input__input govuk-input--width-4"
                        id={inputId}
                        name={inputName}
                        type="text"
                        defaultValue={value}
                        disabled={disabled}
                        placeholder={disabled ? "N/A" : "hhmm"}
                        aria-describedby={hint ? `${inputId}-hint` : ""}
                        onBlur={(e) =>
                            handleBlur(e.target.value, inputId, errorMessage, stateUpdater, setErrors, optional)
                        }
                    />
                </FormElementWrapper>
            </div>
        </FormGroupWrapper>
    );
};

export default TimeSelector;
