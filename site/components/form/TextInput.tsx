import { Dispatch, ReactElement, SetStateAction } from "react";
import FormElementWrapper, { FormGroupWrapper } from "./FormElementWrapper";
import { ERROR_MESSAGES } from "../../constants";
import { ErrorInfo, InputInfo } from "../../interfaces";
import { PageState, PageInputs } from "../../pages/create-disruption";

interface TextInputProps {
    pageState: PageState;
    inputInfo: InputInfo;
    widthClass: string;
    maxLength: number;
    textArea?: boolean;
    rows?: number;
    optional?: boolean;
    updatePageState: Dispatch<SetStateAction<PageState>>;
    updaterFunction: (
        currentState: PageState,
        setPageState: Dispatch<SetStateAction<PageState>>,
        inputName: keyof PageInputs,
        input: string | Date | null,
        error?: ErrorInfo,
    ) => void;
}

const TextInput = ({
    pageState,
    inputInfo,
    widthClass,
    maxLength,
    textArea = false,
    rows,
    optional = false,
    updatePageState,
    updaterFunction,
}: TextInputProps): ReactElement => {
    const errorMessage = ERROR_MESSAGES.find((message) => message.input === inputInfo.id)?.message as string;

    return (
        <FormGroupWrapper errorIds={[inputInfo.id]} errors={pageState.errors}>
            <div className="govuk-form-group">
                <label className="govuk-label govuk-label--s" htmlFor={inputInfo.id}>
                    {inputInfo.display}
                </label>
                <FormElementWrapper errors={pageState.errors} errorId={inputInfo.id} errorClass="govuk-input--error">
                    {textArea ? (
                        <textarea
                            className={`govuk-textarea ${widthClass}`}
                            id={inputInfo.id}
                            name={inputInfo.name}
                            rows={rows}
                            maxLength={maxLength}
                            defaultValue={pageState.inputs.description}
                            onBlur={(e) => {
                                const input = e.target.value;
                                if (!input && !optional) {
                                    updaterFunction(
                                        pageState,
                                        updatePageState,
                                        inputInfo.id as keyof PageInputs,
                                        input,
                                        {
                                            id: inputInfo.id,
                                            errorMessage,
                                        },
                                    );
                                } else {
                                    updaterFunction(
                                        pageState,
                                        updatePageState,
                                        inputInfo.id as keyof PageInputs,
                                        input,
                                    );
                                }
                            }}
                        />
                    ) : (
                        <input
                            className={`govuk-input ${widthClass}`}
                            id={inputInfo.id}
                            name={inputInfo.name}
                            type="text"
                            maxLength={maxLength}
                            defaultValue={pageState.inputs.summary}
                            onBlur={(e) => {
                                const input = e.target.value;
                                if (!input && !optional) {
                                    updaterFunction(
                                        pageState,
                                        updatePageState,
                                        inputInfo.id as keyof PageInputs,
                                        input,
                                        {
                                            id: inputInfo.id,
                                            errorMessage,
                                        },
                                    );
                                } else {
                                    updaterFunction(
                                        pageState,
                                        updatePageState,
                                        inputInfo.id as keyof PageInputs,
                                        input,
                                    );
                                }
                            }}
                        />
                    )}
                </FormElementWrapper>
            </div>
        </FormGroupWrapper>
    );
};

export default TextInput;
