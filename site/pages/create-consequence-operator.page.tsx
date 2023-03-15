import { NextPageContext } from "next";
import Link from "next/link";
import { parseCookies } from "nookies";
import { ReactElement, useState } from "react";
import { z } from "zod";
import Radios from "../components/form/Radios";
import Select from "../components/form/Select";
import Table from "../components/form/Table";
import TextInput from "../components/form/TextInput";
import TimeSelector from "../components/form/TimeSelector";
import { BaseLayout } from "../components/layout/Layout";
import {
    ADD_CONSEQUENCE_PAGE_PATH,
    CONSEQUENCE_TYPES,
    COOKIES_CONSEQUENCE_TYPE_INFO,
    DISRUPTION_SEVERITIES,
    OPERATORS,
    VEHICLE_MODES,
} from "../constants";
import { ErrorInfo } from "../interfaces";
import { typeOfConsequenceSchema } from "../schemas/type-of-consequence.schema";
import { redirectTo } from "../utils";

const title = "Create Consequence Operator";
const description = "Create Consequence Operator page for the Create Transport Disruptions Service";

interface CreateConsequenceOperatorProps {
    inputs: ConsequenceOperatorPageState;
    previousConsequenceInformation: z.infer<typeof typeOfConsequenceSchema>;
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
                                        VEHICLE_MODES.find(
                                            (mode) => mode.value === previousConsequenceInformation.modeOfTransport,
                                        )?.display,
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
                                        CONSEQUENCE_TYPES.find(
                                            (type) => type.value === previousConsequenceInformation.consequenceType,
                                        )?.display,
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
                            inputName="consequence-operator"
                            display="Who is the operator?"
                            displaySize="l"
                            defaultDisplay="Select an operator"
                            selectValues={OPERATORS}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs["consequence-operator"]}
                        />

                        <TextInput<ConsequenceOperatorPageInputs>
                            display="Consequence description"
                            displaySize="l"
                            hint="What advice would you like to display?"
                            inputName="description"
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
                            disabled={false}
                            inputName="disruption-delay"
                            stateUpdater={stateUpdater}
                        />

                        <Select<ConsequenceOperatorPageInputs>
                            inputName="disruption-severity"
                            display="What is the severity of the disruption?"
                            displaySize="l"
                            defaultDisplay="Select a severity"
                            selectValues={DISRUPTION_SEVERITIES}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs["disruption-severity"]}
                        />

                        <Radios<ConsequenceOperatorPageInputs>
                            display="What is the direction of the disruption?"
                            displaySize="l"
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

export const getServerSideProps = (ctx: NextPageContext): { props: object } | void => {
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

    const typeCookie = parseCookies(ctx)[COOKIES_CONSEQUENCE_TYPE_INFO];

    if (typeCookie) {
        const previousConsequenceInformation = typeOfConsequenceSchema.safeParse(JSON.parse(typeCookie));

        if (previousConsequenceInformation.success) {
            return {
                props: { inputs, previousConsequenceInformation: previousConsequenceInformation.data },
            };
        }
    }

    if (ctx.res) {
        redirectTo(ctx.res, ADD_CONSEQUENCE_PAGE_PATH);
    }

    return;
};

export default CreateConsequenceOperator;
