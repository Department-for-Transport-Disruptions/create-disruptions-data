import { Dispatch, ReactElement, SetStateAction, useState } from "react";
import FormElementWrapper, { FormGroupWrapper } from "../components/FormElementWrapper";
import { BaseLayout } from "../components/layout/Layout";
import TimeSelector from "../components/TimeSelector";
import { ErrorInfo } from "../interfaces";

const title = "Create Consequence Operator";
const description = "Create Consequence Operator page for the Create Transport Disruptions Service";

interface CreateConsequenceOperatorProps {
    inputs: PageState;
}

export interface PageInputs {
    "consequence-operator": string;
    description: string;
    "remove-from-journey-planners": string;
    "disruption-delay": string;
    "disruption-severity": string;
    "disruption-direction": string;
}

export interface PageState {
    errors: ErrorInfo[];
    inputs: PageInputs;
}

const updatePageStateForInput = (
    currentState: PageState,
    setPageState: Dispatch<SetStateAction<PageState>>,
    inputName: keyof PageInputs,
    input: string | null,
    error?: ErrorInfo,
): void => {
    setPageState({
        inputs: {
            ...currentState.inputs,
            [inputName]: input,
        },
        errors: [
            ...(error
                ? [...currentState.errors, error]
                : [...currentState.errors.filter((error) => error.id !== inputName)]),
        ],
    });
};

const getOptions = (type: string, optionValues: { value: string; [key: string]: string }[]): JSX.Element[] => {
    const options: JSX.Element[] = [
        <option value="" disabled key="">
            {`Select ${type}`}
        </option>,
    ];

    optionValues.forEach((element) => {
        options.push(
            <option value={element.value} key={element.value}>
                {element[type]}
            </option>,
        );
    });

    return options;
};

