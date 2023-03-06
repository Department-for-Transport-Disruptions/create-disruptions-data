import { ReactElement } from "react";
import { ErrorInfo } from "../interfaces";
import { PageState } from "../pages/create-disruption";
import FormElementWrapper from "./FormElementWrapper";

interface TimeSelectorProps {
    input?: string;
    errors?: ErrorInfo[];
    disabled: boolean;
    inputId: string;
    inputName: string;
    pageState: PageState;
    updatePageState: Function;
    updaterFunction: Function;
}

const TimeSelector = ({
    input,
    disabled,
    inputId,
    inputName,
    pageState,
    updatePageState,
    updaterFunction,
}: TimeSelectorProps): ReactElement => {
    return (
        <FormElementWrapper errors={pageState.errors} errorId={inputId} errorClass="govuk-input--error">
            <input
                className="govuk-input govuk-date-input__input govuk-input--width-4"
                id={inputId}
                name={inputName}
                type="text"
                defaultValue={input}
                disabled={disabled}
                placeholder={disabled ? "N/A" : "hhmm"}
                onBlur={(e) => {
                    const input = e.target.value;
                    if (!input) {
                        updaterFunction(pageState, updatePageState, inputId, input, {
                            id: inputId,
                            errorMessage: "Enter a time in hhmm format",
                        });
                    } else {
                        updaterFunction(pageState, updatePageState, inputId, input);
                    }
                }}
            />
        </FormElementWrapper>
    );
};

export default TimeSelector;
