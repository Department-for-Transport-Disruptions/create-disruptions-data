import { ReactElement, useEffect, useState } from "react";
import Checkbox from "../components/form/Checkbox";
import DateSelector from "../components/form/DateSelector";
import Radios from "../components/form/Radios";
import Select from "../components/form/Select";
import TextInput from "../components/form/TextInput";
import TimeSelector from "../components/form/TimeSelector";
import { BaseLayout } from "../components/layout/Layout";
import { DISRUPTION_REASONS } from "../constants/index";
import { ErrorInfo } from "../interfaces";

const title = "Create Disruptions";
const description = "Create Disruptions page for the Create Transport Disruptions Service";

interface CreateDisruptionProps {
    inputs: PageState;
}

export interface PageInputs {
    "type-of-disruption": string;
    summary: string;
    description: string;
    "associated-link": string;
    "disruption-reason": string;
    "disruption-start-date": Date | null;
    "disruption-end-date": Date | null;
    "disruption-start-time": string;
    "disruption-end-time": string;
    "disruption-no-end-date-time": string;
    "disruption-repeats": "yes" | "no";
    "publish-start-date": Date | null;
    "publish-end-date": Date | null;
    "publish-start-time": string;
    "publish-end-time": string;
    "publish-no-end-date-time": string;
}

export interface PageState {
    errors: ErrorInfo[];
    inputs: PageInputs;
}

