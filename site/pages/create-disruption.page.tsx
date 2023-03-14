import { NextPageContext } from "next";
import { parseCookies } from "nookies";
import { ReactElement, SyntheticEvent, useState } from "react";
import { inspect } from "util";
import DateSelector from "../components/form/DateSelector";
import Radios from "../components/form/Radios";
import Select from "../components/form/Select";
import Table from "../components/form/Table";
import TextInput from "../components/form/TextInput";
import TimeSelector from "../components/form/TimeSelector";
import { BaseLayout } from "../components/layout/Layout";
import { DISRUPTION_REASONS, COOKIES_DISRUPTION_INFO, COOKIES_DISRUPTION_ERRORS } from "../constants/index";
import { ErrorInfo } from "../interfaces";
import logger from "../utils/logger";

const title = "Create Disruptions";
const description = "Create Disruptions page for the Create Transport Disruptions Service";

interface CreateDisruptionProps {
    inputs: DisruptionPageState;
}

export interface DisruptionPageInputs {
    "type-of-disruption": "planned" | "unplanned" | "";
    summary: string;
    description: string;
    "associated-link": string;
    "disruption-reason": string;
    "disruption-start-date": string;
    "disruption-end-date": string;
    "disruption-start-time": string;
    "disruption-end-time": string;
    "publish-start-date": string;
    "publish-end-date": string;
    "publish-start-time": string;
    "publish-end-time": string;
    validity: { id: number; value: string }[];
}

export interface DisruptionPageState {
    errors: ErrorInfo[];
    inputs: DisruptionPageInputs;
}

