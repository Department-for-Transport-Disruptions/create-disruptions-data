import { Dispatch, ReactElement, SetStateAction, useState } from "react";
import DateSelector from "../components/DateSelector";
import FormElementWrapper, { FormGroupWrapper } from "../components/FormElementWrapper";
import { BaseLayout } from "../components/layout/Layout";
import TimeSelector from "../components/TimeSelector";
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

const getReasonOptions = (): JSX.Element[] => {
    const options: JSX.Element[] = [
        <option value="" disabled key="">
            Choose a reason
        </option>,
    ];

    DISRUPTION_REASONS.forEach((reasonType) => {
        options.push(
            <option value={reasonType.value} key={reasonType.value}>
                {reasonType.reason}
            </option>,
        );
    });

    return options;
};

const CreateDisruption = ({ inputs }: CreateDisruptionProps): ReactElement => {
    const [pageState, setPageState] = useState<PageState>(inputs);
    const [noDisruptionEndRequired, setNoDisruptionEndRequired] = useState(false);
    const [noPublishEndRequired, setNoPublishEndRequired] = useState(false);

    return (
        <BaseLayout title={title} description={description}>
            <form action="/api/createDisruption" method="post">
                <>
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">Create a new Disruption</h1>
                        <FormGroupWrapper errorIds={["disruption-planned"]} errors={pageState.errors}>
                            <fieldset className="govuk-fieldset">
                                <legend className="govuk-fieldset__legend govuk-!-padding-top-2">
                                    <span className="govuk-heading-s govuk-!-margin-bottom-0" id="disruption-type">
                                        Type of disruption
                                    </span>
                                </legend>
                                <FormElementWrapper
                                    errors={pageState.errors}
                                    errorId="disruption-planned"
                                    errorClass="govuk-radios--error"
                                >
                                    <div className="govuk-radios" id="radio-buttons">
                                        <div className="govuk-radios__item govuk-!-margin-bottom-1">
                                            <input
                                                className="govuk-radios__input"
                                                id="disruption-planned"
                                                name="disruptionType"
                                                type="radio"
                                                value="planned"
                                            />
                                            <label
                                                className="govuk-label govuk-radios__label"
                                                htmlFor="disruption-planned"
                                            >
                                                Planned
                                            </label>
                                        </div>

                                        <div className="govuk-radios__item">
                                            <input
                                                className="govuk-radios__input"
                                                id="disruption-unplanned"
                                                name="disruptionType"
                                                type="radio"
                                                value="unplanned"
                                            />
                                            <label
                                                className="govuk-label govuk-radios__label"
                                                htmlFor="disruption-unplanned"
                                            >
                                                Unplanned
                                            </label>
                                        </div>
                                    </div>
                                </FormElementWrapper>
                            </fieldset>
                        </FormGroupWrapper>
                        <FormGroupWrapper errorIds={["summary"]} errors={pageState.errors}>
                            <div className="govuk-form-group">
                                <label className="govuk-label govuk-label--s" htmlFor="summary">
                                    Summary
                                </label>
                                <FormElementWrapper
                                    errors={pageState.errors}
                                    errorId="summary"
                                    errorClass="govuk-input--error"
                                >
                                    <input
                                        className="govuk-input w-3/4"
                                        id="summary"
                                        name="summary"
                                        type="text"
                                        maxLength={50}
                                        defaultValue={pageState.inputs.summary}
                                        onBlur={(e) => {
                                            const input = e.target.value;
                                            if (!input) {
                                                updatePageStateForInput(pageState, setPageState, "summary", input, {
                                                    id: "summary",
                                                    errorMessage: "Enter a summary for this disruption",
                                                });
                                            } else {
                                                updatePageStateForInput(pageState, setPageState, "summary", input);
                                            }
                                        }}
                                    />
                                </FormElementWrapper>
                            </div>
                        </FormGroupWrapper>
                        <FormGroupWrapper errorIds={["description"]} errors={pageState.errors}>
                            <div className="govuk-form-group">
                                <label className="govuk-label govuk-label--s" htmlFor="description">
                                    Description
                                </label>
                                <FormElementWrapper
                                    errors={pageState.errors}
                                    errorId="description"
                                    errorClass="govuk-input--error"
                                >
                                    <textarea
                                        className="govuk-textarea w-3/4"
                                        id="description"
                                        name="description"
                                        rows={3}
                                        maxLength={200}
                                        defaultValue={pageState.inputs.description}
                                        onBlur={(e) => {
                                            const input = e.target.value;
                                            if (input.length < 5) {
                                                updatePageStateForInput(pageState, setPageState, "description", input, {
                                                    id: "description",
                                                    errorMessage:
                                                        "Enter a description for this disruption (200 characters maximum)",
                                                });
                                            } else {
                                                updatePageStateForInput(pageState, setPageState, "description", input);
                                            }
                                        }}
                                    />
                                </FormElementWrapper>
                            </div>
                        </FormGroupWrapper>
                        <FormGroupWrapper errorIds={["associated-link"]} errors={pageState.errors}>
                            <div className="govuk-form-group">
                                <label className="govuk-label govuk-label--s" htmlFor="associated-link">
                                    Associated Link (optional)
                                </label>
                                <FormElementWrapper
                                    errors={pageState.errors}
                                    errorId="associated-link"
                                    errorClass="govuk-input--error"
                                >
                                    <input
                                        className="govuk-input w-3/4"
                                        id="associated-link"
                                        name="associatedLink"
                                        type="text"
                                        maxLength={50}
                                        defaultValue={pageState.inputs["associated-link"]}
                                        onBlur={(e) => {
                                            const input = e.target.value;

                                            updatePageStateForInput(pageState, setPageState, "associated-link", input);
                                        }}
                                    />
                                </FormElementWrapper>
                            </div>
                        </FormGroupWrapper>
                        <FormGroupWrapper errorIds={["disruption-reason"]} errors={pageState.errors}>
                            <div className="govuk-form-group">
                                <label className="govuk-label govuk-label--s" htmlFor="Distruption-reason">
                                    Reason for disruption
                                </label>
                                <FormElementWrapper
                                    errors={pageState.errors}
                                    errorId="disruption-reason"
                                    errorClass="govuk-select--error"
                                >
                                    <select
                                        className="govuk-select w-3/4"
                                        id="disruption-reason"
                                        name="disruptionReason"
                                        defaultValue={pageState.inputs["disruption-reason"] || ""}
                                        onBlur={(e) => {
                                            const input = e.target.value;
                                            if (!input) {
                                                updatePageStateForInput(
                                                    pageState,
                                                    setPageState,
                                                    "disruption-reason",
                                                    input,
                                                    {
                                                        id: "disruption-reason",
                                                        errorMessage: "Select a reason from the dropdown",
                                                    },
                                                );
                                            } else {
                                                updatePageStateForInput(
                                                    pageState,
                                                    setPageState,
                                                    "disruption-reason",
                                                    input,
                                                );
                                            }
                                        }}
                                    >
                                        {getReasonOptions()}
                                    </select>
                                </FormElementWrapper>
                            </div>
                        </FormGroupWrapper>
                    </div>
                    <div className="govuk-form-group govuk-!-padding-top-6">
                        <h2 className="govuk-heading-l">When is the disruption?</h2>

                        <FormGroupWrapper errorIds={["disruption-start-date"]} errors={pageState.errors}>
                            <div className="govuk-form-group govuk-!-margin-bottom-0">
                                <label className="govuk-label govuk-label--s" htmlFor="disruption-start-date">
                                    What is the start date?
                                </label>
                                <div className="govuk-hint govuk-visually-hidden">Enter in format DD/MM/YYYY</div>
                                <DateSelector
                                    input={pageState.inputs["disruption-start-date"]}
                                    disabled={false}
                                    disablePast={false}
                                    inputId="disruption-start-date"
                                    inputName="disruptionStartDate"
                                    pageState={pageState}
                                    updatePageState={setPageState}
                                    updaterFunction={updatePageStateForInput}
                                />
                            </div>
                        </FormGroupWrapper>
                        <FormGroupWrapper errorIds={["disruption-start-time"]} errors={pageState.errors}>
                            <fieldset
                                className="govuk-fieldset"
                                role="group"
                                aria-describedby="disruption-start-time-hint"
                            >
                                <legend className="govuk-fieldset__legend">
                                    <h3 className="govuk-heading-s govuk-!-margin-bottom-0">What is the start time?</h3>
                                </legend>
                                <div id="disruption-start-time-hint" className="govuk-hint">
                                    Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm.
                                </div>

                                <TimeSelector
                                    input={pageState.inputs["disruption-start-time"]}
                                    disabled={false}
                                    inputId="disruption-start-time"
                                    inputName="disruptionStartTime"
                                    pageState={pageState}
                                    updatePageState={setPageState}
                                    updaterFunction={updatePageStateForInput}
                                />
                            </fieldset>
                        </FormGroupWrapper>
                        <FormGroupWrapper errorIds={["disruption-end-date"]} errors={pageState.errors}>
                            <div className="govuk-form-group govuk-!-margin-bottom-0 govuk-!-margin-top-6">
                                <label className="govuk-label govuk-label--s" htmlFor="disruption-end-date">
                                    What is the end date?
                                </label>
                                <div className="govuk-hint govuk-visually-hidden">Enter in format DD/MM/YYYY</div>
                                <DateSelector
                                    disablePast
                                    input={pageState.inputs["disruption-end-date"] || null}
                                    disabled={noDisruptionEndRequired}
                                    inputId="disruption-end-date"
                                    inputName="disruptionEndDateDay"
                                    pageState={pageState}
                                    updatePageState={setPageState}
                                    updaterFunction={updatePageStateForInput}
                                />
                            </div>
                        </FormGroupWrapper>
                        <FormGroupWrapper errorIds={["disruption-end-time"]} errors={pageState.errors}>
                            <fieldset
                                className="govuk-fieldset"
                                role="group"
                                aria-describedby="disruptionend-time-hint"
                            >
                                <legend className="govuk-fieldset__legend">
                                    <h3 className="govuk-heading-s govuk-!-margin-bottom-0"> What is the end time?</h3>
                                </legend>
                                <div id="disruption-end-time-hint" className="govuk-hint">
                                    Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm.
                                </div>
                                <TimeSelector
                                    input={pageState.inputs["disruption-end-time"]}
                                    disabled={noDisruptionEndRequired}
                                    inputId="disruption-end-time"
                                    inputName="disruptionEndTime"
                                    pageState={pageState}
                                    updatePageState={setPageState}
                                    updaterFunction={updatePageStateForInput}
                                />
                            </fieldset>
                        </FormGroupWrapper>
                        <fieldset className="govuk-fieldset" role="group">
                            <div
                                className="govuk-checkboxes flex govuk-checkboxes--small govuk-!-padding-top-6"
                                data-module="govuk-checkboxes"
                            >
                                <div className="govuk-checkboxes__item">
                                    <input
                                        className="govuk-checkboxes__input"
                                        id="disruption-no-end-date-time"
                                        name="disruptionIsNoEndDateTime"
                                        type="checkbox"
                                        value="disruptionNoEndDateTime"
                                        onClick={() => {
                                            setNoDisruptionEndRequired(!noDisruptionEndRequired);
                                            setPageState({
                                                ...pageState,
                                                errors: pageState.errors.filter(
                                                    (error) => !error.id.includes("disruption-end"),
                                                ),
                                            });
                                        }}
                                    />
                                    <label
                                        className="govuk-label govuk-checkboxes__label"
                                        htmlFor="disruption-no-end-date-time"
                                    >
                                        No end date/time
                                    </label>
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="govuk-fieldset">
                            <legend
                                className="govuk-fieldset__legend govuk-!-padding-top-6"
                                id="disruption-repeat-hint"
                            >
                                <h3 className="govuk-heading-s govuk-!-margin-bottom-0">
                                    Does this disruption repeat?
                                </h3>
                            </legend>
                            <div className="govuk-radios" data-module="govuk-radios">
                                <div className="govuk-radios__item">
                                    <input
                                        className="govuk-radios__input"
                                        id="disruption-repeats"
                                        name="disruptionRepeats"
                                        type="radio"
                                        value="yes"
                                    />
                                    <label className="govuk-label govuk-radios__label" htmlFor="disruption-repeats">
                                        Yes
                                    </label>
                                </div>
                                <div className="govuk-radios__item">
                                    <input
                                        className="govuk-radios__input"
                                        id="disruption-does-not-repeat"
                                        name="disruptionRepeats"
                                        type="radio"
                                        value="no"
                                    />
                                    <label
                                        className="govuk-label govuk-radios__label"
                                        htmlFor="disruption-does-not-repeat"
                                    >
                                        No
                                    </label>
                                </div>
                            </div>
                        </fieldset>
                    </div>
                    <div className="govuk-form-group govuk-!-padding-top-6">
                        <h2 className="govuk-heading-l">When does the disruption need to be published?</h2>

                        <FormGroupWrapper errorIds={["publish-start-date"]} errors={pageState.errors}>
                            <div className="govuk-form-group govuk-!-margin-bottom-0">
                                <label className="govuk-label govuk-label--s" htmlFor="publish-start-date">
                                    What is the start date?
                                </label>
                                <div className="govuk-hint govuk-visually-hidden">Enter in format DD/MM/YYYY</div>
                                <DateSelector
                                    input={pageState.inputs["publish-start-date"]}
                                    disabled={false}
                                    disablePast={false}
                                    inputId="publish-start-date"
                                    inputName="publishStartDateDay"
                                    pageState={pageState}
                                    updatePageState={setPageState}
                                    updaterFunction={updatePageStateForInput}
                                />
                            </div>
                        </FormGroupWrapper>

                        <FormGroupWrapper errorIds={["publish-start-time"]} errors={pageState.errors}>
                            <fieldset
                                className="govuk-fieldset"
                                role="group"
                                aria-describedby="publish-start-time-hint"
                            >
                                <legend className="govuk-fieldset__legend">
                                    <h3 className="govuk-heading-s govuk-!-margin-bottom-0">What is the start time?</h3>
                                </legend>
                                <div id="publish-start-time-hint" className="govuk-hint">
                                    Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm.
                                </div>
                                <TimeSelector
                                    input={pageState.inputs["publish-start-time"]}
                                    disabled={false}
                                    inputId="publish-start-time"
                                    inputName="publishStartTime"
                                    pageState={pageState}
                                    updatePageState={setPageState}
                                    updaterFunction={updatePageStateForInput}
                                />
                            </fieldset>
                        </FormGroupWrapper>

                        <FormGroupWrapper errorIds={["publish-end-date"]} errors={pageState.errors}>
                            <div className="govuk-form-group govuk-!-margin-bottom-0 govuk-!-margin-top-6">
                                <label className="govuk-label govuk-label--s" htmlFor="publish-end-date">
                                    What is the end date?
                                </label>
                                <div className="govuk-hint govuk-visually-hidden">Enter in format DD/MM/YYYY</div>
                                <DateSelector
                                    disablePast
                                    input={pageState.inputs["publish-end-date"]}
                                    disabled={noPublishEndRequired}
                                    inputId="publish-end-date"
                                    inputName="publishEndDateDay"
                                    pageState={pageState}
                                    updatePageState={setPageState}
                                    updaterFunction={updatePageStateForInput}
                                />
                            </div>
                        </FormGroupWrapper>

                        <FormGroupWrapper errorIds={["publish-end-time"]} errors={pageState.errors}>
                            <fieldset className="govuk-fieldset" role="group" aria-describedby="publish-end-time-hint">
                                <legend className="govuk-fieldset__legend">
                                    <h3 className="govuk-heading-s govuk-!-margin-bottom-0"> What is the end time?</h3>
                                </legend>
                                <div id="publish-end-time-hint" className="govuk-hint">
                                    Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm.
                                </div>
                                <TimeSelector
                                    input={pageState.inputs["publish-end-time"]}
                                    disabled={noPublishEndRequired}
                                    inputId="publish-end-time"
                                    inputName="publishEndTime"
                                    pageState={pageState}
                                    updatePageState={setPageState}
                                    updaterFunction={updatePageStateForInput}
                                />
                            </fieldset>
                        </FormGroupWrapper>

                        <fieldset className="govuk-fieldset" role="group">
                            <div
                                className="govuk-checkboxes flex govuk-checkboxes--small govuk-!-padding-top-6"
                                data-module="govuk-checkboxes"
                            >
                                <div className="govuk-checkboxes__item">
                                    <input
                                        className="govuk-checkboxes__input"
                                        id="publish-no-end-date-time"
                                        name="publishIsNoEndDateTime"
                                        type="checkbox"
                                        value="publishNoEndDateTime"
                                        onClick={() => {
                                            setNoPublishEndRequired(!noPublishEndRequired);
                                            setPageState({
                                                ...pageState,
                                                errors: pageState.errors.filter(
                                                    (error) => !error.id.includes("publish-end"),
                                                ),
                                            });
                                        }}
                                    />
                                    <label
                                        className="govuk-label govuk-checkboxes__label"
                                        htmlFor="publish-no-end-date-time"
                                    >
                                        No end date/time
                                    </label>
                                </div>
                            </div>
                        </fieldset>

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
