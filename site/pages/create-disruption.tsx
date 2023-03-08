import { ErrorInfo } from "../interfaces";
import {
    MiscellaneousReason,
    PersonnelReason,
    EnvironmentReason,
    EquipmentReason,
} from "@create-disruptions-data/shared-ts/siriTypes";
import { Dispatch, ReactElement, SetStateAction, useState } from "react";
import DateSelector from "../components/DateSelector";
import FormElementWrapper, { FormGroupWrapper } from "../components/FormElementWrapper";
import { BaseLayout } from "../components/layout/Layout";
import TimeSelector from "../components/TimeSelector";
import { DISRUPTION_REASONS, COOKIES_DISRUPTION_INFO, COOKIES_DISRUPTION_ERRORS } from "../constants/index";
import { deleteCookie, getCookie } from "cookies-next";
import { CookieValueTypes, OptionsType } from "cookies-next/lib/types";
import { NextPageContext } from "next";
import { parseCookies, destroyCookie } from "nookies";

const title = "Create Disruptions";
const description = "Create Disruptions page for the Create Transport Disruptions Service";

interface CreateDisruptionProps {
    inputs: PageState;
}

export interface PageInputs {
    typeOfDisruption?: "planned" | "unplanned";
    summary: string;
    description: string;
    "associated-link": string;
    "disruption-reason": MiscellaneousReason | PersonnelReason | EnvironmentReason | EquipmentReason | "";
    "disruption-start-date": Date | null;
    "disruption-end-date": Date | null;
    "disruption-start-time": string;
    "disruption-end-time": string;
    "publish-start-date": Date | null;
    "publish-end-date": Date | null;
    "publish-start-time": string;
    "publish-end-time": string;
    disruptionRepeats?: string;
    disruptionIsNoEndDateTime?: string;
    publishIsNoEndDateTime?: string;
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
                                                name="typeOfDisruption"
                                                type="radio"
                                                value="planned"
                                                defaultChecked={pageState.inputs.typeOfDisruption == "planned"}
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
                                                name="typeOfDisruption"
                                                type="radio"
                                                value="unplanned"
                                                defaultChecked={pageState.inputs.typeOfDisruption == "unplanned"}
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
                                            if (!input) {
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
                                        name="associated-link"
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
                                        name="disruption-reason"
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
                                    inputName="disruption-start-date"
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
                                    inputName="disruption-start-time"
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
                                    inputName="disruption-end-date"
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
                                    inputName="disruption-end-time"
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
                                        defaultChecked={
                                            pageState.inputs.disruptionIsNoEndDateTime == "disruptionNoEndDateTime"
                                        }
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
                                        defaultChecked={pageState.inputs.disruptionRepeats == "yes"}
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
                                        defaultChecked={pageState.inputs.disruptionRepeats == "no"}
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
                                    inputName="publish-start-date"
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
                                    inputName="publish-start-time"
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
                                    inputName="publish-end-date"
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
                                    inputName="publish-end-time"
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
                                        defaultChecked={
                                            pageState.inputs.publishIsNoEndDateTime == "publishNoEndDateTime"
                                        }
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

export const getServerSideProps = (ctx: NextPageContext): { props: object } => {
    const pageState: PageState = {
        errors: [],
        inputs: {
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

    //console.log(ctx);

    // setCookie("disruption2", "test");

    const options: OptionsType | undefined = {
        req: ctx.req,
        res: ctx.res,
        path: "/create-disruption",
    };

    const cookies = parseCookies(ctx);

    // //const disruptionInfo: CookieValueTypes = getCookie("disruptionInfo", options);

    // if (disruptionInfo) {
    //     deleteCookie("disruptionInfo", options);
    //     pageState.inputs = JSON.parse(disruptionInfo.toString()) as PageInputs;
    // }

    // const errorInfo: CookieValueTypes = getCookie("disruptionErrors", options);
    // if (errorInfo) {
    //     deleteCookie("disruptionErrors", options);
    //     pageState.errors = JSON.parse(errorInfo.toString()) as ErrorInfo[];
    // }

    const disruptionInfo = cookies[COOKIES_DISRUPTION_INFO];

    if (disruptionInfo) {
        pageState.inputs = JSON.parse(cookies[COOKIES_DISRUPTION_INFO]) as PageInputs;
        destroyCookie(ctx, COOKIES_DISRUPTION_INFO);
    }

    const errorInfo = cookies[COOKIES_DISRUPTION_ERRORS];

    if (errorInfo) {
        pageState.errors = JSON.parse(cookies[COOKIES_DISRUPTION_ERRORS]) as ErrorInfo[];
        destroyCookie(ctx, COOKIES_DISRUPTION_ERRORS);
    }

    console.log("pageState", pageState);
    return {
        props: { inputs: pageState },
    };
};

export default CreateDisruption;
