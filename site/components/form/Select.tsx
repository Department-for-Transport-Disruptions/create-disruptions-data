import { Dispatch, ReactElement, SetStateAction } from "react";
import FormElementWrapper, { FormGroupWrapper } from "./FormElementWrapper";
import { ERROR_MESSAGES } from "../../constants";
import { ErrorInfo, InputInfo } from "../../interfaces";
import { PageState, PageInputs } from "../../pages/create-disruption";

interface SelectProps {
    pageState: PageState;
    inputInfo: InputInfo;
    selectValues: DisplayValuePair[];
    updatePageState: Dispatch<SetStateAction<PageState>>;
    updaterFunction: (
        currentState: PageState,
        setPageState: Dispatch<SetStateAction<PageState>>,
        inputName: keyof PageInputs,
        input: string | Date | null,
        error?: ErrorInfo,
    ) => void;
}

interface DisplayValuePair {
    display: string;
    value: string;
}

const getSelectOptions = (inputs: DisplayValuePair[]): JSX.Element[] => {
    const options: JSX.Element[] = [
        <option value="" disabled key="">
            Choose a reason
        </option>,
    ];

    inputs.forEach((input, index) => {
        options.push(
            <option value={input.value} key={`option-${index + 1}`}>
                {input.display}
            </option>,
        );
    });

    return options;
};

const Select = ({
    pageState,
    inputInfo,
    selectValues,
    updatePageState,
    updaterFunction,
}: SelectProps): ReactElement => {
    const errorMessage = ERROR_MESSAGES.find((message) => message.input === inputInfo.id)?.message as string;

    return (
        <FormGroupWrapper errorIds={[inputInfo.id]} errors={pageState.errors}>
            <div className="govuk-form-group">
                <label className="govuk-label govuk-label--s" htmlFor={inputInfo.id}>
                    {inputInfo.display}
                </label>
                <FormElementWrapper errors={pageState.errors} errorId={inputInfo.id} errorClass="govuk-select--error">
                    <select
                        className="govuk-select w-3/4"
                        id={inputInfo.id}
                        name={inputInfo.name}
                        defaultValue={(pageState.inputs[inputInfo.id as keyof PageInputs] as string) || ""}
                        onBlur={(e) => {
                            const input = e.target.value;
                            if (!input) {
                                updaterFunction(pageState, updatePageState, inputInfo.id as keyof PageInputs, input, {
                                    id: inputInfo.id,
                                    errorMessage,
                                });
                            } else {
                                updaterFunction(pageState, updatePageState, inputInfo.id as keyof PageInputs, input);
                            }
                        }}
                    >
                        {getSelectOptions(selectValues)}
                    </select>
                </FormElementWrapper>
            </div>
        </FormGroupWrapper>
    );
};

export default Select;
