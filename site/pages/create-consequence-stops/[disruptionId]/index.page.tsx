import { NextPageContext } from "next";
import Link from "next/link";
import { parseCookies } from "nookies";
import { ReactElement, SyntheticEvent, useEffect, useState } from "react";
import { SingleValue } from "react-select";
import { z } from "zod";
import ErrorSummary from "../../../components/ErrorSummary";
import CsrfForm from "../../../components/form/CsrfForm";
import Map from "../../../components/form/Map";
import Radios from "../../../components/form/Radios";
import SearchSelect from "../../../components/form/SearchSelect";
import Select from "../../../components/form/Select";
import Table from "../../../components/form/Table";
import TextInput from "../../../components/form/TextInput";
import TimeSelector from "../../../components/form/TimeSelector";
import { BaseLayout } from "../../../components/layout/Layout";
import {
    CONSEQUENCE_TYPES,
    COOKIES_CONSEQUENCE_TYPE_INFO,
    DISRUPTION_SEVERITIES,
    VEHICLE_MODES,
    COOKIES_CONSEQUENCE_STOPS_ERRORS,
    API_BASE_URL,
    ADMIN_AREA_CODE,
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
} from "../../../constants";
import { CreateConsequenceProps, PageState } from "../../../interfaces";
import { StopsConsequence, Stop, stopsConsequenceSchema, stopSchema } from "../../../schemas/consequence.schema";
import { typeOfConsequenceSchema } from "../../../schemas/type-of-consequence.schema";
import { flattenZodErrors, getDisplayByValue, redirectTo } from "../../../utils";
import { getPageState } from "../../../utils/apiUtils";
import { getStateUpdater, getStopLabel, getStopValue } from "../../../utils/formUtils";

const title = "Create Consequence Stops";
const description = "Create Consequence Stops page for the Create Transport Disruptions Service";

export interface CreateConsequenceStopsProps extends PageState<Partial<StopsConsequence>>, CreateConsequenceProps {}

