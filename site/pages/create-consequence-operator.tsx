import { ReactElement, useState } from "react";
import Radios from "../components/form/Radios";
import Select from "../components/form/Select";
import TextInput from "../components/form/TextInput";
import TimeSelector from "../components/form/TimeSelector";
import { BaseLayout } from "../components/layout/Layout";
import { DISRUPTION_SEVERITIES, OPERATORS } from "../constants";
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

const CreateConsequenceOperator = ({ inputs }: CreateConsequenceOperatorProps): ReactElement => {
    const [pageState, setPageState] = useState<PageState>(inputs);

    const updatePageStateForInput = (inputName: keyof PageInputs, input: string, error?: ErrorInfo): void => {
        setPageState({
            inputs: {
                ...pageState.inputs,
                [inputName]: input,
            },
            errors: [
                ...(error
                    ? [...pageState.errors, error]
                    : [...pageState.errors.filter((error) => error.id !== inputName)]),
            ],
        });
    };

    const stateUpdater = (change: string, field: keyof PageInputs) => {
        updatePageStateForInput(field, change);
    };

    return (
        <BaseLayout title={title} description={description}>
            <form action="/api/createConsequenceOperator" method="post">
                <>
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">Add a Consequence</h1>

                        <div className="govuk-form-group">
                            <Select<PageInputs>
                                inputId="consequence-operator"
                                inputName="consequence-operator"
                                display="Who is the operator?"
                                displaySize="l"
                                defaultDisplay="Select an operator"
                                errorMessage="Select an operator from the dropdown"
                                selectValues={OPERATORS}
                                stateUpdater={stateUpdater}
                                value={pageState.inputs["consequence-operator"]}
                            />
                        </div>

                        <TextInput<PageInputs>
                            inputId="description"
                            display="Description"
                            displaySize="l"
                            inputName="description"
                            errorMessage="Enter a description for this disruption"
                            widthClass="w-3/4"
                            textArea
                            rows={3}
                            maxLength={500}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.description}
                        />

                        <Radios<PageInputs>
                            display="Would you like to remove this from journey planners?"
                            displaySize="l"
                            inputId="remove-from-journey-planners"
                            radioDetail={[
                                {
                                    value: "yes",
                                    display: "Yes",
                                },
                                {
                                    value: "no",
                                    display: "No",
                                },
                            ]}
                            inputName="remove-from-journey-planners"
                            stateUpdater={stateUpdater}
                            value={pageState.inputs["remove-from-journey-planners"]}
                        />

                        <TimeSelector<PageInputs>
                            display="How long is the disruption delay?"
                            displaySize="l"
                            hint="Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm"
                            value={pageState.inputs["disruption-delay"]}
                            errorMessage="Enter a time for the disruption delay"
                            disabled={false}
                            inputId="disruption-delay"
                            inputName="disruption-delay"
                            stateUpdater={stateUpdater}
                        />

                        <Select<PageInputs>
                            inputId="disruption-severity"
                            inputName="disruption-severity"
                            display="What is the severity of the disruption?"
                            displaySize="l"
                            defaultDisplay="Select a severity"
                            errorMessage="Select a severity from the dropdown"
                            selectValues={DISRUPTION_SEVERITIES}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs["disruption-severity"]}
                        />

                        <Radios<PageInputs>
                            display="What is the direction of the disruption?"
                            displaySize="l"
                            inputId="disruption-direction"
                            radioDetail={[
                                {
                                    value: "allDirections",
                                    display: "All directions",
                                },
                                {
                                    value: "inbound",
                                    display: "Inbound",
                                },
                                {
                                    value: "outbound",
                                    display: "Outbound",
                                },
                            ]}
                            inputName="disruption-direction"
                            stateUpdater={stateUpdater}
                            value={pageState.inputs["disruption-direction"]}
                        />

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
