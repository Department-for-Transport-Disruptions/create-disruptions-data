import { NextPageContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { Fragment, ReactElement, SyntheticEvent, useEffect, useRef, useState } from "react";
import ErrorSummary from "../../components/ErrorSummary";
import Checkbox from "../../components/form/Checkbox";
import CsrfForm from "../../components/form/CsrfForm";
import DateSelector from "../../components/form/DateSelector";
import Radios from "../../components/form/Radios";
import Select from "../../components/form/Select";
import Table from "../../components/form/Table";
import TextInput from "../../components/form/TextInput";
import TimeSelector from "../../components/form/TimeSelector";
import { BaseLayout } from "../../components/layout/Layout";
import {
    DISRUPTION_REASONS,
    COOKIES_DISRUPTION_ERRORS,
    REVIEW_DISRUPTION_PAGE_PATH,
    DISRUPTION_DETAIL_PAGE_PATH,
} from "../../constants/index";
import { getDisruptionById } from "../../data/dynamo";
import { PageState } from "../../interfaces";
import {
    createDisruptionSchema,
    validitySchemaRefined,
    Validity,
    validitySchema,
    DisruptionInfo,
} from "../../schemas/create-disruption.schema";
import { flattenZodErrors } from "../../utils";
import { destroyCookieOnResponseObject, getPageState } from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";
import { convertDateTimeToFormat, getEndingOnDateText } from "../../utils/dates";
import { getStateUpdater } from "../../utils/formUtils";

const title = "Create Disruptions";
const description = "Create Disruptions page for the Create Transport Disruptions Service";

export interface DisruptionPageProps extends PageState<Partial<DisruptionInfo>> {}

const CreateDisruption = (props: DisruptionPageProps): ReactElement => {
    const initialValidity: Validity = {
        disruptionStartDate: props.inputs.disruptionStartDate || "",
        disruptionEndDate: props.inputs.disruptionEndDate || "",
        disruptionStartTime: props.inputs.disruptionStartTime || "",
        disruptionEndTime: props.inputs.disruptionEndTime || "",
        disruptionNoEndDateTime: props.inputs.disruptionNoEndDateTime || "",
        disruptionRepeats: props.inputs.disruptionRepeats || "doesntRepeat",
        disruptionRepeatsEndDate: props.inputs.disruptionRepeatsEndDate || "",
    };

    const [pageState, setDisruptionPageState] = useState(props);
    const [validity, setValidity] = useState<Validity>(initialValidity);
    const [addValidityClicked, setAddValidityClicked] = useState(false);

    const queryParams = useRouter().query;
    const displayCancelButton =
        queryParams["return"]?.includes(REVIEW_DISRUPTION_PAGE_PATH) ||
        queryParams["return"]?.includes(DISRUPTION_DETAIL_PAGE_PATH);

    const doesntRepeatRef = useRef<HTMLInputElement>(null);
    const dailyRef = useRef<HTMLInputElement>(null);
    const weeklyRef = useRef<HTMLInputElement>(null);

    const hasInitialised = useRef(false);
    useEffect(() => {
        if (window.GOVUKFrontend && !hasInitialised.current) {
            window.GOVUKFrontend.initAll();
        }
        hasInitialised.current = true;
    });

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
                ...pageState,
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
                disruptionRepeats: "doesntRepeat",
                disruptionRepeatsEndDate: "",
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
                ...pageState,
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
            return pageState.inputs.validity.map((validity, i) => {
                const endingOnDate =
                    validity.disruptionRepeats === "daily" || validity.disruptionRepeats === "weekly"
                        ? validity.disruptionRepeatsEndDate
                        : null;

                return {
                    header: `Validity period ${i + 1}`,
                    cells: [
                        validity.disruptionEndDate &&
                        validity.disruptionEndTime &&
                        !validity.disruptionNoEndDateTime ? (
                            validity.disruptionRepeats &&
                            validity.disruptionRepeats !== "doesntRepeat" &&
                            endingOnDate ? (
                                <span>
                                    {validity.disruptionStartDate} {validity.disruptionStartTime} -{" "}
                                    {validity.disruptionEndDate} {validity.disruptionEndTime} <br /> Repeats{" "}
                                    {validity.disruptionRepeats} until {endingOnDate}{" "}
                                </span>
                            ) : (
                                `${validity.disruptionStartDate} ${validity.disruptionStartTime} - ${validity.disruptionEndDate} ${validity.disruptionEndTime}`
                            )
                        ) : (
                            `${validity.disruptionStartDate} ${validity.disruptionStartTime} - No end date/time`
                        ),
                        <button
                            id={`remove-validity-period-${i + 1}`}
                            key={`remove-validity-period-${i + 1}`}
                            className="govuk-link"
                            onClick={(e) => removeValidity(e, i)}
                        >
                            Remove
                        </button>,
                    ],
                };
            });
        }
        return [];
    };

    const stateUpdater = getStateUpdater(setDisruptionPageState, pageState);

    const validityStateUpdater = (change: string, field: string) => {
        setValidity({ ...validity, [field]: change });
    };

    const updateDisruptionRepeats = (change: string, field: string) => {
        setValidity({
            ...validity,
            [field]: change,
            disruptionNoEndDateTime: change === "daily" || change === "weekly" ? "" : validity.disruptionNoEndDateTime,
            disruptionRepeatsEndDate: "",
        });
    };

    const handleNow = (e: SyntheticEvent) => {
        e.preventDefault();
        const dateTime = new Date();

        setDisruptionPageState({
            ...pageState,
            inputs: {
                ...pageState.inputs,
                publishStartDate: convertDateTimeToFormat(dateTime, "DD/MM/YYYY"),
                publishStartTime: convertDateTimeToFormat(dateTime, "HHmm"),
            },
        });
    };

    const getEndingDateDisplay = () => {
        return validity.disruptionRepeats !== "doesntRepeat" && validity.disruptionRepeatsEndDate
            ? `The validity period ends on ${getEndingOnDateText(
                  validity.disruptionRepeats,
                  validity.disruptionRepeatsEndDate,
                  validity.disruptionStartDate,
                  validity.disruptionEndDate,
              )}${validity.disruptionEndTime ? ` at ${validity.disruptionEndTime}` : ""}`
            : null;
    };

    return (
        <BaseLayout title={title} description={description} errors={props.errors}>
            <CsrfForm action="/api/create-disruption" method="post" csrfToken={props.csrfToken}>
                <>
                    <ErrorSummary errors={props.errors} />
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">Create a new disruption</h1>

                        <Radios<DisruptionInfo>
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

                        <TextInput<DisruptionInfo>
                            display="Summary"
                            inputName="summary"
                            widthClass="w-3/4"
                            maxLength={100}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.summary}
                            initialErrors={pageState.errors}
                            schema={createDisruptionSchema.shape.summary}
                        />

                        <TextInput<DisruptionInfo>
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

                        <TextInput<DisruptionInfo>
                            inputName="associatedLink"
                            display="Associated Link (optional)"
                            widthClass="w-3/4"
                            maxLength={250}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.associatedLink}
                            schema={createDisruptionSchema.shape.associatedLink}
                        />

                        <Select<DisruptionInfo>
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
                                <input type="hidden" name={`validity${index + 1}`} value={item.disruptionRepeats} />
                                <input
                                    type="hidden"
                                    name={`validity${index + 1}`}
                                    value={item.disruptionRepeatsEndDate}
                                />
                            </Fragment>
                        ))}
                        <div className="flex pb-8">
                            <div>
                                <DateSelector<Validity>
                                    display="Start date"
                                    hint={{ hidden: false, text: "Enter in format DD/MM/YYYY" }}
                                    value={validity.disruptionStartDate}
                                    disabled={false}
                                    disablePast={false}
                                    inputName={"disruptionStartDate"}
                                    stateUpdater={validityStateUpdater}
                                    initialErrors={pageState.errors}
                                    reset={addValidityClicked}
                                    schema={validitySchema.shape.disruptionStartDate}
                                />
                            </div>
                            <div className="pl-4">
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
                            </div>
                        </div>
                        <div className="flex pb-8">
                            <div>
                                <DateSelector<Validity>
                                    display="End date"
                                    hint={{ hidden: true, text: "Enter in format DD/MM/YYYY" }}
                                    value={validity.disruptionEndDate}
                                    disabled={validity.disruptionNoEndDateTime === "true"}
                                    disablePast={false}
                                    inputName="disruptionEndDate"
                                    stateUpdater={validityStateUpdater}
                                    initialErrors={pageState.errors}
                                    reset={addValidityClicked}
                                    schema={validitySchema.shape.disruptionEndDate}
                                />
                            </div>
                            <div className="pl-5">
                                <TimeSelector<Validity>
                                    display="End time"
                                    value={validity.disruptionEndTime}
                                    disabled={validity.disruptionNoEndDateTime === "true"}
                                    inputName="disruptionEndTime"
                                    stateUpdater={validityStateUpdater}
                                    initialErrors={pageState.errors}
                                    reset={addValidityClicked}
                                    schema={validitySchema.shape.disruptionEndTime}
                                />
                            </div>
                        </div>

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

                        <div className="flex pb-8">
                            <div>
                                <DateSelector<DisruptionInfo>
                                    display="Publication start date"
                                    hint={{ hidden: false, text: "Enter in format DD/MM/YYYY" }}
                                    value={
                                        pageState.inputs.publishStartDate ||
                                        validity.disruptionRepeats !== "doesntRepeat"
                                            ? pageState.inputs.publishStartDate
                                            : validity.disruptionStartDate
                                    }
                                    disabled={false}
                                    disablePast={false}
                                    inputName="publishStartDate"
                                    stateUpdater={stateUpdater}
                                    initialErrors={pageState.errors}
                                    schema={createDisruptionSchema.shape.publishStartDate}
                                    resetError={
                                        (!pageState.inputs.publishStartDate &&
                                            !!validity.disruptionStartDate &&
                                            validity.disruptionRepeats === "doesntRepeat") ||
                                        pageState.inputs.publishStartDate ===
                                            convertDateTimeToFormat(new Date(), "DD/MM/YYYY")
                                    }
                                />
                            </div>
                            <div className="pl-4">
                                <TimeSelector<DisruptionInfo>
                                    display="Publication start time"
                                    hint="Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm"
                                    value={
                                        pageState.inputs.publishStartTime ||
                                        validity.disruptionRepeats !== "doesntRepeat"
                                            ? pageState.inputs.publishStartTime
                                            : validity.disruptionStartTime
                                    }
                                    disabled={false}
                                    inputName="publishStartTime"
                                    stateUpdater={stateUpdater}
                                    initialErrors={pageState.errors}
                                    schema={createDisruptionSchema.shape.publishStartTime}
                                    resetError={
                                        (!pageState.inputs.publishStartTime &&
                                            !!validity.disruptionStartTime &&
                                            validity.disruptionRepeats === "doesntRepeat") ||
                                        pageState.inputs.publishStartTime ===
                                            convertDateTimeToFormat(new Date(), "HHmm")
                                    }
                                    showNowButton={handleNow}
                                />
                            </div>
                        </div>

                        <div className="flex pb-8">
                            <div>
                                <DateSelector<DisruptionInfo>
                                    display="Publication end date"
                                    hint={{ hidden: true, text: "Enter in format DD/MM/YYYY" }}
                                    value={
                                        pageState.inputs.publishEndDate || validity.disruptionRepeats !== "doesntRepeat"
                                            ? pageState.inputs.publishEndDate
                                            : validity.disruptionEndDate
                                    }
                                    disabled={validity.disruptionNoEndDateTime === "true"}
                                    disablePast={false}
                                    inputName="publishEndDate"
                                    stateUpdater={stateUpdater}
                                    initialErrors={pageState.errors}
                                    schema={createDisruptionSchema.shape.publishEndDate}
                                />
                            </div>
                            <div className="pl-5">
                                <TimeSelector<DisruptionInfo>
                                    display="Publication end time"
                                    value={
                                        pageState.inputs.publishEndTime || validity.disruptionRepeats !== "doesntRepeat"
                                            ? pageState.inputs.publishEndTime
                                            : validity.disruptionEndTime
                                    }
                                    disabled={validity.disruptionNoEndDateTime === "true"}
                                    inputName="publishEndTime"
                                    stateUpdater={stateUpdater}
                                    initialErrors={pageState.errors}
                                    schema={createDisruptionSchema.shape.publishEndTime}
                                />
                            </div>
                        </div>

                        <Radios<DisruptionInfo>
                            display="Does this disruption repeat?"
                            radioDetail={[
                                {
                                    value: "doesntRepeat",
                                    display: "Doesn't repeat",
                                    ref: doesntRepeatRef,
                                },
                                {
                                    value: "daily",
                                    display: "Daily",
                                    ref: dailyRef,
                                    disabled: validity.disruptionNoEndDateTime === "true",
                                    conditionalElement: (
                                        <DateSelector<Validity>
                                            display="Ending on"
                                            hint={{ hidden: false, text: "Enter in format DD/MM/YYYY" }}
                                            value={validity.disruptionRepeatsEndDate}
                                            disabled={false}
                                            disablePast={false}
                                            inputName="disruptionRepeatsEndDate"
                                            stateUpdater={validityStateUpdater}
                                            initialErrors={pageState.errors}
                                            reset={addValidityClicked || validity.disruptionRepeats !== "daily"}
                                            schema={validitySchema.shape.disruptionRepeatsEndDate}
                                            suffixId="daily"
                                        />
                                    ),
                                },
                                {
                                    value: "weekly",
                                    display: "Weekly",
                                    ref: weeklyRef,
                                    disabled: validity.disruptionNoEndDateTime === "true",
                                    conditionalElement: (
                                        <DateSelector<Validity>
                                            display="Ending on"
                                            hint={{ hidden: false, text: "Enter in format DD/MM/YYYY" }}
                                            value={validity.disruptionRepeatsEndDate}
                                            disabled={false}
                                            disablePast={false}
                                            inputName="disruptionRepeatsEndDate"
                                            stateUpdater={validityStateUpdater}
                                            initialErrors={pageState.errors}
                                            reset={addValidityClicked || validity.disruptionRepeats !== "weekly"}
                                            schema={validitySchema.shape.disruptionRepeatsEndDate}
                                        />
                                    ),
                                },
                            ]}
                            inputName="disruptionRepeats"
                            stateUpdater={updateDisruptionRepeats}
                            value={
                                validity.disruptionNoEndDateTime === "true"
                                    ? "doesntRepeat"
                                    : validity.disruptionRepeats
                            }
                            initialErrors={pageState.errors}
                        />
                        <legend>{getEndingDateDisplay()}</legend>

                        <button
                            className="govuk-button govuk-button--secondary mt-8"
                            data-module="govuk-button"
                            onClick={addValidity}
                            disabled={validity.disruptionNoEndDateTime === "true"}
                        >
                            Add another validity period
                        </button>
                    </div>

                    <input type="hidden" name="disruptionId" value={props.disruptionId} />

                    <button className="govuk-button" data-module="govuk-button">
                        Save and continue
                    </button>

                    {displayCancelButton && pageState.disruptionId ? (
                        <Link
                            role="button"
                            href={`${queryParams["return"] as string}/${pageState.disruptionId}`}
                            className="govuk-button ml-5 govuk-button--secondary"
                        >
                            Cancel Changes
                        </Link>
                    ) : null}
                </>
            </CsrfForm>
        </BaseLayout>
    );
};

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: DisruptionPageProps }> => {
    const cookies = parseCookies(ctx);
    const errorCookie = cookies[COOKIES_DISRUPTION_ERRORS];

    if (!ctx.req) {
        throw new Error("No context request");
    }

    const session = getSession(ctx.req);

    if (!session) {
        throw new Error("No session found");
    }

    const disruptionId = ctx.query.disruptionId?.toString() ?? "";
    const disruption = await getDisruptionById(disruptionId, session.orgId);

    if (ctx.res) destroyCookieOnResponseObject(COOKIES_DISRUPTION_ERRORS, ctx.res);

    if (!disruption) {
        return {
            props: {
                ...getPageState(errorCookie, createDisruptionSchema, disruptionId),
            },
        };
    }

    return {
        props: {
            ...getPageState(errorCookie, createDisruptionSchema, disruption.disruptionId, disruption),
        },
    };
};

export default CreateDisruption;
