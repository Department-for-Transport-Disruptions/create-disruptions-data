import { NextPageContext } from "next";
import { parseCookies } from "nookies";
import { Fragment, ReactElement, SyntheticEvent, useState } from "react";
import ErrorSummary from "../components/ErrorSummary";
import Checkbox from "../components/form/Checkbox";
import CsrfForm from "../components/form/CsrfForm";
import DateSelector from "../components/form/DateSelector";
import Radios from "../components/form/Radios";
import Select from "../components/form/Select";
import Table from "../components/form/Table";
import TextInput from "../components/form/TextInput";
import TimeSelector from "../components/form/TimeSelector";
import { BaseLayout } from "../components/layout/Layout";
import { DISRUPTION_REASONS, COOKIES_DISRUPTION_INFO, COOKIES_DISRUPTION_ERRORS } from "../constants/index";
import { PageState } from "../interfaces";
import {
    createDisruptionSchema,
    validitySchemaRefined,
    Validity,
    validitySchema,
    Disruption,
} from "../schemas/create-disruption.schema";
import { flattenZodErrors, getPageStateFromCookies } from "../utils";
import { getStateUpdater } from "../utils/formUtils";

const title = "Create Disruptions";
const description = "Create Disruptions page for the Create Transport Disruptions Service";

export interface DisruptionPageProps extends PageState<Partial<Disruption>> {}

const CreateDisruption = (props: DisruptionPageProps): ReactElement => {
    const initialValidity: Validity = {
        disruptionStartDate: props.inputs.disruptionStartDate || "",
        disruptionEndDate: props.inputs.disruptionEndDate || "",
        disruptionStartTime: props.inputs.disruptionStartTime || "",
        disruptionEndTime: props.inputs.disruptionEndTime || "",
        disruptionNoEndDateTime: props.inputs.disruptionNoEndDateTime || "",
    };

    const [pageState, setDisruptionPageState] = useState(props);
    const [validity, setValidity] = useState<Validity>(initialValidity);
    const [addValidityClicked, setAddValidityClicked] = useState(false);

    const addValidity = (e: SyntheticEvent) => {
        e.preventDefault();

        setAddValidityClicked(false);

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

            setValidity({
                disruptionStartDate: "",
                disruptionEndDate: "",
                disruptionStartTime: "",
                disruptionEndTime: "",
                disruptionNoEndDateTime: "",
            });
            setAddValidityClicked(true);
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

    const stateUpdater = getStateUpdater(setDisruptionPageState, pageState);

    const validityStateUpdater = (change: string, field: string) => {
        setValidity({ ...validity, [field]: change });
    };

    return (
        <BaseLayout title={title} description={description} errors={props.errors}>
            <CsrfForm action="/api/create-disruption" method="post" csrfToken={props.csrfToken}>
                <>
                    <ErrorSummary errors={props.errors} />
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">Create a new disruption</h1>

                        <Radios<Disruption>
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

                        <TextInput<Disruption>
                            display="Summary"
                            inputName="summary"
                            widthClass="w-3/4"
                            maxLength={50}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.summary}
                            initialErrors={pageState.errors}
                            schema={createDisruptionSchema.shape.summary}
                        />

                        <TextInput<Disruption>
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

                        <TextInput<Disruption>
                            inputName="associatedLink"
                            display="Associated Link (optional)"
                            widthClass="w-3/4"
                            maxLength={50}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.associatedLink}
                            schema={createDisruptionSchema.shape.associatedLink}
                        />

                        <Select<Disruption>
                            inputName="disruptionReason"
                            display="Reason for disruption"
                            defaultDisplay="Select a reason"
                            selectValues={DISRUPTION_REASONS.sort((a, b) => a.display.localeCompare(b.display))}
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
                            reset={addValidityClicked}
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
                            reset={addValidityClicked}
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
                            reset={addValidityClicked}
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
                            reset={addValidityClicked}
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
                            reset={addValidityClicked}
                            schema={validitySchema.shape.disruptionNoEndDateTime}
                        />
                        <button
                            className="govuk-button govuk-button--secondary mt-8"
                            data-module="govuk-button"
                            onClick={addValidity}
                            disabled={validity.disruptionNoEndDateTime === "true"}
                        >
                            Add another validity period
                        </button>
                    </div>
                    <div className="govuk-form-group govuk-!-padding-top-3">
                        <h2 className="govuk-heading-l">When does the disruption need to be published?</h2>

                        <DateSelector<Disruption>
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

                        <TimeSelector<Disruption>
                            display="Start time"
                            hint="Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm"
                            value={pageState.inputs.publishStartTime}
                            disabled={false}
                            inputName="publishStartTime"
                            stateUpdater={stateUpdater}
                            initialErrors={pageState.errors}
                            schema={createDisruptionSchema.shape.publishStartTime}
                        />

                        <DateSelector<Disruption>
                            display="End date"
                            hiddenHint="Enter in format DD/MM/YYYY"
                            value={pageState.inputs.publishEndDate}
                            disabled={validity.disruptionNoEndDateTime === "true"}
                            disablePast={false}
                            inputName="publishEndDate"
                            stateUpdater={stateUpdater}
                            initialErrors={pageState.errors}
                            schema={createDisruptionSchema.shape.publishEndDate}
                        />

                        <TimeSelector<Disruption>
                            display="End time"
                            hint="Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm"
                            value={pageState.inputs.publishEndTime}
                            disabled={validity.disruptionNoEndDateTime === "true"}
                            inputName="publishEndTime"
                            stateUpdater={stateUpdater}
                            initialErrors={pageState.errors}
                            schema={createDisruptionSchema.shape.publishEndTime}
                        />

                        <button className="govuk-button mt-8" data-module="govuk-button">
                            Save and continue
                        </button>
                    </div>
                </>
            </CsrfForm>
        </BaseLayout>
    );
};

export const getServerSideProps = (ctx: NextPageContext): { props: DisruptionPageProps } => {
    const cookies = parseCookies(ctx);

    const dataCookie = cookies[COOKIES_DISRUPTION_INFO];
    const errorCookie = cookies[COOKIES_DISRUPTION_ERRORS];

    return {
        props: {
            ...getPageStateFromCookies(dataCookie, errorCookie, createDisruptionSchema),
        },
    };
};

export default CreateDisruption;
