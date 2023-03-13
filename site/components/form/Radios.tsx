import kebabCase from "lodash/kebabCase";
import { ReactElement, useState } from "react";
import FormElementWrapper, { FormGroupWrapper } from "./FormElementWrapper";
import { DisplayValuePair, ErrorInfo, FormBase } from "../../interfaces";

interface RadiosProps<T> extends FormBase<T> {
    radioDetail: DisplayValuePair[];
    paddingTop?: number;
}

const Radios = <T extends object>({
    display,
    displaySize = "s",
    inputName,
    radioDetail,
    initialErrors = [],
    stateUpdater,
    paddingTop,
    value,
}: RadiosProps<T>): ReactElement => {
    const [errors] = useState<ErrorInfo[]>(initialErrors);
    const inputId = kebabCase(inputName);

    return (
        <FormGroupWrapper errorIds={[inputName]} errors={errors}>
            <fieldset className="govuk-fieldset" id={inputId}>
                <legend className={`govuk-fieldset__legend${paddingTop ? ` govuk-!-padding-top-${paddingTop}` : ""}`}>
                    <span className={`govuk-heading-${displaySize} govuk-!-margin-bottom-0`}>{display}</span>
                </legend>
                <FormElementWrapper errors={errors} errorId={inputName} errorClass="govuk-radios--error">
                    <div className="govuk-radios">
                        {radioDetail.map((input, index) => (
                            <div
                                className={`govuk-radios__item${
                                    index < radioDetail.length - 1 ? " govuk-!-margin-bottom-1" : ""
                                }`}
                                key={`radio-${input.value}`}
                            >
                                <input
                                    className="govuk-radios__input"
                                    id={`${inputId}-${input.value}`}
                                    name={inputName}
                                    type="radio"
                                    value={input.value}
                                    defaultChecked={value === input.value}
                                    onChange={(e) => stateUpdater(e.currentTarget.value, inputName)}
                                />
                                <label
                                    className="govuk-label govuk-radios__label"
                                    htmlFor={`${inputId}-${input.value}`}
                                >
                                    {input.display}
                                </label>
                            </div>
                        ))}
                    </div>
                </FormElementWrapper>
            </fieldset>
        </FormGroupWrapper>
    );
};

export default Radios;
