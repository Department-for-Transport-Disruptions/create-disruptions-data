import { NextPageContext } from "next";
import { parseCookies } from "nookies";
import { ReactElement, useEffect, useState } from "react";
import { inspect } from "util";
import Checkbox from "../components/form/Checkbox";
import DateSelector from "../components/form/DateSelector";
import Radios from "../components/form/Radios";
import Select from "../components/form/Select";
import TextInput from "../components/form/TextInput";
import TimeSelector from "../components/form/TimeSelector";
import { BaseLayout } from "../components/layout/Layout";
import { DISRUPTION_REASONS, COOKIES_DISRUPTION_INFO, COOKIES_DISRUPTION_ERRORS } from "../constants/index";
import { ErrorInfo } from "../interfaces";
import logger from "../utils/logger";

const title = "Create Disruptions";
const description = "Create Disruptions page for the Create Transport Disruptions Service";

interface CreateDisruptionProps {
    inputs: PageState;
}

export interface PageInputs {
    "type-of-disruption": "planned" | "unplanned" | "";
    summary: string;
    description: string;
    "associated-link": string;
    "disruption-reason": string;
    "disruption-start-date": string;
    "disruption-end-date": string;
    "disruption-start-time": string;
    "disruption-end-time": string;
    "disruption-no-end-date-time": string;
    "disruption-repeats": "yes" | "no";
    "publish-start-date": string;
    "publish-end-date": string;
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

    const stateUpdater = (change: string, field: keyof PageInputs) => {
        updatePageStateForInput(field, change);
    };

    return (
        <BaseLayout title={title} description={description}>
            <form action="/api/create-disruption" method="post">
                <>
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">Create a new disruption</h1>

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
                            inputName="type-of-disruption"
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
                            textArea
                            rows={3}
                            maxLength={500}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.description}
                        />

                        <TextInput<PageInputs>
                            inputId="associated-link"
                            display="Associated Link (optional)"
                            inputName="associated-link"
                            optional
                            widthClass="w-3/4"
                            maxLength={50}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs["associated-link"]}
                        />

                        <Select<PageInputs>
                            inputId="disruption-reason"
                            inputName="disruption-reason"
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

                        <DateSelector<PageInputs>
                            display="What is the start date?"
                            hiddenHint="Enter in format DD/MM/YYYY"
                            value={pageState.inputs["disruption-start-date"]}
                            errorMessage="Select a date"
                            disabled={false}
                            disablePast={false}
                            inputId="disruption-start-date"
                            inputName="disruption-start-date"
                            stateUpdater={stateUpdater}
                        />

                        <TimeSelector<PageInputs>
                            display="What is the start time?"
                            hint="Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm"
                            value={pageState.inputs["disruption-start-time"]}
                            errorMessage="Enter a start time for the disruption"
                            disabled={false}
                            inputId="disruption-start-time"
                            inputName="disruption-start-time"
                            stateUpdater={stateUpdater}
                        />

                        <DateSelector<PageInputs>
                            display="What is the end date?"
                            hiddenHint="Enter in format DD/MM/YYYY"
                            value={pageState.inputs["disruption-end-date"]}
                            errorMessage="Select a date"
                            disabled={pageState.inputs["disruption-no-end-date-time"] === "checked"}
                            disablePast
                            inputId="disruption-end-date"
                            inputName="disruption-end-date"
                            stateUpdater={stateUpdater}
                        />

                        <TimeSelector<PageInputs>
                            display="What is the end time?"
                            hint="Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm"
                            value={pageState.inputs["disruption-end-time"]}
                            errorMessage="Enter an end time for the disruption"
                            disabled={pageState.inputs["disruption-no-end-date-time"] === "checked"}
                            inputId="disruption-end-time"
                            inputName="disruption-end-time"
                            stateUpdater={stateUpdater}
                        />

                        <Checkbox<PageInputs>
                            inputId="disruption-no-end-date-time"
                            inputName="disruption-no-end-date-time"
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
                            inputName="disruption-repeats"
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

                        <DateSelector<PageInputs>
                            display="What is the start date?"
                            hiddenHint="Enter in format DD/MM/YYYY"
                            value={pageState.inputs["publish-start-date"]}
                            errorMessage="Select a date"
                            disabled={false}
                            disablePast={false}
                            inputId="publish-start-date"
                            inputName="publish-start-date"
                            stateUpdater={stateUpdater}
                        />

                        <TimeSelector<PageInputs>
                            display="What is the start time?"
                            hint="Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm"
                            value={pageState.inputs["publish-start-time"]}
                            errorMessage="Enter a publication start time for the disruption"
                            disabled={false}
                            inputId="publish-start-time"
                            inputName="publish-start-time"
                            stateUpdater={stateUpdater}
                        />

                        <DateSelector<PageInputs>
                            display="What is the end date?"
                            hiddenHint="Enter in format DD/MM/YYYY"
                            value={pageState.inputs["publish-end-date"]}
                            errorMessage="Select a date"
                            disabled={pageState.inputs["publish-no-end-date-time"] === "checked"}
                            disablePast
                            inputId="publish-end-date"
                            inputName="publish-end-date"
                            stateUpdater={stateUpdater}
                        />

                        <TimeSelector<PageInputs>
                            display="What is the end time?"
                            hint="Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm"
                            value={pageState.inputs["publish-end-time"]}
                            errorMessage="Enter a publication end time for the disruption"
                            disabled={pageState.inputs["publish-no-end-date-time"] === "checked"}
                            inputId="publish-end-time"
                            inputName="publish-end-time"
                            stateUpdater={stateUpdater}
                        />

                        <Checkbox<PageInputs>
                            inputId="publish-no-end-date-time"
                            inputName="publish-no-end-date-time"
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

export const getServerSideProps = (ctx: NextPageContext): { props: object } => {
    const pageState: PageState = {
        errors: [],
        inputs: {
            "type-of-disruption": "",
            summary: "",
            description: "",
            "associated-link": "",
            "disruption-reason": "",
            "disruption-repeats": "no",
            "disruption-start-date": "",
            "disruption-end-date": "",
            "disruption-start-time": "",
            "disruption-end-time": "",
            "disruption-no-end-date-time": "",
            "publish-start-date": "",
            "publish-end-date": "",
            "publish-start-time": "",
            "publish-end-time": "",
            "publish-no-end-date-time": "",
        },
    };

    const cookies = parseCookies(ctx);

    const disruptionInfo = cookies[COOKIES_DISRUPTION_INFO];

    if (disruptionInfo) {
        logger.info(inspect(JSON.parse(cookies[COOKIES_DISRUPTION_INFO]), false, null, true));
    }

    const errorInfo = cookies[COOKIES_DISRUPTION_ERRORS];

    if (errorInfo) {
        logger.info(inspect(JSON.parse(cookies[COOKIES_DISRUPTION_ERRORS]), false, null, true));
    }

    return {
        props: { inputs: pageState },
    };
};

export default CreateDisruption;
