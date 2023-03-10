import { ReactElement, useState } from "react";
import FormElementWrapper, { FormGroupWrapper } from "./FormElementWrapper";
import { DisplayValuePair, ErrorInfo, FormBase } from "../../interfaces";
import { handleBlur } from "../../utils/formUtils";

interface SelectProps<T> extends FormBase<T> {
    defaultDisplay: string;
    selectValues: DisplayValuePair[];
}

const Select = <T extends object>({
    value,
    inputId,
    inputName,
    display,
    displaySize = "s",
    errorMessage = "",
    initialErrors = [],
    defaultDisplay,
    selectValues,
    stateUpdater,
}: SelectProps<T>): ReactElement => {
    const [errors, setErrors] = useState<ErrorInfo[]>(initialErrors);

    const getSelectOptions = (): JSX.Element[] => {
        const options: JSX.Element[] = [
            <option value="" disabled key="">
                {defaultDisplay}
            </option>,
        ];

        selectValues.forEach((input) => {
            options.push(
                <option value={input.value} key={`option-${input.value}`}>
                    {input.display}
                </option>,
            );
        });

        return options;
    };

    return (
        <FormGroupWrapper errorIds={[inputId]} errors={errors}>
            <div className="govuk-form-group">
                <label className={`govuk-label govuk-label--${displaySize}`} htmlFor={inputId}>
                    {display}
                </label>
                <FormElementWrapper errors={errors} errorId={inputId} errorClass="govuk-select--error">
                    <select
                        className="govuk-select w-3/4"
                        id={inputId}
                        name={inputName}
                        defaultValue={value}
                        onBlur={(e) => handleBlur(e.target.value, inputId, errorMessage, stateUpdater, setErrors)}
                    >
                        {getSelectOptions()}
                    </select>
                </FormElementWrapper>
            </div>
        </FormGroupWrapper>
    );
};

export default Select;
