import { NextPageContext } from "next";
import Link from "next/link";
import { parseCookies } from "nookies";
import { ReactElement, useState } from "react";
import { z } from "zod";
import ErrorSummary from "../components/ErrorSummary";
import Radios from "../components/form/Radios";
import Select from "../components/form/Select";
import Table from "../components/form/Table";
import TextInput from "../components/form/TextInput";
import TimeSelector from "../components/form/TimeSelector";
import { BaseLayout } from "../components/layout/Layout";
import {
    CONSEQUENCE_TYPES,
    COOKIES_CONSEQUENCE_OPERATOR_ERRORS,
    COOKIES_CONSEQUENCE_OPERATOR_INFO,
    COOKIES_CONSEQUENCE_TYPE_INFO,
    DISRUPTION_SEVERITIES,
    OPERATORS,
    VEHICLE_MODES,
} from "../constants";
import { ErrorInfo, PageState } from "../interfaces";
import { createConsequenceOperatorSchema } from "../schemas/create-consequence-operator.schema";
import { typeOfConsequenceSchema } from "../schemas/type-of-consequence.schema";
import { getDisplayByValue, getPageStateFromCookies } from "../utils";

const title = "Create Consequence Operator";
const description = "Create Consequence Operator page for the Create Transport Disruptions Service";

interface CreateConsequenceOperatorProps {
    inputs: PageState<Partial<ConsequenceOperatorPageInputs>>;
    previousConsequenceInformation: z.infer<typeof typeOfConsequenceSchema>;
}

export interface ConsequenceOperatorPageInputs extends Partial<z.infer<typeof createConsequenceOperatorSchema>> {}

const CreateConsequenceOperator = ({
    inputs,
    previousConsequenceInformation,
}: CreateConsequenceOperatorProps): ReactElement => {
    const [pageState, setConsequenceOperatorPageState] =
        useState<PageState<Partial<ConsequenceOperatorPageInputs>>>(inputs);

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
            <form action="/api/create-consequence-operator" method="post">
                <>
                    <ErrorSummary errors={inputs.errors} />
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">Add a consequence</h1>
                        <Table
                            rows={[
                                {
                                    header: "Mode of transport",
                                    cells: [
                                        getDisplayByValue(
                                            VEHICLE_MODES,
                                            previousConsequenceInformation.modeOfTransport,
                                        ),
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
                                        getDisplayByValue(
                                            CONSEQUENCE_TYPES,
                                            previousConsequenceInformation.consequenceType,
                                        ),
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
                            inputName="consequenceOperator"
                            display="Who is the operator?"
                            displaySize="l"
                            defaultDisplay="Select an operator"
                            selectValues={OPERATORS}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs["consequenceOperator"]}
                            initialErrors={pageState.errors}
                            schema={createConsequenceOperatorSchema.shape.consequenceOperator}
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
                            initialErrors={pageState.errors}
                            schema={createConsequenceOperatorSchema.shape.description}
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
                            inputName="removeFromJourneyPlanners"
                            stateUpdater={stateUpdater}
                            value={pageState.inputs["removeFromJourneyPlanners"]}
                            initialErrors={pageState.errors}
                            schema={createConsequenceOperatorSchema.shape.removeFromJourneyPlanners}
                        />

                        <TimeSelector<ConsequenceOperatorPageInputs>
                            display="How long is the disruption delay?"
                            displaySize="l"
                            hint="Enter the time in the format hhmm. For example 4800 is 48 hours"
                            value={pageState.inputs["disruptionDelay"]}
                            disabled={false}
                            inputName="disruptionDelay"
                            stateUpdater={stateUpdater}
                            initialErrors={pageState.errors}
                            schema={createConsequenceOperatorSchema.shape.disruptionDelay}
                        />

                        <Select<ConsequenceOperatorPageInputs>
                            inputName="disruptionSeverity"
                            display="What is the severity of the disruption?"
                            displaySize="l"
                            defaultDisplay="Select a severity"
                            selectValues={DISRUPTION_SEVERITIES}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs["disruptionSeverity"]}
                            initialErrors={pageState.errors}
                            schema={createConsequenceOperatorSchema.shape.disruptionSeverity}
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
                            inputName="disruptionDirection"
                            stateUpdater={stateUpdater}
                            value={pageState.inputs["disruptionDirection"]}
                            initialErrors={pageState.errors}
                            schema={createConsequenceOperatorSchema.shape.disruptionDirection}
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
    let inputs: PageState<Partial<ConsequenceOperatorPageInputs>> = {
        errors: [],
        inputs: {},
    };

    let previousConsequenceInformationData = {};

    const cookies = parseCookies(ctx);
    const typeCookie = cookies[COOKIES_CONSEQUENCE_TYPE_INFO];
    const dataCookie = cookies[COOKIES_CONSEQUENCE_OPERATOR_INFO];
    const errorCookie = cookies[COOKIES_CONSEQUENCE_OPERATOR_ERRORS];

    if (typeCookie) {
        const previousConsequenceInformation = typeOfConsequenceSchema.safeParse(JSON.parse(typeCookie));

        if (previousConsequenceInformation.success) {
            previousConsequenceInformationData = previousConsequenceInformation.data;
        }
    }

    inputs = getPageStateFromCookies<ConsequenceOperatorPageInputs>(
        dataCookie,
        errorCookie,
        createConsequenceOperatorSchema,
    );

    return { props: { inputs: inputs, previousConsequenceInformation: previousConsequenceInformationData } };
};

export default CreateConsequenceOperator;
