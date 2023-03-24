import { NextPageContext } from "next";
import Link from "next/link";
import { parseCookies } from "nookies";
import { ReactElement, SyntheticEvent, useState } from "react";
import { SingleValue } from "react-select";
import { z } from "zod";
import ErrorSummary from "../components/ErrorSummary";
import Radios from "../components/form/Radios";
import SearchSelect from "../components/form/SearchSelect";
import Select from "../components/form/Select";
import Table from "../components/form/Table";
import TextInput from "../components/form/TextInput";
import TimeSelector from "../components/form/TimeSelector";
import { BaseLayout } from "../components/layout/Layout";
import {
    CONSEQUENCE_TYPES,
    COOKIES_CONSEQUENCE_INFO,
    COOKIES_CONSEQUENCE_TYPE_INFO,
    DISRUPTION_SEVERITIES,
    VEHICLE_MODES,
    COOKIES_CONSEQUENCE_STOPS_ERRORS,
} from "../constants";
import { CreateConsequenceProps, PageState } from "../interfaces";
import { createConsequenceStopsSchema, stopsImpactedSchema } from "../schemas/create-consequence-stops.schema";
import { typeOfConsequenceSchema } from "../schemas/type-of-consequence.schema";
import { flattenZodErrors, getDisplayByValue, getPageStateFromCookies } from "../utils";
import { getStateUpdater } from "../utils/formUtils";

const title = "Create Consequence Stops";
const description = "Create Consequence Stops page for the Create Transport Disruptions Service";

export interface ConsequenceStopsPageInputs extends Partial<z.infer<typeof createConsequenceStopsSchema>> {}
export interface Stop extends z.infer<typeof stopsImpactedSchema> {}

