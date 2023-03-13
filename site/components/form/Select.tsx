import kebabCase from "lodash/kebabCase";
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
    inputName,
    display,
    displaySize = "s",
    initialErrors = [],
    defaultDisplay,
    selectValues,
    stateUpdater,
    schema,
}: SelectProps<T>): ReactElement => {
    const [errors, setErrors] = useState<ErrorInfo[]>(initialErrors);
    const inputId = kebabCase(inputName);

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
        <FormGroupWrapper errorIds={[inputName]} errors={errors}>
            <div className="govuk-form-group" id={inputId}>
                <label className={`govuk-label govuk-label--${displaySize}`} htmlFor={`${inputId}-input`}>
                    {display}
                </label>
                <FormElementWrapper errors={errors} errorId={inputName} errorClass="govuk-select--error">
                    <select
                        className="govuk-select w-3/4"
                        name={inputName}
                        id={`${inputId}-input`}
                        defaultValue={value ?? ""}
                        onBlur={(e) => handleBlur(e.target.value, inputName, stateUpdater, setErrors, schema)}
                    >
                        {getSelectOptions()}
                    </select>
                </FormElementWrapper>
            </div>
        </FormGroupWrapper>
    );
};

export default Select;