const CreateDisruption = ({ inputs }: CreateDisruptionProps): ReactElement => {
    const [pageState, setDisruptionPageState] = useState<DisruptionPageState>(inputs);

    const updateDisruptionPageStateForInput = (
        inputName: keyof DisruptionPageInputs,
        input: string,
        error?: ErrorInfo,
    ): void => {
        setDisruptionPageState({
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

    const addValidity = (e: SyntheticEvent) => {
        e.preventDefault();
        if (
            pageState.inputs["disruption-start-date"] &&
            pageState.inputs["disruption-start-time"] &&
            pageState.inputs["disruption-end-date"] &&
            pageState.inputs["disruption-end-time"]
        ) {
            const validityToAdd = {
                id: pageState.inputs.validity.length + 1,
                value: `${pageState.inputs["disruption-start-date"]} ${pageState.inputs["disruption-start-time"]} - ${pageState.inputs["disruption-end-date"]} ${pageState.inputs["disruption-end-time"]}`,
            };
            setDisruptionPageState({
                inputs: {
                    ...pageState.inputs,
                    validity: [...pageState.inputs.validity, validityToAdd],
                    "disruption-start-date": "",
                    "disruption-end-date": "",
                    "disruption-start-time": "",
                    "disruption-end-time": "",
                },
                errors: pageState.errors,
            });
        }
    };

    const getValidityRows = () =>
        pageState.inputs.validity?.map((validity, i) => ({
            header: `Validity period ${i + 1}`,
            cells: [
                validity.value,
                <button
                    id={validity.id.toString()}
                    key={`remove-validity-period-${i + 1}`}
                    className="govuk-link"
                    onClick={removeValidity}
                >
                    Remove
                </button>,
            ],
        }));

    const removeValidity = (e: SyntheticEvent) => {
        e.preventDefault();
        setDisruptionPageState({
            inputs: {
                ...pageState.inputs,
                validity: pageState.inputs.validity.filter(
                    (validity) => validity.id.toString() !== (e.target as HTMLInputElement).id,
                ),
            },
            errors: pageState.errors,
        });
    };

    const stateUpdater = (change: string, field: keyof DisruptionPageInputs) => {
        updateDisruptionPageStateForInput(field, change);
    };

    return (
        <BaseLayout title={title} description={description}>
            <form action="/api/create-disruption" method="post">
                <>
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">Create a new disruption</h1>

                        <Radios<DisruptionPageInputs>
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

                        <TextInput<DisruptionPageInputs>
                            inputId="summary"
                            display="Summary"
                            inputName="summary"
                            errorMessage="Enter a summary for this disruption"
                            widthClass="w-3/4"
                            maxLength={50}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.summary}
                        />

                        <TextInput<DisruptionPageInputs>
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

                        <TextInput<DisruptionPageInputs>
                            inputId="associated-link"
                            display="Associated Link (optional)"
                            inputName="associated-link"
                            optional
                            widthClass="w-3/4"
                            maxLength={50}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs["associated-link"]}
                        />

                        <Select<DisruptionPageInputs>
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
                        <Table rows={getValidityRows()} />
                        <DateSelector<DisruptionPageInputs>
                            display="Start date"
                            hiddenHint="Enter in format DD/MM/YYYY"
                            value={pageState.inputs["disruption-start-date"]}
                            errorMessage="Select a date"
                            disabled={false}
                            disablePast={false}
                            inputId="disruption-start-date"
                            inputName="disruption-start-date"
                            stateUpdater={stateUpdater}
                            reset={pageState.inputs["disruption-start-date"] === ""}
                        />

                        <TimeSelector<DisruptionPageInputs>
                            display="Start time"
                            hint="Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm"
                            value={pageState.inputs["disruption-start-time"]}
                            errorMessage="Enter a start time for the disruption"
                            disabled={false}
                            inputId="disruption-start-time"
                            inputName="disruption-start-time"
                            stateUpdater={stateUpdater}
                            reset={pageState.inputs["disruption-start-time"] === ""}
                        />

                        <DateSelector<DisruptionPageInputs>
                            display="End date"
                            hiddenHint="Enter in format DD/MM/YYYY"
                            value={pageState.inputs["disruption-end-date"]}
                            errorMessage="Select a date"
                            disabled={false}
                            disablePast
                            inputId="disruption-end-date"
                            inputName="disruption-end-date"
                            stateUpdater={stateUpdater}
                            reset={pageState.inputs["disruption-end-date"] === ""}
                        />

                        <TimeSelector<DisruptionPageInputs>
                            display="End time"
                            hint="Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm"
                            value={pageState.inputs["disruption-end-time"]}
                            errorMessage="Enter an end time for the disruption"
                            disabled={false}
                            inputId="disruption-end-time"
                            inputName="disruption-end-time"
                            stateUpdater={stateUpdater}
                            reset={pageState.inputs["disruption-end-time"] === ""}
                        />
                        <button
                            className="govuk-button govuk-button--secondary mt-8"
                            data-module="govuk-button"
                            onClick={addValidity}
                        >
                            Add another validity period
                        </button>
                    </div>
                    <div className="govuk-form-group govuk-!-padding-top-3">
                        <h2 className="govuk-heading-l">When does the disruption need to be published?</h2>

                        <DateSelector<DisruptionPageInputs>
                            display="Start date"
                            hiddenHint="Enter in format DD/MM/YYYY"
                            value={pageState.inputs["publish-start-date"]}
                            errorMessage="Select a date"
                            disabled={false}
                            disablePast={false}
                            inputId="publish-start-date"
                            inputName="publish-start-date"
                            stateUpdater={stateUpdater}
                        />

                        <TimeSelector<DisruptionPageInputs>
                            display="Start time"
                            hint="Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm"
                            value={pageState.inputs["publish-start-time"]}
                            errorMessage="Enter a publication start time for the disruption"
                            disabled={false}
                            inputId="publish-start-time"
                            inputName="publish-start-time"
                            stateUpdater={stateUpdater}
                        />

                        <DateSelector<DisruptionPageInputs>
                            display="End date"
                            hiddenHint="Enter in format DD/MM/YYYY"
                            value={pageState.inputs["publish-end-date"]}
                            errorMessage="Select a date"
                            disabled={false}
                            disablePast
                            inputId="publish-end-date"
                            inputName="publish-end-date"
                            stateUpdater={stateUpdater}
                        />

                        <TimeSelector<DisruptionPageInputs>
                            display="End time"
                            hint="Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm"
                            value={pageState.inputs["publish-end-time"]}
                            errorMessage="Enter a publication end time for the disruption"
                            disabled={false}
                            inputId="publish-end-time"
                            inputName="publish-end-time"
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
    const pageState: DisruptionPageState = {
        errors: [],
        inputs: {
            "type-of-disruption": "",
            summary: "",
            description: "",
            "associated-link": "",
            "disruption-reason": "",
            "disruption-start-date": "",
            "disruption-end-date": "",
            "disruption-start-time": "",
            "disruption-end-time": "",
            "publish-start-date": "",
            "publish-end-date": "",
            "publish-start-time": "",
            "publish-end-time": "",
            validity: [],
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
