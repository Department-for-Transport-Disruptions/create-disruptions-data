import { Dispatch, ReactElement, SetStateAction, useEffect, useState } from "react";
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
    typeOfDisruption: string;
    summary: string;
    description: string;
    "associated-link": string;
    "disruption-reason": string;
    "disruption-start-date": Date | null;
    "disruption-end-date": Date | null;
    "disruption-start-time": string;
    "disruption-end-time": string;
    "publish-start-date": Date | null;
    "publish-end-date": Date | null;
    "publish-start-time": string;
    "publish-end-time": string;
}

export interface PageState {
    errors: ErrorInfo[];
    inputs: PageInputs;
}

const updatePageStateForInput = (
    currentState: PageState,
    setPageState: Dispatch<SetStateAction<PageState>>,
    inputName: keyof PageInputs,
    input: string | Date | null,
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

const CreateDisruption = ({ inputs }: CreateDisruptionProps): ReactElement => {
    const [pageState, setPageState] = useState<PageState>(inputs);
    const [noDisruptionEndRequired, setNoDisruptionEndRequired] = useState(false);
    const [noPublishEndRequired, setNoPublishEndRequired] = useState(false);

    useEffect(() => {
        if (noDisruptionEndRequired) {
            setPageState({
                ...pageState,
                errors: pageState.errors.filter((error) => !error.id.includes("disruption-end")),
            });
        }
    }, [noDisruptionEndRequired, pageState]);

    useEffect(() => {
        if (noPublishEndRequired) {
            setPageState({
                ...pageState,
                errors: pageState.errors.filter((error) => !error.id.includes("publish-end")),
            });
        }
    }, [noPublishEndRequired, pageState]);

    return (
        <BaseLayout title={title} description={description}>
            <form action="/api/createDisruption" method="post">
                <>
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">Create a new Disruption</h1>

                        <Radios
                            heading="Type of disruption"
                            pageState={pageState}
                            inputInfo={[
                                {
                                    id: "disruption-planned",
                                    name: "disruptionType",
                                    value: "planned",
                                    display: "Planned",
                                },
                                {
                                    id: "disruption-unplanned",
                                    name: "disruptionType",
                                    value: "unplanned",
                                    display: "Unplanned",
                                },
                            ]}
                        />

                        <TextInput
                            pageState={pageState}
                            inputInfo={{
                                id: "summary",
                                name: "summary",
                                display: "Summary",
                            }}
                            widthClass="w-3/4"
                            maxLength={50}
                            updatePageState={setPageState}
                            updaterFunction={updatePageStateForInput}
                        />

                        <TextInput
                            pageState={pageState}
                            inputInfo={{
                                id: "description",
                                name: "description",
                                display: "Description",
                            }}
                            widthClass="w-3/4"
                            maxLength={200}
                            textArea
                            rows={3}
                            updatePageState={setPageState}
                            updaterFunction={updatePageStateForInput}
                        />

                        <TextInput
                            pageState={pageState}
                            inputInfo={{
                                id: "associated-link",
                                name: "associatedLink",
                                display: "Associated Link (optional)",
                            }}
                            widthClass="w-3/4"
                            optional
                            maxLength={50}
                            updatePageState={setPageState}
                            updaterFunction={updatePageStateForInput}
                        />

                        <Select
                            pageState={pageState}
                            inputInfo={{
                                id: "disruption-reason",
                                name: "disruptionReason",
                                display: "Reason for disruption",
                            }}
                            selectValues={DISRUPTION_REASONS}
                            updatePageState={setPageState}
                            updaterFunction={updatePageStateForInput}
                        />
                    </div>
                    <div className="govuk-form-group govuk-!-padding-top-3">
                        <h2 className="govuk-heading-l">When is the disruption?</h2>

                        <DateSelector
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
                        />

                        <TimeSelector
                            header="What is the start time?"
                            hint={{
                                id: "disruption-start-time-hint",
                                text: "Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm",
                            }}
                            input={pageState.inputs["disruption-start-time"]}
                            disabled={false}
                            inputId="disruption-start-time"
                            inputName="disruptionStartTime"
                            pageState={pageState}
                            updatePageState={setPageState}
                            updaterFunction={updatePageStateForInput}
                        />

                        <DateSelector
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
                        />

                        <TimeSelector
                            header="What is the end time?"
                            hint={{
                                id: "disruption-end-time-hint",
                                text: "Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm",
                            }}
                            input={pageState.inputs["disruption-end-time"]}
                            disabled={noDisruptionEndRequired}
                            inputId="disruption-end-time"
                            inputName="disruptionEndTime"
                            pageState={pageState}
                            updatePageState={setPageState}
                            updaterFunction={updatePageStateForInput}
                        />

                        <Checkbox
                            inputInfo={{
                                id: "disruption-no-end-date-time",
                                name: "disruptionHasNoEndDateTime",
                                display: "No end date/time",
                                value: "checked",
                            }}
                            noDisruptionEndRequired={noDisruptionEndRequired}
                            updateNoDisruptionRequired={setNoDisruptionEndRequired}
                        />

                        <Radios
                            heading="Does this disruption repeat?"
                            pageState={pageState}
                            inputInfo={[
                                {
                                    id: "disruption-repeats",
                                    name: "disruptionRepeats",
                                    value: "yes",
                                    display: "Yes",
                                },
                                {
                                    id: "disruption-does-not-repeat",
                                    name: "disruptionRepeats",
                                    value: "no",
                                    display: "No",
                                },
                            ]}
                            paddingTop={6}
                        />
                    </div>
                    <div className="govuk-form-group govuk-!-padding-top-3">
                        <h2 className="govuk-heading-l">When does the disruption need to be published?</h2>

                        <DateSelector
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
                        />

                        <TimeSelector
                            header="What is the start time?"
                            hint={{
                                id: "publish-start-time-hint",
                                text: "Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm",
                            }}
                            input={pageState.inputs["publish-start-time"]}
                            disabled={false}
                            inputId="publish-start-time"
                            inputName="publishStartTime"
                            pageState={pageState}
                            updatePageState={setPageState}
                            updaterFunction={updatePageStateForInput}
                        />

                        <DateSelector
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
                        />

                        <TimeSelector
                            header="What is the end time?"
                            hint={{
                                id: "publish-end-time-hint",
                                text: "Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm",
                            }}
                            input={pageState.inputs["publish-end-time"]}
                            disabled={noPublishEndRequired}
                            inputId="publish-end-time"
                            inputName="publishEndTime"
                            pageState={pageState}
                            updatePageState={setPageState}
                            updaterFunction={updatePageStateForInput}
                        />

                        <Checkbox
                            inputInfo={{
                                id: "publish-no-end-date-time",
                                name: "publishHasNoEndDateTime",
                                display: "No end date/time",
                                value: "checked",
                            }}
                            noDisruptionEndRequired={noPublishEndRequired}
                            updateNoDisruptionRequired={setNoPublishEndRequired}
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
            typeOfDisruption: "",
            summary: "",
            description: "",
            "associated-link": "",
            "disruption-reason": "",
            "disruption-start-date": null,
            "disruption-end-date": null,
            "disruption-start-time": "",
            "disruption-end-time": "",
            "publish-start-date": null,
            "publish-end-date": null,
            "publish-start-time": "",
            "publish-end-time": "",
        },
    };

    return {
        props: { inputs },
    };
};

export default CreateDisruption;
