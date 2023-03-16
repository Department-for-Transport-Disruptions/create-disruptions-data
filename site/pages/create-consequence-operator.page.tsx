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
import { ErrorInfo, PageState } from "../interfaces";
import { createConsequenceOperatorSchemaRefined } from "../schemas/create-consequence-operator.schema";
import { typeOfConsequenceSchema } from "../schemas/type-of-consequence.schema";
import { getDisplayByValue, redirectTo } from "../utils";

const title = "Create Consequence Operator";
const description = "Create Consequence Operator page for the Create Transport Disruptions Service";

interface CreateConsequenceOperatorProps {
    inputs: PageState<Partial<ConsequenceOperatorPageInputs>>;
    previousConsequenceInformation: z.infer<typeof typeOfConsequenceSchema>;
}

export interface ConsequenceOperatorPageInputs
    extends Partial<z.infer<typeof createConsequenceOperatorSchemaRefined>> {}

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
                            inputName="removeFromJourneyPlanners"
                            stateUpdater={stateUpdater}
                            value={pageState.inputs["removeFromJourneyPlanners"]}
                        />

                        <TimeSelector<ConsequenceOperatorPageInputs>
                            display="How long is the disruption delay?"
                            displaySize="l"
                            hint="Enter the time in the format hhmm. For example 4800 is 48 hours"
                            value={pageState.inputs["disruptionDelay"]}
                            disabled={false}
                            inputName="disruptionDelay"
                            stateUpdater={stateUpdater}
                        />

                        <Select<ConsequenceOperatorPageInputs>
                            inputName="disruptionSeverity"
                            display="What is the severity of the disruption?"
                            displaySize="l"
                            defaultDisplay="Select a severity"
                            selectValues={DISRUPTION_SEVERITIES}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs["disruptionSeverity"]}
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
    const inputs: PageState<Partial<ConsequenceOperatorPageInputs>> = {
        errors: [],
        inputs: {},
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
