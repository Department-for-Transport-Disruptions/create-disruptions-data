import { Service, JourneysConsequence, Stop, Journey } from "@create-disruptions-data/shared-ts/disruptionTypes";
import {
    journeySchema,
    journeysConsequenceSchema,
    MAX_CONSEQUENCES,
    serviceSchema,
} from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { Datasource, Modes, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { NextPageContext, Redirect } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { ReactElement, SyntheticEvent, useEffect, useState } from "react";
import { ActionMeta, createFilter, SingleValue } from "react-select";
import type { FilterOptionOption } from "react-select/dist/declarations/src/filters";
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
import NotificationBanner from "../../../components/layout/NotificationBanner";
import Map from "../../../components/map/JourneysMap";
import { createChangeLink } from "../../../components/ReviewConsequenceTable";
import {
    COOKIES_CONSEQUENCE_SERVICES_ERRORS,
    CREATE_CONSEQUENCE_SERVICES_PATH,
    DISRUPTION_DETAIL_PAGE_PATH,
    DISRUPTION_NOT_FOUND_ERROR_PAGE,
    DISRUPTION_SEVERITIES,
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
} from "../../../constants";
import { getDisruptionById, getNocCodesForOperatorOrg } from "../../../data/dynamo";
import { fetchJourneys, fetchServiceRoutes, fetchServices } from "../../../data/refDataApi";
import { CreateConsequenceProps, PageState } from "../../../interfaces";
import {
    RouteWithServiceInfo,
    filterVehicleModes,
    flattenZodErrors,
    getServiceLabel,
    getStops,
    isJourneysConsequence,
    sortServices,
} from "../../../utils";
import { destroyCookieOnResponseObject, getPageState } from "../../../utils/apiUtils";
import { getSessionWithOrgDetail } from "../../../utils/apiUtils/auth";
import {
    filterServices,
    getJourneyLabel,
    getJourneyValue,
    getStateUpdater,
    isSelectedJourneyInDropdown,
    isSelectedServiceInDropdown,
    returnTemplateOverview,
    showCancelButton,
    sortJourneys,
    sortAndFilterStops,
} from "../../../utils/formUtils";

const title = "Create Consequence Services";
const description = "Create Consequence Services page for the Create Transport Disruptions Service";

const filterConfig = {
    ignoreCase: true,
    ignoreAccents: false,
    stringify: <Option extends object>(option: FilterOptionOption<Option>) => `${option.label}`,
    trim: true,
    matchFrom: "any" as const,
};

const getMode = (vehicleMode: Modes | VehicleMode) => {
    let mode: Modes[] = [];

    if (vehicleMode === VehicleMode.ferryService) {
        mode = [Modes.ferry];
    } else if (vehicleMode === VehicleMode.tram) {
        mode = [Modes.tram, Modes.metro];
    } else {
        mode = [vehicleMode as Modes];
    }

    return mode;
};

const getServices = async (
    source: Datasource,
    vehicleMode: VehicleMode,
    adminAreaCodes?: string[],
    isOperatorUser?: boolean,
    operatorUserNocCodes?: string[],
) => {
    const mode = getMode(vehicleMode);

    const serviceData = await fetchServices({
        adminAreaCodes,
        dataSource: source,
        modes: mode,
        nocCodes: isOperatorUser && operatorUserNocCodes ? operatorUserNocCodes : [],
    });

    return filterServices(serviceData);
};

export interface CreateConsequenceJourneysProps
    extends PageState<Partial<JourneysConsequence>>,
        CreateConsequenceProps {
    consequenceDataSource: Datasource | null;
    globalDataSource: Datasource | null;
    isOperatorUser?: boolean;
    operatorUserNocCodes?: string[];
    initialStops: Stop[];
}

const CreateConsequenceJourneys = (props: CreateConsequenceJourneysProps): ReactElement => {
    const [pageState, setPageState] = useState<PageState<Partial<JourneysConsequence>>>(props);
    const stateUpdater = getStateUpdater(setPageState, pageState);
    const [selected, setSelected] = useState<SingleValue<Journey>>(null);
    const [selectedService, setSelectedService] = useState<SingleValue<Service>>(null);
    const [stopOptions, setStopOptions] = useState<Stop[]>(props.initialStops || []);
    const [journeyOptions, setJourneyOptions] = useState<Journey[]>([]);
    const [servicesSearchInput, setServicesSearchInput] = useState<string>("");
    const [journeysSearchInput, setJourneysSearchInput] = useState<string>("");
    const [searchedRoutes, setSearchedRoutes] = useState<Partial<RouteWithServiceInfo[]>>([]);
    const [serviceOptionsForDropdown, setServiceOptionsForDropdown] = useState<Service[]>([]);
    const [dataSource, setDataSource] = useState<Datasource>(props.consequenceDataSource || Datasource.bods);
    const [vehicleMode, setVehicleMode] = useState<VehicleMode | null>(props.inputs.vehicleMode || null);

    const { consequenceCount = 0 } = props;

    useEffect(() => {
        const loadOptions = async () => {
            const serviceDataToShow: RouteWithServiceInfo[] = [];
            if (pageState.inputs.services && pageState.inputs.services?.length > 0) {
                const vehicleMode = pageState?.inputs?.vehicleMode || ("" as Modes | VehicleMode);
                await Promise.all(
                    pageState.inputs.services.map(async (s) => {
                        const serviceRoutesData = await fetchServiceRoutes({
                            serviceRef: s.dataSource === Datasource.bods ? s.lineId : s.serviceCode,
                            dataSource: s.dataSource,
                            modes: vehicleMode === VehicleMode.tram ? "tram, metro" : vehicleMode,
                            ...(vehicleMode === VehicleMode.bus ? { busStopTypes: "MKD,CUS" } : {}),
                            ...(vehicleMode === VehicleMode.bus
                                ? { stopTypes: "BCT" }
                                : vehicleMode === VehicleMode.tram ||
                                  vehicleMode === Modes.metro ||
                                  vehicleMode === VehicleMode.underground
                                ? { stopTypes: "MET, PLT" }
                                : vehicleMode === Modes.ferry || vehicleMode === VehicleMode.ferryService
                                ? { stopTypes: "FER, FBT" }
                                : { stopTypes: "undefined" }),
                        });

                        if (serviceRoutesData) {
                            const notSelected =
                                serviceDataToShow.length > 0
                                    ? !serviceDataToShow.map((service) => service?.serviceId).includes(s.id)
                                    : true;
                            if (notSelected) {
                                serviceDataToShow.push({
                                    ...serviceRoutesData,
                                    serviceId: s.id,
                                    serviceCode: s.serviceCode,
                                    lineId: s.lineId,
                                });
                            }
                        }
                    }),
                );

                setSearchedRoutes(serviceDataToShow);
            }
        };

        loadOptions()
            // eslint-disable-next-line no-console
            .catch(console.error);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageState.inputs.services]);

    useEffect(() => {
        const loadJourneys = async () => {
            if (selectedService?.id) {
                const journeys = await fetchJourneys({
                    dataSource: dataSource,
                    serviceRef: dataSource === Datasource.bods ? selectedService.lineId : selectedService.serviceCode,
                });

                setJourneyOptions(sortJourneys(journeys));
            }
        };
        loadJourneys()
            // eslint-disable-next-line no-console
            .catch(console.error);
    }, [dataSource, selectedService]);

    const queryParams = useRouter().query;
    const displayCancelButton = showCancelButton(queryParams);

    const returnToTemplateOverview = returnTemplateOverview(queryParams);

    const isTemplate = queryParams["template"]?.toString() ?? "";
    const returnPath = queryParams["return"]?.toString() ?? "";

    const handleStopChange = (value: SingleValue<Journey>, actionMeta: ActionMeta<Journey>) => {
        if (actionMeta.action === "clear") {
            setJourneysSearchInput("");
        }
        if (
            !pageState.inputs.journeys ||
            !pageState.inputs.journeys.some((data) => data?.vehicleJourneyCode === value?.vehicleJourneyCode)
        ) {
            addJourney(value);
        }
        setSelected(null);
    };

    const removeJourneys = (e: SyntheticEvent, index: number) => {
        e.preventDefault();
        if (pageState.inputs.journeys) {
            const journeys = [...pageState.inputs.journeys];
            journeys.splice(index, 1);

            setPageState({
                ...pageState,
                inputs: {
                    ...pageState.inputs,
                    journeys,
                },
                errors: pageState.errors,
            });
        }
    };

    const getJourneyRows = () => {
        if (pageState.inputs.journeys) {
            return sortJourneys(pageState.inputs.journeys).map((journey, i) => ({
                cells: [
                    `${journey.departureTime} ${journey.origin} - ${journey.destination} (${journey.direction})`,
                    <button
                        id={`remove-stop-${journey.vehicleJourneyCode}`}
                        key={`remove-stop-${journey.vehicleJourneyCode}`}
                        className="govuk-link"
                        onClick={(e) => removeJourneys(e, i)}
                    >
                        Remove
                    </button>,
                ],
            }));
        }
        return [];
    };

    const addJourney = (journeyToAdd: SingleValue<Journey>) => {
        const parsed = journeySchema.safeParse(journeyToAdd);

        if (!parsed.success) {
            setPageState({
                ...pageState,
                errors: [
                    ...pageState.errors.filter((err) => !Object.keys(journeysConsequenceSchema.shape).includes(err.id)),
                    ...flattenZodErrors(parsed.error),
                ],
            });
        } else {
            if (journeyToAdd) {
                setPageState({
                    ...pageState,
                    inputs: {
                        ...pageState.inputs,
                        journeys: sortJourneys([...(pageState.inputs.journeys ?? []), journeyToAdd]),
                    },
                    errors: [
                        ...pageState.errors.filter(
                            (err) => !Object.keys(journeysConsequenceSchema.shape).includes(err.id),
                        ),
                    ],
                });
            }
        }
    };

    const handleServiceChange = (value: SingleValue<Service>, actionMeta: ActionMeta<Service>) => {
        if (actionMeta.action === "clear") {
            setServicesSearchInput("");
        }
        if (pageState.inputs.services && pageState.inputs.services.length === 1) {
            return;
        }
        setSelectedService(value);
        if (!pageState.inputs.services || !pageState.inputs.services.some((data) => data.id === value?.id)) {
            addService(value);
        }
    };

    const addService = (serviceToAdd: SingleValue<Service>) => {
        if (pageState.inputs.services && pageState.inputs.services.length === 1) {
            return;
        }
        const parsed = serviceSchema.safeParse(serviceToAdd);

        if (!parsed.success) {
            setPageState({
                ...pageState,
                errors: [
                    ...pageState.errors.filter((err) => !Object.keys(journeysConsequenceSchema.shape).includes(err.id)),
                    ...flattenZodErrors(parsed.error),
                ],
            });
        } else {
            if (serviceToAdd) {
                setPageState({
                    ...pageState,
                    inputs: {
                        ...pageState.inputs,
                        services: sortServices([...(pageState.inputs.services ?? []), serviceToAdd]),
                    },
                    errors: [
                        ...pageState.errors.filter(
                            (err) => !Object.keys(journeysConsequenceSchema.shape).includes(err.id),
                        ),
                    ],
                });
            }
        }
    };

    useEffect(() => {
        if (pageState?.inputs?.services && pageState.inputs.services.length === 0) {
            setStopOptions([]);
            setSearchedRoutes([]);
            setSelectedService(null);
            setPageState({
                ...pageState,
                inputs: {
                    ...pageState.inputs,
                    stops: [],
                },
                errors: pageState.errors,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageState?.inputs?.services]);

    useEffect(() => {
        if (pageState.inputs.vehicleMode) {
            const source =
                props.inputs.vehicleMode === pageState.inputs.vehicleMode
                    ? props.consequenceDataSource || props.globalDataSource
                    : props.sessionWithOrg?.mode[pageState.inputs.vehicleMode];

            if (source) {
                getServices(
                    source,
                    pageState.inputs.vehicleMode,
                    props.sessionWithOrg?.adminAreaCodes,
                    props.isOperatorUser,
                    props.operatorUserNocCodes,
                )
                    .then((services) => {
                        setServiceOptionsForDropdown(services);

                        if (vehicleMode !== pageState.inputs.vehicleMode) {
                            setDataSource(source);
                            setPageState({
                                ...pageState,
                                inputs: {
                                    ...pageState.inputs,
                                    services: [],
                                    stops: [],
                                },
                            });
                        }

                        setVehicleMode(pageState.inputs.vehicleMode || null);
                    })
                    .catch(() => setServiceOptionsForDropdown([]));
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageState.inputs.vehicleMode]);

    useEffect(() => {
        if (selectedService) {
            getStops(
                selectedService.dataSource === Datasource.bods ? selectedService.lineId : selectedService.serviceCode,
                selectedService.id,
                selectedService.dataSource,
                pageState.inputs.vehicleMode,
            )
                .then((stops) => setStopOptions(sortAndFilterStops([...stopOptions, ...stops])))
                // eslint-disable-next-line no-console
                .catch(console.error);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedService]);

    const removeService = (e: SyntheticEvent, removedServiceId: number) => {
        e.preventDefault();

        if (pageState?.inputs?.services) {
            const updatedServicesArray = [...pageState.inputs.services].filter(
                (service) => service.id !== removedServiceId,
            );

            setPageState({
                ...pageState,
                inputs: {
                    ...pageState.inputs,
                    services: updatedServicesArray,
                    journeys: [],
                },
                errors: pageState.errors,
            });
        }

        setSearchedRoutes(searchedRoutes.filter((route) => route?.serviceId !== removedServiceId) || []);
        setSelectedService(null);
    };

    const getServiceRows = () => {
        if (pageState.inputs.services) {
            return pageState.inputs.services.map((service) => ({
                cells: [
                    `${service.lineName} - ${service.origin} - ${service.destination} (${service.operatorShortName})`,
                    <button
                        id={`remove-service-${service.id}`}
                        key={`remove-service-${service.id}`}
                        className="govuk-link"
                        onClick={(e) => removeService(e, service.id)}
                    >
                        Remove
                    </button>,
                ],
            }));
        }
        return [];
    };

    return (
        <BaseLayout title={title} description={description}>
            <CsrfForm
                action={`/api/create-consequence-journeys${isTemplate ? "?template=true" : ""}`}
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
                                        "Journeys",
                                        createChangeLink(
                                            "consequence-type",
                                            TYPE_OF_CONSEQUENCE_PAGE_PATH,
                                            pageState.disruptionId || "",
                                            pageState.consequenceIndex ?? 0,
                                            returnToTemplateOverview || !!returnPath,
                                            returnToTemplateOverview ||
                                                returnPath?.includes(DISRUPTION_DETAIL_PAGE_PATH),
                                            !!isTemplate,
                                        ),
                                    ],
                                },
                            ]}
                        />

                        {!!props.consequenceDataSource &&
                            !!props.globalDataSource &&
                            props.consequenceDataSource !== props.globalDataSource &&
                            props.inputs.vehicleMode === pageState.inputs.vehicleMode && (
                                <NotificationBanner
                                    content={`This consequence was created with ${props.consequenceDataSource.toUpperCase()} data and the data source for this impacted mode has since been switched to ${props.globalDataSource.toUpperCase()}. ${props.consequenceDataSource.toUpperCase()} data will continue to be used for this consequence`}
                                    noMaxWidth
                                />
                            )}

                        <Select<JourneysConsequence>
                            inputName="vehicleMode"
                            display="Mode of transport"
                            defaultDisplay="Select mode of transport"
                            selectValues={filterVehicleModes(props.showUnderground)}
                            stateUpdater={stateUpdater}
                            value={pageState?.inputs?.vehicleMode}
                            initialErrors={pageState.errors}
                            displaySize="l"
                        />

                        <SearchSelect<Service>
                            closeMenuOnSelect={false}
                            selected={selectedService}
                            inputName="service"
                            initialErrors={pageState.errors}
                            placeholder="Select services"
                            getOptionLabel={getServiceLabel}
                            options={serviceOptionsForDropdown.filter(
                                (service) => !isSelectedServiceInDropdown(service, pageState.inputs.services ?? []),
                            )}
                            handleChange={handleServiceChange}
                            tableData={pageState?.inputs?.services}
                            getRows={getServiceRows}
                            getOptionValue={(service: Service) => service.id.toString()}
                            display="Services impacted"
                            hint="Services"
                            displaySize="l"
                            inputId="services"
                            isClearable
                            inputValue={servicesSearchInput}
                            setSearchInput={setServicesSearchInput}
                            filterOptions={createFilter(filterConfig)}
                        />

                        {pageState.inputs.services && pageState.inputs.services?.length >= 1 && (
                            <div className="my-3">
                                <button
                                    className="govuk-link"
                                    data-module="govuk-button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setPageState({
                                            ...pageState,
                                            inputs: {
                                                ...pageState.inputs,
                                                services: [],
                                                stops: [],
                                                journeys: [],
                                            },
                                            errors: pageState.errors,
                                        });
                                    }}
                                    disabled={!pageState.inputs.services || pageState.inputs.services?.length === 0}
                                >
                                    <p className="text-govBlue govuk-body-m">Remove all services</p>
                                </button>
                            </div>
                        )}
                        <br />

                        <SearchSelect<Journey>
                            closeMenuOnSelect={false}
                            selected={selected}
                            inputName="journey"
                            initialErrors={pageState.errors}
                            placeholder="Select journeys"
                            getOptionLabel={getJourneyLabel}
                            handleChange={handleStopChange}
                            tableData={pageState.inputs.journeys}
                            getRows={getJourneyRows}
                            getOptionValue={getJourneyValue}
                            display=""
                            hint="Journeys"
                            displaySize="l"
                            inputId="journeys"
                            options={sortJourneys(journeyOptions).filter(
                                (journey) => !isSelectedJourneyInDropdown(journey, pageState.inputs.journeys ?? []),
                            )}
                            inputValue={journeysSearchInput}
                            setSearchInput={setJourneysSearchInput}
                        />

                        {pageState.inputs.journeys && pageState.inputs.journeys?.length >= 1 && (
                            <div className="my-3">
                                <button
                                    className="govuk-link"
                                    data-module="govuk-button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setPageState({
                                            ...pageState,
                                            inputs: {
                                                ...pageState.inputs,
                                                journeys: [],
                                            },
                                            errors: pageState.errors,
                                        });
                                    }}
                                    disabled={!pageState.inputs.journeys || pageState.inputs.journeys?.length === 0}
                                >
                                    <p className="text-govBlue govuk-body-m">Remove all journeys</p>
                                </button>
                            </div>
                        )}
                        <br />

                        <Map
                            initialViewState={{
                                longitude: -1.7407941662903283,
                                latitude: 53.05975866591879,
                                zoom: 4.5,
                            }}
                            style={{ width: "100%", height: "40vh", marginBottom: 20 }}
                            mapStyle="mapbox://styles/mapbox/streets-v12"
                            stopOptions={stopOptions}
                            searchedRoutes={searchedRoutes}
                            setSearchedRoutes={setSearchedRoutes}
                            serviceOptionsForDropdown={serviceOptionsForDropdown}
                            setServiceOptionsForDropdown={setServiceOptionsForDropdown}
                            dataSource={dataSource}
                            showUnderground={props.showUnderground}
                        />

                        <TextInput<JourneysConsequence>
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
                                    props.disruptionDescription
                                        ? stateUpdater(props.disruptionDescription, "description")
                                        : "";
                                }}
                            >
                                <p className="text-govBlue govuk-body-m">Copy from disruption description</p>
                            </button>
                        ) : null}

                        <Radios<JourneysConsequence>
                            display="Cancel journeys on journey planners"
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
                            hint="Consequence information to be hidden from journey planners"
                            inputName="removeFromJourneyPlanners"
                            stateUpdater={stateUpdater}
                            value={pageState.inputs["removeFromJourneyPlanners"]}
                            initialErrors={pageState.errors}
                        />

                        <TimeSelector<JourneysConsequence>
                            display="Delay (optional)"
                            displaySize="l"
                            hint="Enter time in minutes"
                            value={pageState.inputs.disruptionDelay}
                            inputName="disruptionDelay"
                            stateUpdater={stateUpdater}
                            initialErrors={pageState.errors}
                            placeholderValue=""
                        />

                        <Select<JourneysConsequence>
                            inputName="disruptionSeverity"
                            display="Disruption severity"
                            displaySize="l"
                            defaultDisplay="Select severity"
                            selectValues={DISRUPTION_SEVERITIES}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.disruptionSeverity}
                            initialErrors={pageState.errors}
                        />

                        <input type="hidden" name="consequenceType" value="services" />
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
                                        ? `${returnPath}/${pageState.disruptionId || ""}?template=true`
                                        : `${returnPath}/${pageState.disruptionId || ""}`
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
                                formAction={`/api${CREATE_CONSEQUENCE_SERVICES_PATH}?draft=true`}
                            >
                                Save as draft
                            </button>
                        )}
                        <DeleteDisruptionButton
                            disruptionId={props.disruptionId}
                            csrfToken={props.csrfToken}
                            buttonClasses="mt-8"
                            isTemplate={isTemplate}
                            returnPath={returnPath}
                        />

                        {consequenceCount < (props.isEdit ? MAX_CONSEQUENCES : MAX_CONSEQUENCES - 1) && (
                            <button
                                formAction={`/api/create-consequence-journeys${
                                    isTemplate
                                        ? "?template=true&addAnotherConsequence=true"
                                        : "?addAnotherConsequence=true"
                                }`}
                                className="govuk-button mt-8 ml-5 govuk-button--secondary"
                                data-module="govuk-button"
                            >
                                Add another consequence
                            </button>
                        )}
                    </div>
                </>
            </CsrfForm>
        </BaseLayout>
    );
};

