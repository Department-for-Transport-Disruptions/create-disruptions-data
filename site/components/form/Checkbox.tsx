import kebabCase from "lodash/kebabCase";
import { ReactElement, useState } from "react";
import FormElementWrapper, { FormGroupWrapper } from "./FormElementWrapper";
import { DisplayValuePair, ErrorInfo, FormBase } from "../../interfaces";

interface CheckboxProps<T> extends FormBase<T> {
    checkboxDetail: DisplayValuePair[];
    hideLegend?: boolean;
}

const Checkbox = <T extends object>({
    inputName,
    display,
    displaySize = "s",
    hideLegend = false,
    checkboxDetail,
    initialErrors = [],
    stateUpdater,
}: CheckboxProps<T>): ReactElement => {
    const [errors] = useState<ErrorInfo[]>(initialErrors);
    const inputId = kebabCase(inputName);

    return (
        <FormGroupWrapper errorIds={[inputName]} errors={errors}>
            <fieldset className="govuk-fieldset" role="group" id={inputId}>
                <legend className={`govuk-fieldset__legend${hideLegend ? " govuk-visually-hidden" : ""}`}>
                    <span className={`govuk-heading-${displaySize} govuk-!-margin-bottom-0`}>{display}</span>
                </legend>
                <div className="govuk-checkboxes flex govuk-checkboxes--small" data-module="govuk-checkboxes">
                    <FormElementWrapper errors={errors} errorId={inputName} errorClass="govuk-radios--error">
                        <>
                            {checkboxDetail.map((item) => (
                                <div className="govuk-checkboxes__item" key={item.value}>
                                    <input
                                        className="govuk-checkboxes__input"
                                        id={`${inputId}-${item.value}`}
                                        name={inputName}
                                        type="checkbox"
                                        value={item.value}
                                        onChange={(e) =>
                                            stateUpdater(
                                                e.currentTarget.checked ? e.currentTarget.value : "",
                                                inputName,
                                            )
                                        }
                                        defaultChecked={item.checked}
                                    />
                                    <label
                                        className="govuk-label govuk-checkboxes__label"
                                        htmlFor={`${inputId}-${item.value}`}
                                    >
                                        {item.display}
                                    </label>
                                </div>
                            ))}
                        </>
                    </FormElementWrapper>
                </div>
            </fieldset>
        </FormGroupWrapper>
    );
};

export default Checkbox;
