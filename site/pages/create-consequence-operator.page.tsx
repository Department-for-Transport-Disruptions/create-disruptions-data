import Link from "next/link";
import { ReactElement, useState } from "react";
import Radios from "../components/form/Radios";
import Select from "../components/form/Select";
import Table from "../components/form/Table";
import TextInput from "../components/form/TextInput";
import TimeSelector from "../components/form/TimeSelector";
import { BaseLayout } from "../components/layout/Layout";
import { DISRUPTION_SEVERITIES, OPERATORS } from "../constants";
import { ErrorInfo } from "../interfaces";

const title = "Create Consequence Operator";
const description = "Create Consequence Operator page for the Create Transport Disruptions Service";

interface CreateConsequenceOperatorProps {
    inputs: ConsequenceOperatorPageState;
    previousConsequenceInformation: { modeOfTransport: string; consequenceType: string };
}

export interface ConsequenceOperatorPageInputs {
    "consequence-operator": string;
    description: string;
    "remove-from-journey-planners": string;
    "disruption-delay": string;
    "disruption-severity": string;
    "disruption-direction": string;
}

export interface ConsequenceOperatorPageState {
    errors: ErrorInfo[];
    inputs: ConsequenceOperatorPageInputs;
}

const CreateConsequenceOperator = ({
    inputs,
    previousConsequenceInformation,
}: CreateConsequenceOperatorProps): ReactElement => {
    const [pageState, setConsequenceOperatorPageState] = useState<ConsequenceOperatorPageState>(inputs);

    const updateConsequenceOperatorPageStateForInput = (
        inputName: keyof ConsequenceOperatorPageInputs,
        input: string,
        error?: ErrorInfo,
    ): void => {
        setConsequenceOperatorPageState({
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

    const stateUpdater = (change: string, field: keyof ConsequenceOperatorPageInputs) => {
        updateConsequenceOperatorPageStateForInput(field, change);
    };

    return (
        <BaseLayout title={title} description={description}>
            <form action="/api/createConsequenceOperator" method="post">
                <>
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">Add a consequence</h1>
                        <Table
                            rows={[
                                {
                                    header: "Mode of transport",
                                    cells: [
                                        previousConsequenceInformation.modeOfTransport,
                                        <Link
                                            key={"mode-of-transport"}
                                            className="govuk-link"
                                            href="/type-of-consequence"
                                        >
                                            Change
                                        </Link>,
                                    ],
                                },
                                {
                                    header: "Consequence type",
                                    cells: [
                                        previousConsequenceInformation.consequenceType,
                                        <Link
                                            key={"consequence-type"}
                                            className="govuk-link"
                                            href="/type-of-consequence"
                                        >
                                            Change
                                        </Link>,
                                    ],
                                },
                            ]}
                        />

                        <Select<ConsequenceOperatorPageInputs>
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

                        <TextInput<ConsequenceOperatorPageInputs>
                            inputId="description"
                            display="Consequence description"
                            displaySize="l"
                            hint="What advice would you like to display?"
                            inputName="description"
                            errorMessage="Enter a description for this consequence"
                            widthClass="w-3/4"
                            textArea
                            rows={3}
                            maxLength={500}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.description}
                        />

                        <Radios<ConsequenceOperatorPageInputs>
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

                        <TimeSelector<ConsequenceOperatorPageInputs>
                            display="How long is the disruption delay?"
                            displaySize="l"
                            hint="Enter the time in the format hhmm. For example 4800 is 48 hours"
                            value={pageState.inputs["disruption-delay"]}
                            errorMessage="Enter a time for the disruption delay"
                            disabled={false}
                            inputId="disruption-delay"
                            inputName="disruption-delay"
                            stateUpdater={stateUpdater}
                        />

                        <Select<ConsequenceOperatorPageInputs>
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

                        <Radios<ConsequenceOperatorPageInputs>
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
    const inputs: ConsequenceOperatorPageState = {
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

    const previousConsequenceInformation = { modeOfTransport: "Bus", consequenceType: "Operator wide" };

    return {
        props: { inputs, previousConsequenceInformation },
    };
};

export default CreateConsequenceOperator;