const CreateConsequenceStops = (props: CreateConsequenceStopsProps): ReactElement => {
    const [pageState, setPageState] = useState<PageState<Partial<StopsConsequence>>>(props);
    const stateUpdater = getStateUpdater(setPageState, pageState);
    const [selected, setSelected] = useState<SingleValue<Stop>>(null);
    const [stopOptions, setStopOptions] = useState<Stop[]>([]);
    const [searchInput, setSearchInput] = useState("");

    const handleChange = (value: SingleValue<Stop>) => {
        if (!pageState.inputs.stops || !pageState.inputs.stops.some((data) => data.atcoCode === value?.atcoCode)) {
            addStop(value);
        }
        setSelected(null);
    };

    useEffect(() => {
        const loadOptions = async () => {
            if (searchInput.length >= 3) {
                const searchApiUrl = `${API_BASE_URL}stops?adminAreaCodes=${ADMIN_AREA_CODE}&search=${searchInput}`;
                const res = await fetch(searchApiUrl, { method: "GET" });
                const data: Stop[] = z.array(stopSchema).parse(await res.json());
                if (data) {
                    setStopOptions(data);
                }
            } else {
                setStopOptions([]);
            }
        };

        loadOptions()
            // eslint-disable-next-line no-console
            .catch(console.error);
    }, [searchInput]);

    const removeStop = (e: SyntheticEvent, index: number) => {
        e.preventDefault();
        if (pageState.inputs.stops) {
            const stops = [...pageState.inputs.stops];
            stops.splice(index, 1);

            setPageState({
                inputs: {
                    ...pageState.inputs,
                    stops,
                },
                errors: pageState.errors,
            });
        }
    };

    const getStopRows = () => {
        if (pageState.inputs.stops) {
            return pageState.inputs.stops.map((stop, i) => ({
                cells: [
                    stop.commonName && stop.indicator && stop.atcoCode
                        ? `${stop.commonName} ${stop.indicator} ${stop.atcoCode}`
                        : `${stop.commonName} ${stop.atcoCode}`,
                    <button
                        id={`remove-stop-${stop.atcoCode}`}
                        key={`remove-stop-${stop.atcoCode}`}
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

    const addStop = (stopToAdd: SingleValue<Stop>) => {
        const parsed = stopSchema.safeParse(stopToAdd);

        if (!parsed.success) {
            setPageState({
                ...pageState,
                errors: [
                    ...pageState.errors.filter((err) => !Object.keys(stopsConsequenceSchema.shape).includes(err.id)),
                    ...flattenZodErrors(parsed.error),
                ],
            });
        } else {
            if (stopToAdd) {
                setPageState({
                    inputs: {
                        ...pageState.inputs,
                        stops: [...(pageState.inputs.stops ?? []), stopToAdd].sort((a, b) => {
                            if (a.commonName && a.indicator && a.atcoCode && b.indicator) {
                                return (
                                    a.commonName.localeCompare(b.commonName) ||
                                    a.indicator.localeCompare(b.indicator) ||
                                    a.atcoCode.localeCompare(b.atcoCode)
                                );
                            } else {
                                return a.commonName.localeCompare(b.commonName) || a.atcoCode.localeCompare(b.atcoCode);
                            }
                        }),
                    },
                    errors: [
                        ...pageState.errors.filter(
                            (err) => !Object.keys(stopsConsequenceSchema.shape).includes(err.id),
                        ),
                    ],
                });
            }
        }
    };

    return (
        <BaseLayout title={title} description={description}>
            <CsrfForm action="/api/create-consequence-stops" method="post" csrfToken={props.csrfToken}>
                <>
                    <ErrorSummary errors={props.errors} />
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">Add a consequence</h1>
                        <Table
                            rows={[
                                {
                                    header: "Mode of transport",
                                    cells: [
                                        getDisplayByValue(
                                            VEHICLE_MODES,
                                            props.previousConsequenceInformation.vehicleMode,
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
                                            props.previousConsequenceInformation.consequenceType,
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
                            inputName="stop"
                            initialErrors={pageState.errors}
                            placeholder="Select stops"
                            getOptionLabel={getStopLabel}
                            handleChange={handleChange}
                            tableData={pageState.inputs.stops}
                            getRows={getStopRows}
                            getOptionValue={getStopValue}
                            display="Stops Impacted"
                            displaySize="l"
                            inputId="stops"
                            inputValue={searchInput}
                            setSearchInput={setSearchInput}
                            isClearable
                            options={stopOptions}
                        />

                        <Map
                            initialViewState={{
                                longitude: -1.7407941662903283,
                                latitude: 53.05975866591879,
                                zoom: 4.5,
                            }}
                            style={{ width: "100%", height: 400, marginBottom: 20 }}
                            mapStyle="mapbox://styles/mapbox/streets-v12"
                            selected={
                                pageState.inputs.stops && pageState.inputs.stops.length > 0
                                    ? pageState.inputs.stops
                                    : []
                            }
                            searched={stopOptions.filter((stopToFilter: Stop) =>
                                pageState.inputs.stops && pageState.inputs.stops.length > 0
                                    ? !pageState.inputs.stops.map((s) => s.atcoCode).includes(stopToFilter.atcoCode)
                                    : stopToFilter,
                            )}
                        />
                        <TextInput<StopsConsequence>
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
                            schema={stopsConsequenceSchema.shape.description}
                        />

                        <Radios<StopsConsequence>
                            display="Remove from journey planners"
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
                            schema={stopsConsequenceSchema.shape.removeFromJourneyPlanners}
                        />
                        <TimeSelector<StopsConsequence>
                            display="Delay (minutes)"
                            displaySize="l"
                            hint="Enter the time in minutes"
                            value={pageState.inputs.disruptionDelay}
                            disabled={false}
                            inputName="disruptionDelay"
                            stateUpdater={stateUpdater}
                            initialErrors={pageState.errors}
                            schema={stopsConsequenceSchema.shape.disruptionDelay}
                            placeholderValue=""
                        />
                        <Select<StopsConsequence>
                            inputName="disruptionSeverity"
                            display="Disruption severity"
                            displaySize="l"
                            defaultDisplay="Select severity"
                            selectValues={DISRUPTION_SEVERITIES}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.disruptionSeverity}
                            initialErrors={pageState.errors}
                            schema={stopsConsequenceSchema.shape.disruptionSeverity}
                        />
                        <input type="hidden" name="consequenceType" value="stops" />
                        <input
                            type="hidden"
                            name="vehicleMode"
                            value={props.previousConsequenceInformation.vehicleMode}
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

export const getServerSideProps = (ctx: NextPageContext): { props: CreateConsequenceStopsProps } | void => {
    const cookies = parseCookies(ctx);
    const typeCookie = cookies[COOKIES_CONSEQUENCE_TYPE_INFO];
    const errorCookie = cookies[COOKIES_CONSEQUENCE_STOPS_ERRORS];

    if (!typeCookie && ctx.res) {
        if (ctx.res) {
            redirectTo(ctx.res, TYPE_OF_CONSEQUENCE_PAGE_PATH);
        }

        return;
    }

    const previousConsequenceInformation = typeOfConsequenceSchema.safeParse(JSON.parse(typeCookie));

    if (!previousConsequenceInformation.success) {
        if (ctx.res) {
            redirectTo(ctx.res, TYPE_OF_CONSEQUENCE_PAGE_PATH);
        }

        return;
    }

    const pageState = getPageState<StopsConsequence>(errorCookie, stopsConsequenceSchema);

    return {
        props: { ...pageState, previousConsequenceInformation: previousConsequenceInformation.data },
    };
};

export default CreateConsequenceStops;
