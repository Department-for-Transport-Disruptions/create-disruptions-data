import { Dispatch, ReactElement, SetStateAction } from "react";
import FormElementWrapper from "./FormElementWrapper";
import { ErrorInfo } from "../interfaces";
import { PageInputs, PageState } from "../pages/create-disruption";

interface TimeSelectorProps {
    input?: string;
    errors?: ErrorInfo[];
    disabled: boolean;
    inputId: string;
    inputName: string;
    pageState: PageState;
    updatePageState: Dispatch<SetStateAction<PageState>>;
    updaterFunction: (
        currentState: PageState,
        setPageState: Dispatch<SetStateAction<PageState>>,
        inputName: keyof PageInputs,
        input: string | Date | null,
        error?: ErrorInfo,
    ) => void;
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
                        updaterFunction(pageState, updatePageState, inputId as keyof PageInputs, input, {
                            id: inputId,
                            errorMessage: "Enter a time in hhmm format",
                        });
                    } else {
                        updaterFunction(pageState, updatePageState, inputId as keyof PageInputs, input);
                    }
                }}
            />
        </FormElementWrapper>
    );
};

export default TimeSelector;
