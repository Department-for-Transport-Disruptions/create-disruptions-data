import Link from "next/link";
import { ReactElement, useState } from "react";
import Radios from "../components/form/Radios";
import Select from "../components/form/Select";
import Table from "../components/form/Table";
import TextInput from "../components/form/TextInput";
import TimeSelector from "../components/form/TimeSelector";
import { BaseLayout } from "../components/layout/Layout";
import { DISRUPTION_SEVERITIES } from "../constants";
import { ErrorInfo } from "../interfaces";

const title = "Create Consequence Network";
const description = "Create Consequence Network page for the Create Transport Disruptions Service";

interface CreateConsequenceNetworkProps {
    inputs: PageState;
    previousConsequenceInformation: { modeOfTransport: string; consequenceType: string };
}

export interface ConsequenceNetworkPageInputs {
    description: string;
    "remove-from-journey-planners": string;
    "disruption-delay": string;
    "disruption-severity": string;
    "disruption-direction": string;
}

export interface PageState {
    errors: ErrorInfo[];
    inputs: ConsequenceNetworkPageInputs;
}

const CreateConsequenceNetwork = ({
    inputs,
    previousConsequenceInformation,
}: CreateConsequenceNetworkProps): ReactElement => {
    const [pageState, setPageState] = useState<PageState>(inputs);

    const updatePageStateForInput = (
        inputName: keyof ConsequenceNetworkPageInputs,
        input: string,
        error?: ErrorInfo,
    ): void => {
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

    const stateUpdater = (change: string, field: keyof ConsequenceNetworkPageInputs) => {
        updatePageStateForInput(field, change);
    };

    return (
        <BaseLayout title={title} description={description}>
            <form action="/api/createConsequenceNetwork" method="post">
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

                        <TextInput<ConsequenceNetworkPageInputs>
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

                        <Radios<ConsequenceNetworkPageInputs>
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

                        <TimeSelector<ConsequenceNetworkPageInputs>
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

                        <Select<ConsequenceNetworkPageInputs>
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

                        <Radios<ConsequenceNetworkPageInputs>
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
            description: "",
            "remove-from-journey-planners": "",
            "disruption-delay": "",
            "disruption-severity": "",
            "disruption-direction": "",
        },
    };

    const previousConsequenceInformation = { modeOfTransport: "Bus", consequenceType: "Network wide" };

    return {
        props: { inputs, previousConsequenceInformation },
    };
};

export default CreateConsequenceNetwork;
