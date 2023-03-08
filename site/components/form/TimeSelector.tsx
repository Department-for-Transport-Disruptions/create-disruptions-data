import { Dispatch, ReactElement, SetStateAction } from "react";
import FormElementWrapper, { FormGroupWrapper } from "./FormElementWrapper";
import { ErrorInfo } from "../../interfaces";
import { PageState, PageInputs } from "../../pages/create-disruption";

interface TimeSelectorProps {
    header: string;
    input?: string;
    errors?: ErrorInfo[];
    disabled: boolean;
    inputId: string;
    inputName: string;
    pageState: PageState;
    hint?: {
        id: string;
        text: string;
    };
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
    header,
    input,
    disabled,
    inputId,
    inputName,
    pageState,
    hint,
    updatePageState,
    updaterFunction,
}: TimeSelectorProps): ReactElement => {
    return (
        <FormGroupWrapper errorIds={[inputId]} errors={pageState.errors}>
            <fieldset className="govuk-fieldset mb-7.5" role="group" aria-describedby={hint ? hint.id : undefined}>
                <legend className="govuk-fieldset__legend">
                    <h3 className="govuk-heading-s govuk-!-margin-bottom-0">{header}</h3>
                </legend>
                {hint ? (
                    <div id={hint.id} className="govuk-hint">
                        {hint.text}
                    </div>
                ) : null}

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
            </fieldset>
        </FormGroupWrapper>
    );
};

export default TimeSelector;