const CreateConsequenceStops = ({
    inputs,
    previousConsequenceInformation,
}: CreateConsequenceProps<ConsequenceStopsPageInputs>): ReactElement => {
    const [pageState, setPageState] = useState<PageState<Partial<ConsequenceStopsPageInputs>>>(inputs);
    const stateUpdater = getStateUpdater(setPageState, pageState);
    const [selected, setSelected] = useState<SingleValue<Stop>>(null);

    const getOptionLabel = (e: Stop) => {
        if (e.commonName && e.indicator && e.atcoCode) {
            return `${e.commonName} ${e.indicator} ${e.atcoCode}`;
        } else if (e.commonName && e.atcoCode) {
            return `${e.commonName} ${e.atcoCode}`;
        } else {
            return "";
        }
    };

    const selectAllStops = () => {
        //TODO
    };

    const handleChange = (value: SingleValue<Stop>) => {
        if (
            !pageState.inputs.stopsImpacted ||
            pageState.inputs.stopsImpacted.filter((data) => data.id === value?.id).length === 0
        ) {
            addStop(value);
        }
        setSelected(null);
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const loadOptions = async (inputValue: string, _callback: (options: Stop[]) => void) => {
        if (inputValue && inputValue.length >= 3) {
            const searchApiUrl = `https://api.test.ref-data.dft-create-data.com/v1/stops?adminAreaCode=099`;
            const limit = 10;
            const queryAdder = searchApiUrl.indexOf("?") === -1 ? "?" : "&";
            const fetchURL = `${searchApiUrl}${queryAdder}search=${inputValue}&limit=${limit}`;
            const res = await fetch(fetchURL, { method: "GET" });
            const data: Stop[] = z.array(stopsImpactedSchema).parse(await res.json());
            if (data) {
                return data;
            }
        }
        return [];
    };

    const removeStop = (e: SyntheticEvent, index: number) => {
        e.preventDefault();
        if (pageState.inputs.stopsImpacted) {
            const stopsImpacted = [...pageState.inputs.stopsImpacted];
            stopsImpacted.splice(index, 1);

            setPageState({
                inputs: {
                    ...pageState.inputs,
                    stopsImpacted,
                },
                errors: pageState.errors,
            });
        }
    };

    const getStopRows = () => {
        if (pageState.inputs.stopsImpacted) {
            return pageState.inputs.stopsImpacted.map((stop, i) => ({
                header: `Stop ${i + 1}`,
                cells: [
                    stop.commonName && stop.indicator && !stop.atcoCode
                        ? `${stop.commonName} ${stop.indicator} ${stop.atcoCode}`
                        : `${stop.commonName} ${stop.atcoCode}`,
                    <button
                        id={`remove-stop-${i + 1}`}
                        key={`remove-stop-${i + 1}`}
                        className="govuk-link"
                        onClick={(e) => removeStop(e, i)}
                    >
                        Remove
                    </button>,
                ],
            }));
        }
        return [];
    };

    const getOptionValue = (e: Stop) => (e.id ? e.id.toString() : "");

    const addStop = (stopToAdd: SingleValue<Stop>) => {
        const parsed = stopsImpactedSchema.safeParse(stopToAdd);

        if (!parsed.success) {
            setPageState({
                ...pageState,
                errors: [
                    ...pageState.errors.filter(
                        (err) => !Object.keys(createConsequenceStopsSchema.shape).includes(err.id),
                    ),
                    ...flattenZodErrors(parsed.error),
                ],
            });
        } else {
            if (stopToAdd) {
                setPageState({
                    inputs: {
                        ...pageState.inputs,
                        stopsImpacted: [...(pageState.inputs.stopsImpacted ?? []), stopToAdd],
                    },
                    errors: [
                        ...pageState.errors.filter(
                            (err) => !Object.keys(createConsequenceStopsSchema.shape).includes(err.id),
                        ),
                    ],
                });
            }
        }
    };

    return (
        <BaseLayout title={title} description={description}>
            <form action="/api/create-consequence-stops" method="post">
                <>
                    <ErrorSummary errors={inputs.errors} />
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">Add a consequence</h1>
                        <Table
                            rows={[
                                {
                                    header: "Mode of transport",
                                    cells: [
                                        getDisplayByValue(
                                            VEHICLE_MODES,
                                            previousConsequenceInformation.modeOfTransport,
                                        ),
                                        <Link
                                            key={"mode-of-transport"}
                                            className="govuk-link"
                                            href="/type-of-consequence"
                                        >
                                            Change
                                        </Link>,
                                    ],
                                },
                                {
                                    header: "Consequence type",
                                    cells: [
                                        getDisplayByValue(
                                            CONSEQUENCE_TYPES,
                                            previousConsequenceInformation.consequenceType,
                                        ),
                                        <Link
                                            key={"consequence-type"}
                                            className="govuk-link"
                                            href="/type-of-consequence"
                                        >
                                            Change
                                        </Link>,
                                    ],
                                },
                            ]}
                        />

                        <SearchSelect<Stop>
                            selected={selected}
                            inputName="stopsImpacted"
                            initialErrors={pageState.errors}
                            placeholder="Select stops"
                            getOptionLabel={getOptionLabel}
                            loadOptions={loadOptions}
                            handleChange={handleChange}
                            tableData={pageState.inputs.stopsImpacted}
                            getRows={getStopRows}
                            getOptionValue={getOptionValue}
                            display="Stops Impacted"
                            displaySize="l"
                            inputId="stopsImpacted"
                        />
                        <button
                            className="govuk-button govuk-button--secondary mt-8"
                            data-module="govuk-button"
                            onClick={selectAllStops}
                        >
                            Select all stops
                        </button>
                        <TextInput<ConsequenceStopsPageInputs>
                            display="Consequence description"
                            displaySize="l"
                            hint="What advice would you like to display?"
                            inputName="description"
                            widthClass="w-3/4"
                            textArea
                            rows={3}
                            maxLength={500}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.description}
                            initialErrors={pageState.errors}
                            schema={createConsequenceStopsSchema.shape.description}
                        />

                        <Radios<ConsequenceStopsPageInputs>
                            display="Would you like to remove this from journey planners?"
                            displaySize="l"
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
                            inputName="removeFromJourneyPlanners"
                            stateUpdater={stateUpdater}
                            value={pageState.inputs["removeFromJourneyPlanners"]}
                            initialErrors={pageState.errors}
                            schema={createConsequenceStopsSchema.shape.removeFromJourneyPlanners}
                        />

                        <TimeSelector<ConsequenceStopsPageInputs>
                            display="Delay (minutes)"
                            displaySize="l"
                            hint="Enter the time in minutes"
                            value={pageState.inputs.disruptionDelay}
                            disabled={false}
                            inputName="disruptionDelay"
                            stateUpdater={stateUpdater}
                            initialErrors={pageState.errors}
                            schema={createConsequenceStopsSchema.shape.disruptionDelay}
                            placeholderValue=""
                        />

                        <Select<ConsequenceStopsPageInputs>
                            inputName="disruptionSeverity"
                            display="What is the severity of the disruption?"
                            displaySize="l"
                            defaultDisplay="Select severity"
                            selectValues={DISRUPTION_SEVERITIES}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.disruptionSeverity}
                            initialErrors={pageState.errors}
                            schema={createConsequenceStopsSchema.shape.disruptionSeverity}
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

export const getServerSideProps = (ctx: NextPageContext): { props: object } | void => {
    let inputs: PageState<Partial<ConsequenceStopsPageInputs>> = {
        errors: [],
        inputs: {},
    };

    let previousConsequenceInformationData = {};

    const cookies = parseCookies(ctx);
    const typeCookie = cookies[COOKIES_CONSEQUENCE_TYPE_INFO];
    const dataCookie = cookies[COOKIES_CONSEQUENCE_INFO];
    const errorCookie = cookies[COOKIES_CONSEQUENCE_STOPS_ERRORS];

    if (typeCookie) {
        const previousConsequenceInformation = typeOfConsequenceSchema.safeParse(JSON.parse(typeCookie));

        if (previousConsequenceInformation.success) {
            previousConsequenceInformationData = previousConsequenceInformation.data;
        }
    }

    inputs = getPageStateFromCookies<ConsequenceStopsPageInputs>(dataCookie, errorCookie, createConsequenceStopsSchema);

    return { props: { inputs: inputs, previousConsequenceInformation: previousConsequenceInformationData } };
};

export default CreateConsequenceStops;
