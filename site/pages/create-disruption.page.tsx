import { NextPageContext } from "next";
import { parseCookies } from "nookies";
import { Fragment, ReactElement, SyntheticEvent, useState } from "react";
import { z } from "zod";
import ErrorSummary from "../components/ErrorSummary";
import Checkbox from "../components/form/Checkbox";
import DateSelector from "../components/form/DateSelector";
import Radios from "../components/form/Radios";
import Select from "../components/form/Select";
import Table from "../components/form/Table";
import TextInput from "../components/form/TextInput";
import TimeSelector from "../components/form/TimeSelector";
import { BaseLayout } from "../components/layout/Layout";
import { DISRUPTION_REASONS, COOKIES_DISRUPTION_INFO, COOKIES_DISRUPTION_ERRORS } from "../constants/index";
import { ErrorInfo, PageState } from "../interfaces";
import {
    createDisruptionSchema,
    validitySchemaRefined,
    Validity,
    validitySchema,
} from "../schemas/create-disruption.schema";
import { flattenZodErrors } from "../utils";

const title = "Create Disruptions";
const description = "Create Disruptions page for the Create Transport Disruptions Service";

export interface DisruptionPageInputs extends Partial<z.infer<typeof createDisruptionSchema>> {}

const CreateDisruption = (initialState: PageState<Partial<DisruptionPageInputs>>): ReactElement => {
    const [pageState, setDisruptionPageState] = useState<PageState<Partial<DisruptionPageInputs>>>(initialState);

    const initialValidity: Validity = {
        disruptionStartDate: "",
        disruptionEndDate: "",
        disruptionStartTime: "",
        disruptionEndTime: "",
        disruptionNoEndDateTime: "",
    };
    const [validity, setValidity] = useState<Validity>(initialValidity);

    const addValidity = (e: SyntheticEvent) => {
        e.preventDefault();

        const filteredValidity =
            validity.disruptionNoEndDateTime === "true"
                ? {
                      ...validity,
                      disruptionEndDate: "",
                      disruptionEndTime: "",
                  }
                : validity;

        const parsed = validitySchemaRefined.safeParse(filteredValidity);

        if (!parsed.success) {
            setDisruptionPageState({
                ...pageState,
                errors: [
                    ...pageState.errors.filter((err) => !Object.keys(validitySchema.shape).includes(err.id)),
                    ...flattenZodErrors(parsed.error),
                ],
            });
        } else {
            setDisruptionPageState({
                inputs: {
                    ...pageState.inputs,
                    validity: [...(pageState.inputs.validity ?? []), filteredValidity],
                },
                errors: [...pageState.errors.filter((err) => !Object.keys(validitySchema.shape).includes(err.id))],
            });

            setValidity(initialValidity);
        }
    };

    const removeValidity = (e: SyntheticEvent, index: number) => {
        e.preventDefault();
        if (pageState.inputs.validity) {
            const validity = [...pageState.inputs.validity];
            validity.splice(index, 1);

            setDisruptionPageState({
                inputs: {
                    ...pageState.inputs,
                    validity,
                },
                errors: pageState.errors,
            });
        }
    };

    const getValidityRows = () => {
        if (pageState.inputs.validity) {
            return pageState.inputs.validity.map((validity, i) => ({
                header: `Validity period ${i + 1}`,
                cells: [
                    validity.disruptionEndDate && validity.disruptionEndTime && !validity.disruptionNoEndDateTime
                        ? `${validity.disruptionStartDate} ${validity.disruptionStartTime} - ${validity.disruptionEndDate} ${validity.disruptionEndTime}`
                        : `${validity.disruptionStartDate} ${validity.disruptionStartTime} - No end date/time`,
                    <button
                        id={`remove-validity-period-${i + 1}`}
                        key={`remove-validity-period-${i + 1}`}
                        className="govuk-link"
                        onClick={(e) => removeValidity(e, i)}
                    >
                        Remove
                    </button>,
                ],
            }));
        }
        return [];
    };

    const updateDisruptionPageStateForInput = (inputName: string, input: string, error?: ErrorInfo): void => {
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

    const stateUpdater = (change: string, field: string) => {
        updateDisruptionPageStateForInput(field, change);
    };

    const validityStateUpdater = (change: string, field: string) => {
        setValidity({ ...validity, [field]: change });
    };

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
                        <Table rows={pageState.inputs.validity ? getValidityRows() : []} />
                        {(pageState.inputs.validity || []).map((item, index) => (
                            <Fragment key={`validity-${index}`}>
                                <input type="hidden" name={`validity${index + 1}`} value={item.disruptionStartDate} />
                                <input type="hidden" name={`validity${index + 1}`} value={item.disruptionStartTime} />
                                <input type="hidden" name={`validity${index + 1}`} value={item.disruptionEndDate} />
                                <input type="hidden" name={`validity${index + 1}`} value={item.disruptionEndTime} />
                                <input
                                    type="hidden"
                                    name={`validity${index + 1}`}
                                    value={item.disruptionNoEndDateTime}
                                />
                            </Fragment>
                        ))}

                        <DateSelector<Validity>
                            display="Start date"
                            hiddenHint="Enter in format DD/MM/YYYY"
                            value={validity.disruptionStartDate}
                            disabled={false}
                            disablePast={false}
                            inputName={"disruptionStartDate"}
                            stateUpdater={validityStateUpdater}
                            initialErrors={pageState.errors}
                            reset={!validity.disruptionStartDate}
                            schema={validitySchema.shape.disruptionStartDate}
                        />

                        <TimeSelector<Validity>
                            display="Start time"
                            hint="Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm"
                            value={validity.disruptionStartTime}
                            disabled={false}
                            inputName="disruptionStartTime"
                            stateUpdater={validityStateUpdater}
                            initialErrors={pageState.errors}
                            reset={!validity.disruptionStartTime}
                            schema={validitySchema.shape.disruptionStartTime}
                        />

                        <DateSelector<Validity>
                            display="End date"
                            hiddenHint="Enter in format DD/MM/YYYY"
                            value={validity.disruptionEndDate}
                            disabled={validity.disruptionNoEndDateTime === "true"}
                            disablePast={false}
                            inputName="disruptionEndDate"
                            stateUpdater={validityStateUpdater}
                            initialErrors={pageState.errors}
                            reset={!validity.disruptionEndDate}
                            schema={validitySchema.shape.disruptionEndDate}
                        />

                        <TimeSelector<Validity>
                            display="End time"
                            hint="Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm"
                            value={validity.disruptionEndTime}
                            disabled={validity.disruptionNoEndDateTime === "true"}
                            inputName="disruptionEndTime"
                            stateUpdater={validityStateUpdater}
                            initialErrors={pageState.errors}
                            reset={!validity.disruptionEndTime}
                            schema={validitySchema.shape.disruptionEndTime}
                        />

                        <Checkbox<Validity>
                            inputName="disruptionNoEndDateTime"
                            display="Does the disruption have an end datetime?"
                            hideLegend
                            checkboxDetail={[
                                {
                                    display: "No end date/time",
                                    value: "true",
                                    checked: validity.disruptionNoEndDateTime === "true",
                                },
                            ]}
                            stateUpdater={validityStateUpdater}
                            initialErrors={pageState.errors}
                            reset={!validity.disruptionNoEndDateTime}
                            schema={validitySchema.shape.disruptionNoEndDateTime}
                        />
                        <button
                            className="govuk-button govuk-button--secondary mt-8"
                            data-module="govuk-button"
                            onClick={addValidity}
                            disabled={
                                pageState.inputs.validity &&
                                pageState.inputs.validity[pageState.inputs.validity.length - 1]
                                    ?.disruptionNoEndDateTime === "true"
                            }
                        >
                            Add another validity period
                        </button>
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
