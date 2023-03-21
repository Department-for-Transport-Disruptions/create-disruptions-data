import Link from "next/link";
import { BaseLayout } from "../components/layout/Layout";
import { CONSEQUENCE_TYPES, DISRUPTION_SEVERITIES, VEHICLE_MODES } from "../constants";
import { getDisplayByValue } from "../utils";
import { z } from "zod";
import { createConsequenceStopsSchema } from "../schemas/create-consequence-stops.schema";
import { CreateConsequenceProps, PageState } from "../interfaces";
import { ReactElement, useState } from "react";
import ErrorSummary from "../components/ErrorSummary";
import Table from "../components/form/Table";
import TextInput from "../components/form/TextInput";
import { getStateUpdater } from "../utils/formUtils";
import Radios from "../components/form/Radios";
import TimeSelector from "../components/form/TimeSelector";
import { Select } from "@mui/material";

const title = "Create Consequence Stops";
const description = "Create Consequence Stops page for the Create Transport Disruptions Service";

export interface ConsequenceStopsPageInputs extends Partial<z.infer<typeof createConsequenceStopsSchema>> {}

const CreateConsequenceStops = ({
    inputs,
    previousConsequenceInformation,
}: CreateConsequenceProps<ConsequenceStopsPageInputs>): ReactElement => {
    const [pageState, setPageState] = useState<PageState<Partial<ConsequenceStopsPageInputs>>>(inputs);
    const stateUpdater = getStateUpdater(setPageState, pageState);
    <BaseLayout title={title} description={description}>
        <form action="/api/create-consequence-network" method="post">
            <>
                <ErrorSummary errors={inputs.errors} />
                <div className="govuk-form-group">
                    <h1 className="govuk-heading-xl">Add a consequence</h1>
                    <Table
                        rows={[
                            {
                                header: "Mode of transport",
                                cells: [
                                    getDisplayByValue(VEHICLE_MODES, previousConsequenceInformation.modeOfTransport),
                                    <Link key={"mode-of-transport"} className="govuk-link" href="/type-of-consequence">
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
                                    <Link key={"consequence-type"} className="govuk-link" href="/type-of-consequence">
                                        Change
                                    </Link>,
                                ],
                            },
                        ]}
                    />

                    <TextInput<ConsequenceStopsPageInputs>
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
                        schema={createConsequenceStopsSchema.shape.description}
                    />

                    <Radios<ConsequenceStopsPageInputs>
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
                        schema={createConsequenceStopsSchema.shape.removeFromJourneyPlanners}
                    />

                    <TimeSelector<ConsequenceStopsPageInputs>
                        display="Delay (minutes)"
                        displaySize="l"
                        hint="Enter the time in minutes"
                        value={pageState.inputs["disruptionDelay"]}
                        disabled={false}
                        inputName="disruptionDelay"
                        stateUpdater={stateUpdater}
                        initialErrors={pageState.errors}
                        schema={createConsequenceStopsSchema.shape.disruptionDelay}
                        placeholderValue=""
                    />

                    <Select<ConsequenceStopsPageInputs>
                        inputName="disruptionSeverity"
                        display="What is the severity of the disruption?"
                        displaySize="l"
                        defaultDisplay="Select severity"
                        selectValues={DISRUPTION_SEVERITIES}
                        stateUpdater={stateUpdater}
                        value={pageState.inputs["disruptionSeverity"]}
                        initialErrors={pageState.errors}
                        schema={createConsequenceStopsSchema.shape.disruptionSeverity}
                    />

                    <button className="govuk-button mt-8" data-module="govuk-button">
                        Save and continue
                    </button>
                </div>
            </>
        </form>
    </BaseLayout>;
};
