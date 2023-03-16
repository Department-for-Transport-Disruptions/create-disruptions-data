import { NextPageContext } from "next";
import { parseCookies } from "nookies";
import { ReactElement, useState } from "react";
import { z } from "zod";
import ErrorSummary from "../components/ErrorSummary";
import Checkbox from "../components/form/Checkbox";
import DateSelector from "../components/form/DateSelector";
import Radios from "../components/form/Radios";
import Select from "../components/form/Select";
import TextInput from "../components/form/TextInput";
import TimeSelector from "../components/form/TimeSelector";
import { BaseLayout } from "../components/layout/Layout";
import { DISRUPTION_REASONS, COOKIES_DISRUPTION_INFO, COOKIES_DISRUPTION_ERRORS } from "../constants/index";
import { PageState } from "../interfaces";
import { createDisruptionSchema, Disruption } from "../schemas/create-disruption.schema";
import { getStateUpdater } from "../utils/formUtils";

const title = "Create Disruptions";
const description = "Create Disruptions page for the Create Transport Disruptions Service";

export interface DisruptionPageInputs extends Partial<Disruption> {}

const CreateDisruption = (initialState: PageState<Partial<DisruptionPageInputs>>): ReactElement => {
    const [pageState, setDisruptionPageState] = useState<PageState<Partial<DisruptionPageInputs>>>(initialState);

    const stateUpdater = getStateUpdater(setDisruptionPageState, pageState);

    return (
        <BaseLayout title={title} description={description} errors={initialState.errors}>
            <form action="/api/create-disruption" method="post">
                <>
                    <ErrorSummary errors={initialState.errors} />
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">Create a new disruption</h1>

                        <Radios<DisruptionPageInputs>
                            display="Type of disruption"
                            radioDetail={[
                                {
                                    value: "planned",
                                    display: "Planned",
                                },
                                {
                                    value: "unplanned",
                                    display: "Unplanned",
                                },
                            ]}
                            inputName="disruptionType"
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.disruptionType}
                            initialErrors={pageState.errors}
                        />

                        <TextInput<DisruptionPageInputs>
                            display="Summary"
                            inputName="summary"
                            widthClass="w-3/4"
                            maxLength={50}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.summary}
                            initialErrors={pageState.errors}
                            schema={createDisruptionSchema.shape.summary}
                        />

                        <TextInput<DisruptionPageInputs>
                            display="Description"
                            inputName="description"
                            widthClass="w-3/4"
                            textArea
                            rows={3}
                            maxLength={500}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.description}
                            initialErrors={pageState.errors}
                            schema={createDisruptionSchema.shape.description}
                        />

                        <TextInput<DisruptionPageInputs>
                            inputName="associatedLink"
                            display="Associated Link (optional)"
                            widthClass="w-3/4"
                            maxLength={50}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.associatedLink}
                            schema={createDisruptionSchema.shape.associatedLink}
                        />

                        <Select<DisruptionPageInputs>
                            inputName="disruptionReason"
                            display="Reason for disruption"
                            defaultDisplay="Select a reason"
                            selectValues={DISRUPTION_REASONS}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.disruptionReason}
                            initialErrors={pageState.errors}
                            schema={createDisruptionSchema.shape.disruptionReason}
                        />
                    </div>
                    <div className="govuk-form-group govuk-!-padding-top-3">
                        <h2 className="govuk-heading-l">When is the disruption?</h2>

                        <DateSelector<DisruptionPageInputs>
                            display="Start date"
                            hiddenHint="Enter in format DD/MM/YYYY"
                            value={pageState.inputs.disruptionStartDate}
                            disabled={false}
                            disablePast={false}
                            inputName="disruptionStartDate"
                            stateUpdater={stateUpdater}
                            initialErrors={pageState.errors}
                            schema={createDisruptionSchema.shape.disruptionStartDate}
                        />

                        <TimeSelector<DisruptionPageInputs>
                            display="Start time"
                            hint="Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm"
                            value={pageState.inputs.disruptionStartTime}
                            disabled={false}
                            inputName="disruptionStartTime"
                            stateUpdater={stateUpdater}
                            initialErrors={pageState.errors}
                            schema={createDisruptionSchema.shape.disruptionStartTime}
                        />

                        <DateSelector<DisruptionPageInputs>
                            display="End date"
                            hiddenHint="Enter in format DD/MM/YYYY"
                            value={pageState.inputs.disruptionEndDate}
                            disabled={pageState.inputs.disruptionNoEndDateTime === "true"}
                            disablePast={false}
                            inputName="disruptionEndDate"
                            stateUpdater={stateUpdater}
                            initialErrors={pageState.errors}
                            schema={createDisruptionSchema.shape.disruptionEndDate}
                        />

                        <TimeSelector<DisruptionPageInputs>
                            display="End time"
                            hint="Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm"
                            value={pageState.inputs.disruptionEndTime}
                            disabled={pageState.inputs.disruptionNoEndDateTime === "true"}
                            inputName="disruptionEndTime"
                            stateUpdater={stateUpdater}
                            initialErrors={pageState.errors}
                            schema={createDisruptionSchema.shape.disruptionEndTime}
                        />

                        <Checkbox<DisruptionPageInputs>
                            inputName="disruptionNoEndDateTime"
                            display="Does the disruption have an end datetime?"
                            hideLegend
                            checkboxDetail={[
                                {
                                    display: "No end date/time",
                                    value: "true",
                                    checked: pageState.inputs.disruptionNoEndDateTime === "true",
                                },
                            ]}
                            stateUpdater={stateUpdater}
                            initialErrors={pageState.errors}
                        />

                        <Radios<DisruptionPageInputs>
                            display="Does this disruption repeat?"
                            value={pageState.inputs.disruptionRepeats ?? ""}
                            inputName="disruptionRepeats"
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
                            paddingTop={6}
                            stateUpdater={stateUpdater}
                            initialErrors={pageState.errors}
                        />
                    </div>
                    <div className="govuk-form-group govuk-!-padding-top-3">
                        <h2 className="govuk-heading-l">When does the disruption need to be published?</h2>

                        <DateSelector<DisruptionPageInputs>
                            display="Start date"
                            hiddenHint="Enter in format DD/MM/YYYY"
                            value={pageState.inputs.publishStartDate}
                            disabled={false}
                            disablePast={false}
                            inputName="publishStartDate"
                            stateUpdater={stateUpdater}
                            initialErrors={pageState.errors}
                            schema={createDisruptionSchema.shape.publishStartDate}
                        />

                        <TimeSelector<DisruptionPageInputs>
                            display="Start time"
                            hint="Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm"
                            value={pageState.inputs.publishStartTime}
                            disabled={false}
                            inputName="publishStartTime"
                            stateUpdater={stateUpdater}
                            initialErrors={pageState.errors}
                            schema={createDisruptionSchema.shape.publishStartTime}
                        />

                        <DateSelector<DisruptionPageInputs>
                            display="End date"
                            hiddenHint="Enter in format DD/MM/YYYY"
                            value={pageState.inputs.publishEndDate}
                            disabled={pageState.inputs.publishNoEndDateTime === "true"}
                            disablePast={false}
                            inputName="publishEndDate"
                            stateUpdater={stateUpdater}
                            initialErrors={pageState.errors}
                            schema={createDisruptionSchema.shape.publishEndDate}
                        />

                        <TimeSelector<DisruptionPageInputs>
                            display="End time"
                            hint="Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm"
                            value={pageState.inputs.publishEndTime}
                            disabled={pageState.inputs.publishNoEndDateTime === "true"}
                            inputName="publishEndTime"
                            stateUpdater={stateUpdater}
                            initialErrors={pageState.errors}
                            schema={createDisruptionSchema.shape.publishEndTime}
                        />

                        <Checkbox<DisruptionPageInputs>
                            inputName="publishNoEndDateTime"
                            display="Does the disruption have an end datetime?"
                            hideLegend
                            checkboxDetail={[
                                {
                                    display: "No end date/time",
                                    value: "true",
                                    checked: pageState.inputs.publishNoEndDateTime === "true",
                                },
                            ]}
                            stateUpdater={stateUpdater}
                            initialErrors={pageState.errors}
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

export const getServerSideProps = (ctx: NextPageContext): { props: PageState<Partial<DisruptionPageInputs>> } => {
    let pageState: PageState<Partial<DisruptionPageInputs>> = {
        errors: [],
        inputs: {},
    };

    const cookies = parseCookies(ctx);

    const dataCookie = cookies[COOKIES_DISRUPTION_INFO];
    const errorCookie = cookies[COOKIES_DISRUPTION_ERRORS];

    if (dataCookie) {
        const parsedData = createDisruptionSchema.safeParse(JSON.parse(dataCookie));

        if (parsedData.success) {
            return {
                props: {
                    inputs: parsedData.data,
                    errors: [],
                },
            };
        }
    } else if (errorCookie) {
        pageState = JSON.parse(errorCookie) as PageState<Partial<DisruptionPageInputs>>;
    }

    return {
        props: pageState,
    };
};

export default CreateDisruption;
