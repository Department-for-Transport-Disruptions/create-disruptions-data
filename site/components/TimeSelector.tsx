import { ReactElement } from "react";
import FormElementWrapper from "./FormElementWrapper";
import { ErrorInfo } from "../interfaces";

interface TimeSelectorProps {
    input?: string;
    errors?: ErrorInfo[];
    disabled: boolean;
    inputId: string;
    inputName: string;
}

const TimeSelector = ({ input, errors = [], disabled, inputId, inputName }: TimeSelectorProps): ReactElement => (
    <FormElementWrapper errors={errors} errorId={inputId} errorClass="govuk-date-input--error">
        <div className="govuk-form-group">
            <input
                className={`govuk-input govuk-date-input__input govuk-input--width-4 ${
                    errors.length > 0 ? "govuk-input--error" : ""
                } `}
                id={inputId}
                name={inputName}
                type="text"
                defaultValue={input}
                disabled={disabled}
                placeholder="hhmm"
            />
        </div>
    </FormElementWrapper>
);

export default TimeSelector;
