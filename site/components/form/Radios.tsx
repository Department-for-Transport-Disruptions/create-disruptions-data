import { ReactElement } from "react";
import FormElementWrapper, { FormGroupWrapper } from "./FormElementWrapper";
import { ErrorInfo, InputInfo } from "../../interfaces";

interface RadiosProps {
    heading: string;
    errors: ErrorInfo[];
    inputInfo: InputInfo[];
    paddingTop?: number;
}

const Radios = ({ heading, errors, inputInfo, paddingTop }: RadiosProps): ReactElement => {
    return (
        <FormGroupWrapper errorIds={[inputInfo[0].id]} errors={errors}>
            <fieldset className="govuk-fieldset">
                <legend className={`govuk-fieldset__legend${paddingTop ? ` govuk-!-padding-top-${paddingTop}` : ""}`}>
                    <span className="govuk-heading-s govuk-!-margin-bottom-0">{heading}</span>
                </legend>
                <FormElementWrapper errors={errors} errorId={inputInfo[0].id} errorClass="govuk-radios--error">
                    <div className="govuk-radios" id="radio-buttons">
                        {inputInfo.map((input, index) => (
                            <div
                                className={`govuk-radios__item${
                                    index < inputInfo.length - 1 ? " govuk-!-margin-bottom-1" : ""
                                }`}
                                key={`radio-${index + 1}`}
                            >
                                <input
                                    className="govuk-radios__input"
                                    id={input.id}
                                    name={input.name}
                                    type="radio"
                                    value={input.value}
                                />
                                <label className="govuk-label govuk-radios__label" htmlFor={input.id}>
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