export const getServerSideProps = async (
    ctx: NextPageContext,
): Promise<{ props: CreateConsequenceJourneysProps } | { redirect: Redirect } | void> => {
    const cookies = parseCookies(ctx);
    const errorCookie = cookies[COOKIES_CONSEQUENCE_SERVICES_ERRORS];

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
        return {
            redirect: {
                destination: `${DISRUPTION_NOT_FOUND_ERROR_PAGE}${!!ctx.query?.template ? "?template=true" : ""}`,
                statusCode: 302,
            },
        };
    }

    const index = ctx.query.consequenceIndex ? Number(ctx.query.consequenceIndex) : 0;

    const consequence = disruption?.consequences?.find((c) => c.consequenceIndex === index);

    const pageState = getPageState<JourneysConsequence>(
        errorCookie,
        journeysConsequenceSchema,
        disruption.disruptionId,
        consequence && isJourneysConsequence(consequence) ? consequence : undefined,
    );

    let stops: Stop[] = [];

    let consequenceDataSource: Datasource | null = null;
    let globalDataSource: Datasource | null = null;

    if (pageState.inputs.vehicleMode) {
        globalDataSource = session.mode[pageState.inputs.vehicleMode];

        const serviceList = await getServices(globalDataSource, pageState.inputs.vehicleMode, session.adminAreaCodes);

        if (pageState.inputs.serviceRefs) {
            pageState.inputs.services =
                serviceList.filter((service) =>
                    pageState.inputs.serviceRefs?.includes(
                        service.dataSource === Datasource.bods ? service.lineId : service.serviceCode,
                    ),
                ) ?? [];
        }

        if (pageState.inputs.services?.length) {
            consequenceDataSource = pageState.inputs.services[0].dataSource;

            const stopPromises = pageState.inputs.services.map((service) =>
                getStops(
                    service.dataSource === Datasource.bods ? service.lineId : service.serviceCode,
                    service.id,
                    service.dataSource,
                    pageState.inputs.vehicleMode,
                ),
            );
            stops = (await Promise.all(stopPromises)).flat();

            if (pageState.inputs.stopRefs) {
                pageState.inputs.stops =
                    sortAndFilterStops(stops.filter((stop) => pageState.inputs.stopRefs?.includes(stop.atcoCode))) ??
                    [];
            }
        }
    }

    if (ctx.res) destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_SERVICES_ERRORS, ctx.res);

    const operatorUserNocCodes =
        session.isOperatorUser && session.operatorOrgId
            ? await getNocCodesForOperatorOrg(session.orgId, session.operatorOrgId)
            : [];

    return {
        props: {
            ...pageState,
            initialStops: stops,
            consequenceIndex: index,
            consequenceCount: disruption.consequences?.length ?? 0,
            sessionWithOrg: session,
            disruptionDescription: disruption.description || "",
            template: disruption.template?.toString() || "",
            consequenceDataSource,
            globalDataSource,
            isEdit: !!consequence,
            isOperatorUser: session.isOperatorUser,
            operatorUserNocCodes: operatorUserNocCodes,
            showUnderground: session.showUnderground,
        },
    };
};

export default CreateConsequenceJourneys;