const CreateConsequenceOperator = ({ inputs }: CreateConsequenceOperatorProps): ReactElement => {
    const [pageState, setPageState] = useState<PageState>(inputs);

    return (
        <BaseLayout title={title} description={description}>
            <form action="/api/createConsequenceOperator" method="post">
                <>
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">Add a Consequence</h1>
                        <FormGroupWrapper errorIds={["consequence-operator"]} errors={pageState.errors}>
                            <div className="govuk-form-group">
                                <label className="govuk-label govuk-label--l" htmlFor="consequence-operator">
                                    Who is the operator?
                                </label>
                                <FormElementWrapper
                                    errors={pageState.errors}
                                    errorId="consequence-operator"
                                    errorClass="govuk-select--error"
                                >
                                    <select
                                        className="govuk-select w-3/4"
                                        id="consequence-operator"
                                        name="consequenceOperator"
                                        defaultValue={pageState.inputs["consequence-operator"] || ""}
                                        onBlur={(e) => {
                                            const input = e.target.value;
                                            if (!input) {
                                                updatePageStateForInput(
                                                    pageState,
                                                    setPageState,
                                                    "consequence-operator",
                                                    input,
                                                    {
                                                        id: "consequence-operator",
                                                        errorMessage: "Select an operator from the dropdown",
                                                    },
                                                );
                                            } else {
                                                updatePageStateForInput(
                                                    pageState,
                                                    setPageState,
                                                    "consequence-operator",
                                                    input,
                                                );
                                            }
                                        }}
                                    >
                                        {getOptions("operator", [])}
                                    </select>
                                </FormElementWrapper>
                            </div>
                        </FormGroupWrapper>
                        <FormGroupWrapper errorIds={["description"]} errors={pageState.errors}>
                            <div className="govuk-form-group">
                                <label className="govuk-label govuk-label--l" htmlFor="description">
                                    Consequence description
                                </label>
                                <FormElementWrapper
                                    errors={pageState.errors}
                                    errorId="description"
                                    errorClass="govuk-input--error"
                                >
                                    <textarea
                                        className="govuk-textarea w-3/4"
                                        id="description"
                                        name="description"
                                        rows={3}
                                        maxLength={200}
                                        defaultValue={pageState.inputs.description}
                                        onBlur={(e) => {
                                            const input = e.target.value;
                                            if (!input) {
                                                updatePageStateForInput(pageState, setPageState, "description", input, {
                                                    id: "description",
                                                    errorMessage:
                                                        "Enter a description for this disruption (200 characters maximum)",
                                                });
                                            } else {
                                                updatePageStateForInput(pageState, setPageState, "description", input);
                                            }
                                        }}
                                    />
                                </FormElementWrapper>
                            </div>
                        </FormGroupWrapper>
                        <fieldset className="govuk-fieldset pb-8">
                            <legend className="govuk-fieldset__legend" id="disruption-repeat-hint">
                                <h3 className="govuk-heading-l govuk-!-margin-bottom-0">
                                    Would you like to remove this from journey planners?
                                </h3>
                            </legend>
                            <div className="govuk-radios" data-module="govuk-radios">
                                <div className="govuk-radios__item">
                                    <input
                                        className="govuk-radios__input"
                                        id="remove-from-journey-planners"
                                        name="removeFromJourneyPlanners"
                                        type="radio"
                                        value="yes"
                                    />
                                    <label
                                        className="govuk-label govuk-radios__label"
                                        htmlFor="removeFromJourneyPlanners"
                                    >
                                        Yes
                                    </label>
                                </div>
                                <div className="govuk-radios__item">
                                    <input
                                        className="govuk-radios__input"
                                        id="do-not-remove-from-journey-planners"
                                        name="removeFromJourneyPlanners"
                                        type="radio"
                                        value="no"
                                    />
                                    <label
                                        className="govuk-label govuk-radios__label"
                                        htmlFor="do-not-remove-from-journey-planners"
                                    >
                                        No
                                    </label>
                                </div>
                            </div>
                        </fieldset>
                        <FormGroupWrapper errorIds={["disruption-delay"]} errors={pageState.errors}>
                            <fieldset className="govuk-fieldset" role="group" aria-describedby="disruption-delay-hint">
                                <legend className="govuk-fieldset__legend">
                                    <h3 className="govuk-heading-l govuk-!-margin-bottom-0">
                                        How long is the disruption delay?
                                    </h3>
                                </legend>
                                <div id="disruption-delay-hint" className="govuk-hint">
                                    Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm.
                                </div>
                                <TimeSelector
                                    input={pageState.inputs["disruption-delay"]}
                                    disabled={false}
                                    inputId="disruption-delay"
                                    inputName="disruptionDelay"
                                    pageState={pageState}
                                    updatePageState={setPageState}
                                    updaterFunction={updatePageStateForInput}
                                />
                            </fieldset>
                        </FormGroupWrapper>
                        <FormGroupWrapper errorIds={["disruption-severity"]} errors={pageState.errors}>
                            <div className="govuk-form-group pb-8">
                                <label className="govuk-label govuk-label--l" htmlFor="disruption-severity">
                                    Who is the operator?
                                </label>
                                <FormElementWrapper
                                    errors={pageState.errors}
                                    errorId="disruption-severity"
                                    errorClass="govuk-select--error"
                                >
                                    <select
                                        className="govuk-select w-3/4"
                                        id="disruption-severity"
                                        name="disruptionSeverity"
                                        defaultValue={pageState.inputs["disruption-severity"] || ""}
                                        onBlur={(e) => {
                                            const input = e.target.value;
                                            if (!input) {
                                                updatePageStateForInput(
                                                    pageState,
                                                    setPageState,
                                                    "disruption-severity",
                                                    input,
                                                    {
                                                        id: "disruption-severity",
                                                        errorMessage: "Select a severity from the dropdown",
                                                    },
                                                );
                                            } else {
                                                updatePageStateForInput(
                                                    pageState,
                                                    setPageState,
                                                    "disruption-severity",
                                                    input,
                                                );
                                            }
                                        }}
                                    >
                                        {getOptions("severity", [])}
                                    </select>
                                </FormElementWrapper>
                            </div>
                        </FormGroupWrapper>
                        <fieldset className="govuk-fieldset pb-4">
                            <legend className="govuk-fieldset__legend" id="disruption-repeat-hint">
                                <h3 className="govuk-heading-l govuk-!-margin-bottom-0">
                                    What is the direction of the disruption?
                                </h3>
                            </legend>
                            <div className="govuk-radios" data-module="govuk-radios">
                                <div className="govuk-radios__item">
                                    <input
                                        className="govuk-radios__input"
                                        id="disruption-direction"
                                        name="disruptionDirection"
                                        type="radio"
                                        value="allDirections"
                                    />
                                    <label className="govuk-label govuk-radios__label" htmlFor="disruption-direction">
                                        All directions
                                    </label>
                                </div>
                                <div className="govuk-radios__item">
                                    <input
                                        className="govuk-radios__input"
                                        id="inbound-disruption-direction"
                                        name="disruptionDirection"
                                        type="radio"
                                        value="inbound"
                                    />
                                    <label
                                        className="govuk-label govuk-radios__label"
                                        htmlFor="inbound-disruption-direction"
                                    >
                                        Inbound
                                    </label>
                                </div>
                                <div className="govuk-radios__item">
                                    <input
                                        className="govuk-radios__input"
                                        id="outbound-disruption-direction"
                                        name="disruptionDirection"
                                        type="radio"
                                        value="outbound"
                                    />
                                    <label
                                        className="govuk-label govuk-radios__label"
                                        htmlFor="outbound-disruption-direction"
                                    >
                                        Outbound
                                    </label>
                                </div>
                            </div>
                        </fieldset>
                        <button className="govuk-button mt-8" data-module="govuk-button">
                            Save and continue
                        </button>
                    </div>
                </>
            </form>
        </BaseLayout>
    );
};

export const getServerSideProps = (): { props: object } => {
    const inputs: PageState = {
        errors: [],
        inputs: {
            "consequence-operator": "",
            description: "",
            "remove-from-journey-planners": "",
            "disruption-delay": "",
            "disruption-severity": "",
            "disruption-direction": "",
        },
    };

    return {
        props: { inputs },
    };
};

export default CreateConsequenceOperator;
