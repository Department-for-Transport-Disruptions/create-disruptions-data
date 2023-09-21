import { Stop, StopsConsequence } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { stopSchema, stopsConsequenceSchema } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { Modes, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { NextPageContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { ReactElement, SyntheticEvent, useEffect, useState } from "react";
import { SingleValue } from "react-select";
import DeleteDisruptionButton from "../../../components/buttons/DeleteDisruptionButton";
import CsrfForm from "../../../components/form/CsrfForm";
import ErrorSummary from "../../../components/form/ErrorSummary";
import Radios from "../../../components/form/Radios";
import SearchSelect from "../../../components/form/SearchSelect";
import Select from "../../../components/form/Select";
import Table from "../../../components/form/Table";
import TextInput from "../../../components/form/TextInput";
import TimeSelector from "../../../components/form/TimeSelector";
import { BaseLayout } from "../../../components/layout/Layout";
import Map from "../../../components/map/StopsMap";
import { createChangeLink } from "../../../components/ReviewConsequenceTable";
import {
    DISRUPTION_SEVERITIES,
    VEHICLE_MODES,
    COOKIES_CONSEQUENCE_STOPS_ERRORS,
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
    CREATE_CONSEQUENCE_STOPS_PATH,
    DISRUPTION_DETAIL_PAGE_PATH,
} from "../../../constants";
import { getDisruptionById } from "../../../data/dynamo";
import { fetchStops } from "../../../data/refDataApi";
import { CreateConsequenceProps, PageState } from "../../../interfaces";
import { flattenZodErrors, isStopsConsequence } from "../../../utils";
import { destroyCookieOnResponseObject, getPageState } from "../../../utils/apiUtils";
import { getSessionWithOrgDetail } from "../../../utils/apiUtils/auth";
import {
    getStateUpdater,
    getStopLabel,
    getStopValue,
    returnTemplateOverview,
    showCancelButton,
} from "../../../utils/formUtils";

const title = "Create Consequence Stops";
const description = "Create Consequence Stops page for the Create Transport Disruptions Service";

export interface CreateConsequenceStopsProps extends PageState<Partial<StopsConsequence>>, CreateConsequenceProps {}

const CreateConsequenceStops = (props: CreateConsequenceStopsProps): ReactElement => {
    const [pageState, setPageState] = useState<PageState<Partial<StopsConsequence>>>(props);
    const stateUpdater = getStateUpdater(setPageState, pageState);
    const [selected, setSelected] = useState<SingleValue<Stop>>(null);
    const [stopOptions, setStopOptions] = useState<Stop[]>([]);
    const [searchInput, setSearchInput] = useState("");
    const [changePlaceholder, setChangePlaceHolder] = useState(false);

    const queryParams = useRouter().query;
    const displayCancelButton = showCancelButton(queryParams);

    const returnToTemplateOverview = returnTemplateOverview(queryParams);

    const isTemplate = (queryParams["template"] as string) || "";

    const handleChange = (value: SingleValue<Stop>) => {
        if (!pageState.inputs.stops || !pageState.inputs.stops.some((data) => data.atcoCode === value?.atcoCode)) {
            addStop(value);
        }
        setSelected(null);
    };

    useEffect(() => {
        const loadOptions = async () => {
            if (searchInput.length >= 3) {
                const vehicleMode = pageState.inputs.vehicleMode as Modes | VehicleMode;
                try {
                    const stopsData = await fetchStops({
                        adminAreaCodes: props.sessionWithOrg?.adminAreaCodes ?? ["undefined"],
                        searchString: searchInput,
                        ...(vehicleMode === VehicleMode.bus ? { busStopTypes: "MKD,CUS" } : {}),
                        ...(vehicleMode === VehicleMode.bus
                            ? { stopTypes: ["BCT"] }
                            : vehicleMode === VehicleMode.tram || vehicleMode === Modes.metro
                            ? { stopTypes: ["MET", "PLT"] }
                            : vehicleMode === Modes.ferry || vehicleMode === VehicleMode.ferryService
                            ? { stopTypes: ["FER", "FBT"] }
                            : vehicleMode === Modes.rail
                            ? { stopTypes: ["RLY"] }
                            : { stopTypes: ["undefined"] }),
                    });

                    if (stopsData) {
                        setStopOptions(stopsData);
                    }
                } catch (e) {
                    setStopOptions([]);
                }
            } else {
                setStopOptions([]);
            }
        };

        loadOptions()
            // eslint-disable-next-line no-console
            .catch(console.error);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchInput]);

    const removeStop = (e: SyntheticEvent, index: number) => {
        e.preventDefault();
        if (pageState.inputs.stops) {
            const stops = [...pageState.inputs.stops];
            stops.splice(index, 1);

            setPageState({
                ...pageState,
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
            if (stopToAdd && (pageState.inputs.stops ? pageState.inputs.stops.length < 100 : true)) {
                setPageState({
                    ...pageState,
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
            <CsrfForm
                action={`/api/create-consequence-stops${isTemplate ? "?template=true" : ""}`}
                method="post"
                csrfToken={props.csrfToken}
            >
                <>
                    <ErrorSummary errors={props.errors} />
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">Add a consequence</h1>
                        <Table
                            rows={[
                                {
                                    header: "Consequence type",
                                    cells: [
                                        "Stops",
                                        createChangeLink(
                                            "consequence-type",
                                            TYPE_OF_CONSEQUENCE_PAGE_PATH,
                                            pageState.disruptionId || "",
                                            pageState.consequenceIndex ?? 0,
                                            returnToTemplateOverview || !!queryParams["return"],
                                            returnToTemplateOverview ||
                                                queryParams["return"]?.includes(DISRUPTION_DETAIL_PAGE_PATH),
                                            !!isTemplate,
                                        ),
                                    ],
                                },
                            ]}
                        />

                        <Select<StopsConsequence>
                            inputName="vehicleMode"
                            display="Mode of transport"
                            defaultDisplay="Select mode of transport"
                            selectValues={VEHICLE_MODES}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.vehicleMode}
                            initialErrors={pageState.errors}
                            displaySize="l"
                        />

                        <SearchSelect<Stop>
                            selected={selected}
                            inputName="stop"
                            initialErrors={pageState.errors}
                            placeholder={changePlaceholder ? "Type to begin search" : "Select stops"}
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
                            onBlur={() => {
                                setChangePlaceHolder(false);
                            }}
                            onFocus={() => {
                                setChangePlaceHolder(true);
                            }}
                        />

                        <Map
                            initialViewState={{
                                longitude: -1.7407941662903283,
                                latitude: 53.05975866591879,
                                zoom: 4.5,
                            }}
                            style={{ width: "100%", height: "40vh", marginBottom: 20 }}
                            mapStyle="mapbox://styles/mapbox/streets-v12"
                            selected={
                                pageState.inputs.stops && pageState.inputs.stops.length > 0
                                    ? pageState.inputs.stops
                                    : []
                            }
                            searched={stopOptions}
                            showSelectAllButton
                            stateUpdater={setPageState}
                            state={pageState}
                        />
                        <TextInput<StopsConsequence>
                            display="Consequence description"
                            displaySize="l"
                            hint="What advice would you like to display?"
                            inputName="description"
                            widthClass="w-3/4"
                            textArea
                            rows={3}
                            maxLength={1000}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.description}
                            initialErrors={pageState.errors}
                        />

                        {!pageState.inputs.description ||
                        (pageState.inputs && pageState.inputs.description.length === 0) ? (
                            <button
                                className="mt-3 govuk-link"
                                data-module="govuk-button"
                                onClick={() => {
                                    props.disruptionDescription ? stateUpdater(props.disruptionDescription, "description") : "";
                                }}
                            >
                                <p className="text-govBlue govuk-body-m">Copy from disruption description</p>
                            </button>
                        ) : null}

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
                        />
                        <TimeSelector<StopsConsequence>
                            display="Delay (optional)"
                            displaySize="l"
                            hint="Enter time in minutes"
                            value={pageState.inputs.disruptionDelay}
                            disabled={false}
                            inputName="disruptionDelay"
                            stateUpdater={stateUpdater}
                            initialErrors={pageState.errors}
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
                        />
                        <input type="hidden" name="consequenceType" value="stops" />
                        <input type="hidden" name="disruptionId" value={props.disruptionId} />
                        <input type="hidden" name="consequenceIndex" value={props.consequenceIndex} />

                        <button className="govuk-button mt-8" data-module="govuk-button">
                            Save and continue
                        </button>

                        {displayCancelButton && pageState.disruptionId ? (
                            <Link
                                role="button"
                                href={
                                    returnToTemplateOverview
                                        ? (queryParams["return"] as string)
                                        : `${queryParams["return"] as string}/${pageState.disruptionId}${
                                              isTemplate ? "?template=true" : ""
                                          }`
                                }
                                className="govuk-button mt-8 ml-5 govuk-button--secondary"
                            >
                                Cancel Changes
                            </Link>
                        ) : null}
                        {!isTemplate && (
                            <button
                                className="govuk-button mt-8 ml-5 govuk-button--secondary"
                                data-module="govuk-button"
                                formAction={`/api${CREATE_CONSEQUENCE_STOPS_PATH}?draft=true`}
                            >
                                Save as draft
                            </button>
                        )}
                        <DeleteDisruptionButton
                            disruptionId={props.disruptionId}
                            csrfToken={props.csrfToken}
                            buttonClasses="mt-8"
                            isTemplate={isTemplate}
                        />
                    </div>
                </>
            </CsrfForm>
        </BaseLayout>
    );
};

export const getServerSideProps = async (
    ctx: NextPageContext,
): Promise<{ props: CreateConsequenceStopsProps } | void> => {
    const cookies = parseCookies(ctx);
    const errorCookie = cookies[COOKIES_CONSEQUENCE_STOPS_ERRORS];

    if (!ctx.req) {
        throw new Error("No context request");
    }

    const session = await getSessionWithOrgDetail(ctx.req);

    if (!session) {
        throw new Error("No session found");
    }

    const disruption = await getDisruptionById(
        ctx.query.disruptionId?.toString() ?? "",
        session.orgId,
        !!ctx.query.template,
    );

    if (!disruption) {
        throw new Error("No disruption found for operator consequence page");
    }

    const index = ctx.query.consequenceIndex ? Number(ctx.query.consequenceIndex) : 0;

    const consequence = disruption?.consequences?.find((c) => c.consequenceIndex === index);

    const pageState = getPageState<StopsConsequence>(
        errorCookie,
        stopsConsequenceSchema,
        disruption.disruptionId,
        consequence && isStopsConsequence(consequence) ? consequence : undefined,
    );

    if (ctx.res) destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_STOPS_ERRORS, ctx.res);

    return {
        props: {
            ...pageState,
            consequenceIndex: index,
            sessionWithOrg: session,
            disruptionDescription: disruption.description || "",
            template: disruption.template?.toString() || "",
        },
    };
};

export default CreateConsequenceStops;