const CreateDisruption = ({ inputs }: CreateDisruptionProps): ReactElement => {
    const [pageState, setPageState] = useState<PageState>(inputs);

    const updatePageStateForInput = (
        inputName: keyof PageInputs,
        input: string | Date | null,
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

    useEffect(() => {
        if (pageState.inputs["disruption-no-end-date-time"]) {
            setPageState({
                ...pageState,
                errors: pageState.errors.filter((error) => !error.id.includes("disruption-end")),
            });
        }
    }, [pageState]);

    useEffect(() => {
        if (pageState.inputs["publish-no-end-date-time"]) {
            setPageState({
                ...pageState,
                errors: pageState.errors.filter((error) => !error.id.includes("publish-end")),
            });
        }
    }, [pageState]);

    const stateUpdater = (change: string | null, field: keyof PageInputs) => {
        updatePageStateForInput(field, change);
    };

    return (
        <BaseLayout title={title} description={description}>
            <form action="/api/createDisruption" method="post">
                <>
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">Create a new Disruption</h1>

                        <Radios<PageInputs>
                            display="Type of disruption"
                            inputId="type-of-disruption"
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
                            inputName="typeOfDisruption"
                            stateUpdater={stateUpdater}
                            value={pageState.inputs["type-of-disruption"]}
                        />

                        <TextInput<PageInputs>
                            inputId="summary"
                            display="Summary"
                            inputName="summary"
                            errorMessage="Enter a summary for this disruption"
                            widthClass="w-3/4"
                            maxLength={50}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.summary}
                        />

                        <TextInput<PageInputs>
                            inputId="description"
                            display="Description"
                            inputName="description"
                            errorMessage="Enter a description for this disruption"
                            widthClass="w-3/4"
                            maxLength={500}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.description}
                        />

                        <TextInput<PageInputs>
                            inputId="associated-link"
                            display="Associated Link (optional)"
                            inputName="associatedLink"
                            optional
                            widthClass="w-3/4"
                            maxLength={50}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs["associated-link"]}
                        />

                        <Select<PageInputs>
                            inputId="disruption-reason"
                            inputName="disruptionReason"
                            display="Reason for disruption"
                            defaultDisplay="Select a reason"
                            errorMessage="Select a reason from the dropdown"
                            selectValues={DISRUPTION_REASONS}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs["disruption-reason"]}
                        />
                    </div>
                    <div className="govuk-form-group govuk-!-padding-top-3">
                        <h2 className="govuk-heading-l">When is the disruption?</h2>

                        {/* <DateSelector
                            header="What is the start date?"
                            hiddenHint="Enter in format DD/MM/YYYY"
                            input={pageState.inputs["disruption-start-date"]}
                            disabled={false}
                            disablePast={false}
                            inputId="disruption-start-date"
                            inputName="disruptionStartDate"
                            pageState={pageState}
                            updatePageState={setPageState}
                            updaterFunction={updatePageStateForInput}
                        /> */}

                        <TimeSelector<PageInputs>
                            display="What is the start time?"
                            hint="Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm"
                            value={pageState.inputs["disruption-start-time"]}
                            errorMessage="Enter a start time for the disruption"
                            disabled={false}
                            inputId="disruption-start-time"
                            inputName="disruptionStartTime"
                            stateUpdater={stateUpdater}
                        />

                        {/* <DateSelector
                            header="What is the end date?"
                            hiddenHint="Enter in format DD/MM/YYYY"
                            disablePast
                            input={pageState.inputs["disruption-end-date"] || null}
                            disabled={noDisruptionEndRequired}
                            inputId="disruption-end-date"
                            inputName="disruptionEndDateDay"
                            pageState={pageState}
                            updatePageState={setPageState}
                            updaterFunction={updatePageStateForInput}
                        /> */}

                        <TimeSelector<PageInputs>
                            display="What is the end time?"
                            hint="Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm"
                            value={pageState.inputs["disruption-end-time"]}
                            errorMessage="Enter an end time for the disruption"
                            disabled={pageState.inputs["disruption-no-end-date-time"] === "checked"}
                            inputId="disruption-end-time"
                            inputName="disruptionEndTime"
                            stateUpdater={stateUpdater}
                        />

                        <Checkbox<PageInputs>
                            inputId="disruption-no-end-date-time"
                            inputName="disruptionHasNoEndDateTime"
                            display="Does the disruption have an end datetime?"
                            hideLegend
                            checkboxDetail={[
                                {
                                    display: "No end date/time",
                                    value: "noDisruptionEndDateTime",
                                    checked: pageState.inputs["publish-no-end-date-time"] !== "",
                                },
                            ]}
                            stateUpdater={stateUpdater}
                        />

                        <Radios<PageInputs>
                            display="Does this disruption repeat?"
                            inputId="disruption-repeats"
                            value={pageState.inputs["disruption-repeats"]}
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
                        />
                    </div>
                    <div className="govuk-form-group govuk-!-padding-top-3">
                        <h2 className="govuk-heading-l">When does the disruption need to be published?</h2>

                        {/* <DateSelector
                            header="What is the start date?"
                            hiddenHint="Enter in format DD/MM/YYYY"
                            input={pageState.inputs["publish-start-date"]}
                            disabled={false}
                            disablePast={false}
                            inputId="publish-start-date"
                            inputName="publishStartDateDay"
                            pageState={pageState}
                            updatePageState={setPageState}
                            updaterFunction={updatePageStateForInput}
                        /> */}

                        <TimeSelector<PageInputs>
                            display="What is the start time?"
                            hint="Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm"
                            value={pageState.inputs["publish-start-time"]}
                            errorMessage="Enter a publication start time for the disruption"
                            disabled={false}
                            inputId="publish-start-time"
                            inputName="publishStartTime"
                            stateUpdater={stateUpdater}
                        />

                        {/* <DateSelector
                            header="What is the end date?"
                            hiddenHint="Enter in format DD/MM/YYYY"
                            disablePast
                            input={pageState.inputs["publish-end-date"]}
                            disabled={noPublishEndRequired}
                            inputId="publish-end-date"
                            inputName="publishEndDateDay"
                            pageState={pageState}
                            updatePageState={setPageState}
                            updaterFunction={updatePageStateForInput}
                        /> */}

                        <TimeSelector<PageInputs>
                            display="What is the end time?"
                            hint="Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm"
                            value={pageState.inputs["publish-end-time"]}
                            errorMessage="Enter a publication end time for the disruption"
                            disabled={pageState.inputs["publish-no-end-date-time"] === "checked"}
                            inputId="publish-end-time"
                            inputName="publishEndTime"
                            stateUpdater={stateUpdater}
                        />

                        <Checkbox<PageInputs>
                            inputId="publish-no-end-date-time"
                            inputName="publishHasNoEndDateTime"
                            display="Does the disruption have an end datetime?"
                            hideLegend
                            checkboxDetail={[
                                {
                                    display: "No end date/time",
                                    value: "noPublishEndDateTime",
                                    checked: pageState.inputs["publish-no-end-date-time"] !== "",
                                },
                            ]}
                            stateUpdater={stateUpdater}
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
            "type-of-disruption": "",
            summary: "",
            description: "",
            "associated-link": "",
            "disruption-reason": "",
            "disruption-repeats": "no",
            "disruption-start-date": null,
            "disruption-end-date": null,
            "disruption-start-time": "",
            "disruption-end-time": "",
            "disruption-no-end-date-time": "",
            "publish-start-date": null,
            "publish-end-date": null,
            "publish-start-time": "",
            "publish-end-time": "",
            "publish-no-end-date-time": "",
        },
    };

    return {
        props: { inputs },
    };
};

export default CreateDisruption;
