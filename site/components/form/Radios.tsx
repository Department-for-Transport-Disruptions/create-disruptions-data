import kebabCase from "lodash/kebabCase";
import { Fragment, ReactElement, useEffect, useRef, useState } from "react";
import FormElementWrapper, { FormGroupWrapper } from "./FormElementWrapper";
import { DisplayValuePair, ErrorInfo, FormBase } from "../../interfaces";
import { handleBlur } from "../../utils/formUtils";

interface RadiosProps<T> extends FormBase<T> {
    radioDetail: DisplayValuePair[];
    paddingTop?: number;
}

const Radios = <T extends object>({
    display,
    displaySize = "s",
    inputName,
    radioDetail,
    value,
    initialErrors = [],
    stateUpdater,
    paddingTop,
    schema,
}: RadiosProps<T>): ReactElement => {
    const [errors, setErrors] = useState<ErrorInfo[]>(initialErrors);
    const inputId = kebabCase(inputName);

    return (
        <FormGroupWrapper errorIds={[inputName]} errors={errors}>
            <fieldset className="govuk-fieldset" id={inputId}>
                <legend className={`govuk-fieldset__legend${paddingTop ? ` govuk-!-padding-top-${paddingTop}` : ""}`}>
                    <span className={`govuk-heading-${displaySize} govuk-!-margin-bottom-0`}>{display}</span>
                </legend>
                <FormElementWrapper errors={errors} errorId={inputName} errorClass="govuk-radios--error">
                    <div className="govuk-radios" data-module="govuk-radios">
                        {radioDetail.map((input, index) => (
                            <Fragment key={`radio-${input.value}`}>
                                <div
                                    className={`govuk-radios__item${
                                        index < radioDetail.length - 1 ? " govuk-!-margin-bottom-1" : ""
                                    }`}
                                >
                                    <input
                                        className="govuk-radios__input"
                                        id={`${inputId}-${input.value}`}
                                        name={inputName}
                                        type="radio"
                                        value={input.value}
                                        onBlur={(e) =>
                                            handleBlur(e.target.value, inputName, stateUpdater, setErrors, schema)
                                        }
                                        onChange={(e) => stateUpdater(e.currentTarget.value, inputName)}
                                        defaultChecked={input.value === value}
                                        data-aria-controls={
                                            input.conditionalElement ? `${inputId}-${input.value}-conditional` : null
                                        }
                                    />
                                    <label
                                        className="govuk-label govuk-radios__label"
                                        htmlFor={`${inputId}-${input.value}`}
                                    >
                                        {input.display}
                                    </label>
                                </div>
                                {input.conditionalElement ? (
                                    <div
                                        className="govuk-radios__conditional govuk-radios__conditional--hidden"
                                        id={`${inputId}-${input.value}-conditional`}
                                    >
                                        <div className="govuk-form-group">{input.conditionalElement}</div>
                                    </div>
                                ) : null}
                            </Fragment>
                        ))}
                    </div>
                </FormElementWrapper>
            </fieldset>
        </FormGroupWrapper>
    );
};

export default Radios;
