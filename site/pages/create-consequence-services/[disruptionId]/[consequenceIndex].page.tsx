import { Routes, Service, ServicesConsequence, Stop } from "@create-disruptions-data/shared-ts/disruptionTypes";
import {
    MAX_CONSEQUENCES,
    serviceSchema,
    servicesConsequenceSchema,
    stopSchema,
} from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { Datasource, Modes, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { NextPageContext, Redirect } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { ReactElement, SyntheticEvent, useEffect, useState } from "react";
import { createFilter, SingleValue } from "react-select";
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
import Map from "../../../components/map/ServicesMap";
import { createChangeLink } from "../../../components/ReviewConsequenceTable";
import {
    COOKIES_CONSEQUENCE_SERVICES_ERRORS,
    CREATE_CONSEQUENCE_SERVICES_PATH,
    DISRUPTION_DETAIL_PAGE_PATH,
    DISRUPTION_NOT_FOUND_ERROR_PAGE,
    DISRUPTION_SEVERITIES,
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
    VEHICLE_MODES,
} from "../../../constants";
import { getDisruptionById } from "../../../data/dynamo";
import { fetchServiceRoutes, fetchServices, fetchServicesByStops, fetchServiceStops } from "../../../data/refDataApi";
import { CreateConsequenceProps, PageState } from "../../../interfaces";
import { flattenZodErrors, getServiceLabel, isServicesConsequence, sortServices } from "../../../utils";
import { destroyCookieOnResponseObject, getPageState } from "../../../utils/apiUtils";
import { getSessionWithOrgDetail } from "../../../utils/apiUtils/auth";
import {
    filterServices,
    getStateUpdater,
    getStopLabel,
    getStopValue,
    isSelectedServiceInDropdown,
    isSelectedStopInDropdown,
    returnTemplateOverview,
    showCancelButton,
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

const fetchStops = async (
    serviceId: number,
    vehicleMode?: VehicleMode | Modes,
    dataSource?: Datasource,
): Promise<Stop[]> => {
    if (serviceId) {
        const stopsData = await fetchServiceStops({
            serviceId,
            modes: vehicleMode === VehicleMode.tram ? "tram, metro" : vehicleMode,
            ...(vehicleMode === VehicleMode.bus ? { busStopTypes: "MKD,CUS" } : {}),
            ...(vehicleMode === VehicleMode.bus
                ? { stopTypes: "BCT" }
                : vehicleMode === VehicleMode.tram || vehicleMode === Modes.metro
                ? { stopTypes: "MET, PLT" }
                : vehicleMode === Modes.ferry || vehicleMode === VehicleMode.ferryService
                ? { stopTypes: "FER, FBT" }
                : { stopTypes: "undefined" }),
            dataSource: dataSource || Datasource.bods,
        });

        if (stopsData) {
            return sortAndFilterStops(
                stopsData.map((stop) => ({
                    ...stop,
                    ...(serviceId && { serviceIds: [serviceId] }),
                })),
            );
        }
    }

    return [];
};

const removeServiceForStop = (stop: Stop, removedServiceId: number) =>
    stop.serviceIds?.includes(removedServiceId)
        ? { ...stop, serviceIds: stop.serviceIds.filter((id) => id !== removedServiceId) }
        : stop;

const removeStopsWithNoServices = (stop: Stop) => stop.serviceIds?.length !== 0;

const filterStopsWithoutServices = (stops: Stop[], removedServiceId: number) =>
    stops.map((stop) => removeServiceForStop(stop, removedServiceId)).filter(removeStopsWithNoServices);

export interface CreateConsequenceServicesProps
    extends PageState<Partial<ServicesConsequence>>,
        CreateConsequenceProps {
    consequenceDataSource: Datasource | null;
    globalDataSource: Datasource | null;
}

const CreateConsequenceServices = (props: CreateConsequenceServicesProps): ReactElement => {
    const [pageState, setPageState] = useState<PageState<Partial<ServicesConsequence>>>(props);
    const stateUpdater = getStateUpdater(setPageState, pageState);
    const [selected, setSelected] = useState<SingleValue<Stop>>(null);
    const [selectedService, setSelectedService] = useState<SingleValue<Service>>(null);
    const [stopOptions, setStopOptions] = useState<Stop[]>(props.initialStops || []);
    const [servicesSearchInput, setServicesSearchInput] = useState<string>("");
    const [stopsSearchInput, setStopsSearchInput] = useState<string>("");
    const [searched, setSearchedOptions] = useState<Partial<(Routes & { serviceId: number })[]>>([]);
    const [servicesRecords, setServicesRecords] = useState<Service[]>([]);
    const [dataSource, setDataSource] = useState<Datasource>(props.consequenceDataSource || Datasource.bods);
    const [vehicleMode, setVehicleMode] = useState<VehicleMode | null>(props.inputs.vehicleMode || null);

    const { consequenceCount = 0 } = props;

    useEffect(() => {
        const loadOptions = async () => {
            if (selectedService) {
                const vehicleMode = pageState?.inputs?.vehicleMode || ("" as Modes | VehicleMode);
                const serviceRoutesData = await fetchServiceRoutes({
                    serviceId: selectedService.id,
                    modes: vehicleMode === VehicleMode.tram ? "tram, metro" : vehicleMode,
                    ...(vehicleMode === VehicleMode.bus ? { busStopTypes: "MKD,CUS" } : {}),
                    ...(vehicleMode === VehicleMode.bus
                        ? { stopTypes: "BCT" }
                        : vehicleMode === VehicleMode.tram || vehicleMode === Modes.metro
                        ? { stopTypes: "MET, PLT" }
                        : vehicleMode === Modes.ferry || vehicleMode === VehicleMode.ferryService
                        ? { stopTypes: "FER, FBT" }
                        : { stopTypes: "undefined" }),
                });

                if (serviceRoutesData) {
                    const notSelected =
                        searched.length > 0
                            ? !searched.map((service) => service?.serviceId).includes(selectedService.id)
                            : true;
                    if (notSelected)
                        setSearchedOptions([...searched, { ...serviceRoutesData, serviceId: selectedService.id }]);
                } else {
                    setSearchedOptions([]);
                }
            }
        };

        loadOptions()
            // eslint-disable-next-line no-console
            .catch(console.error);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedService]);

    const queryParams = useRouter().query;
    const displayCancelButton = showCancelButton(queryParams);

    const returnToTemplateOverview = returnTemplateOverview(queryParams);

    const isTemplate = queryParams["template"]?.toString() ?? "";
    const returnPath = queryParams["return"]?.toString() ?? "";

    const handleStopChange = async (value: SingleValue<Stop>) => {
        if (!pageState.inputs.stops || !pageState.inputs.stops.some((data) => data.atcoCode === value?.atcoCode)) {
            await addStop(value);
        }
        setSelected(null);
    };

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
            return pageState.inputs.stops
                .filter((value, index, self) => index === self.findIndex((s) => s.atcoCode === value.atcoCode))
                .map((stop, i) => ({
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

    const addStop = async (stopToAdd: SingleValue<Stop>) => {
        const parsed = stopSchema.safeParse(stopToAdd);

        if (!parsed.success) {
            setPageState({
                ...pageState,
                errors: [
                    ...pageState.errors.filter((err) => !Object.keys(servicesConsequenceSchema.shape).includes(err.id)),
                    ...flattenZodErrors(parsed.error),
                ],
            });
        } else {
            if (stopToAdd) {
                const servicesForGivenStop = await fetchServicesByStops({
                    atcoCodes: [stopToAdd.atcoCode],
                    includeRoutes: true,
                    dataSource: dataSource,
                });

                stopToAdd["serviceIds"] = servicesForGivenStop.map((service) => service.id);

                const servicesRoutesForGivenStop = servicesForGivenStop?.map((service) => {
                    return {
                        inbound: service.routes.inbound,
                        outbound: service.routes.outbound,
                        serviceId: service.id,
                    };
                });

                const servicesRoutesForMap = [...searched, ...servicesRoutesForGivenStop].filter(
                    (value, index, self) =>
                        index === self.findIndex((service) => service?.serviceId === value?.serviceId),
                );

                const stopsForServicesRoutes = (
                    await Promise.all(
                        servicesRoutesForMap.map(async (service) => {
                            if (service) {
                                return fetchStops(service.serviceId, pageState.inputs.vehicleMode, dataSource);
                            }
                            return [];
                        }),
                    )
                ).flat();

                const stopsForMap = [...stopOptions, ...stopsForServicesRoutes].filter(
                    (value, index, self) => index === self.findIndex((stop) => stop?.atcoCode === value?.atcoCode),
                );

                setSearchedOptions(servicesRoutesForMap);
                setStopOptions(stopsForMap);

                setPageState({
                    ...pageState,
                    inputs: {
                        ...pageState.inputs,
                        stops: sortAndFilterStops([...(pageState.inputs.stops ?? []), stopToAdd]),
                        services: filterServices([...(pageState.inputs.services ?? []), ...servicesForGivenStop]),
                    },
                    errors: [
                        ...pageState.errors.filter(
                            (err) => !Object.keys(servicesConsequenceSchema.shape).includes(err.id),
                        ),
                    ],
                });
            }
        }
    };

    const handleServiceChange = (value: SingleValue<Service>) => {
        setSelectedService(value);
        if (!pageState.inputs.services || !pageState.inputs.services.some((data) => data.id === value?.id)) {
            addService(value);
        }
    };

    useEffect(() => {
        if (selectedService) {
            fetchStops(selectedService.id, pageState.inputs.vehicleMode, selectedService.dataSource)
                .then((stops) => setStopOptions(sortAndFilterStops([...stopOptions, ...stops])))
                // eslint-disable-next-line no-console
                .catch(console.error);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedService]);

    const addService = (serviceToAdd: SingleValue<Service>) => {
        const parsed = serviceSchema.safeParse(serviceToAdd);

        if (!parsed.success) {
            setPageState({
                ...pageState,
                errors: [
                    ...pageState.errors.filter((err) => !Object.keys(servicesConsequenceSchema.shape).includes(err.id)),
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
                            (err) => !Object.keys(servicesConsequenceSchema.shape).includes(err.id),
                        ),
                    ],
                });
            }
        }
    };

    useEffect(() => {
        if (pageState?.inputs?.services && pageState.inputs.services.length === 0) {
            setStopOptions([]);
            setSearchedOptions([]);
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

    const fetchData = async (source: Datasource, vehicleMode: string) => {
        let mode: Modes[] = [];
        if (vehicleMode === VehicleMode.ferryService.toString()) {
            mode = [Modes.ferry];
        } else if (vehicleMode === VehicleMode.tram.toString()) {
            mode = [Modes.tram, Modes.metro];
        } else {
            mode = [vehicleMode as Modes];
        }

        const serviceData = await fetchServices({
            adminAreaCodes: props.sessionWithOrg?.adminAreaCodes ?? ["undefined"],
            dataSource: source,
            modes: mode,
        });

        const filteredData = filterServices(serviceData);

        setServicesRecords(filteredData);
    };

    useEffect(() => {
        if (pageState.inputs.vehicleMode) {
            const source =
                props.inputs.vehicleMode === pageState.inputs.vehicleMode
                    ? props.consequenceDataSource
                    : props.sessionWithOrg?.mode[pageState.inputs.vehicleMode];

            if (source) {
                fetchData(source, pageState.inputs.vehicleMode)
                    .then(() => {
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
                    .catch(() => setServicesRecords([]));
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageState.inputs.vehicleMode]);

    const removeService = (e: SyntheticEvent, removedServiceId: number) => {
        e.preventDefault();

        if (pageState?.inputs?.services) {
            const updatedServicesArray = [...pageState.inputs.services].filter(
                (service) => service.id !== removedServiceId,
            );

            const filteredStopOptions = filterStopsWithoutServices(stopOptions, removedServiceId);
            const filteredSelectedStops = filterStopsWithoutServices(pageState.inputs.stops ?? [], removedServiceId);

            setPageState({
                ...pageState,
                inputs: {
                    ...pageState.inputs,
                    stops: filteredSelectedStops,
                    services: updatedServicesArray,
                },
                errors: pageState.errors,
            });

            setStopOptions(sortAndFilterStops(filteredStopOptions));
        }

        setSearchedOptions(searched.filter((route) => route?.serviceId !== removedServiceId) || []);
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
                action={`/api/create-consequence-services${isTemplate ? "?template=true" : ""}`}
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
                                        "Services",
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

                        <Select<ServicesConsequence>
                            inputName="vehicleMode"
                            display="Mode of transport"
                            defaultDisplay="Select mode of transport"
                            selectValues={VEHICLE_MODES}
                            stateUpdater={stateUpdater}
                            value={pageState?.inputs?.vehicleMode}
                            initialErrors={pageState.errors}
                            displaySize="l"
                        />

                        <SearchSelect<Service>
                            selected={selectedService}
                            inputName="service"
                            initialErrors={pageState.errors}
                            placeholder="Select services"
                            getOptionLabel={getServiceLabel}
                            options={servicesRecords.filter(
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

                        <SearchSelect<Stop>
                            selected={selected}
                            inputName="stop"
                            initialErrors={pageState.errors}
                            placeholder="Select stops"
                            getOptionLabel={getStopLabel}
                            handleChange={handleStopChange}
                            tableData={pageState.inputs.stops}
                            getRows={getStopRows}
                            getOptionValue={getStopValue}
                            display=""
                            hint="Stops"
                            displaySize="l"
                            inputId="stops"
                            options={stopOptions.filter(
                                (stop) => !isSelectedStopInDropdown(stop, pageState.inputs.stops ?? []),
                            )}
                            inputValue={stopsSearchInput}
                            setSearchInput={setStopsSearchInput}
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
                            stateUpdater={setPageState}
                            state={pageState}
                            searchedRoutes={searched}
                            showSelectAllButton
                            services={servicesRecords}
                            dataSource={dataSource}
                        />

                        <TextInput<ServicesConsequence>
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

                        <Radios<ServicesConsequence>
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

                        <TimeSelector<ServicesConsequence>
                            display="Delay (optional)"
                            displaySize="l"
                            hint="Enter time in minutes"
                            value={pageState.inputs.disruptionDelay}
                            inputName="disruptionDelay"
                            stateUpdater={stateUpdater}
                            initialErrors={pageState.errors}
                            placeholderValue=""
                        />

                        <Select<ServicesConsequence>
                            inputName="disruptionSeverity"
                            display="Disruption severity"
                            displaySize="l"
                            defaultDisplay="Select severity"
                            selectValues={DISRUPTION_SEVERITIES}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.disruptionSeverity}
                            initialErrors={pageState.errors}
                        />

                        <Radios<ServicesConsequence>
                            display="Direction of disruption"
                            displaySize="l"
                            radioDetail={[
                                {
                                    value: "allDirections",
                                    display: "All directions",
                                    default: true,
                                },
                                {
                                    value: "inbound",
                                    display: "Inbound",
                                },
                                {
                                    value: "outbound",
                                    display: "Outbound",
                                },
                            ]}
                            inputName="disruptionDirection"
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.disruptionDirection}
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
                                formAction={`/api/create-consequence-services${
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
): Promise<{ props: CreateConsequenceServicesProps } | { redirect: Redirect } | void> => {
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

    const pageState = getPageState<ServicesConsequence>(
        errorCookie,
        servicesConsequenceSchema,
        disruption.disruptionId,
        consequence && isServicesConsequence(consequence) ? consequence : undefined,
    );

    let stops: Stop[] = [];

    let consequenceDataSource: Datasource | null = null;
    let globalDataSource: Datasource | null = null;

    if (pageState.inputs.vehicleMode && pageState.inputs.services) {
        globalDataSource = session.mode[pageState.inputs.vehicleMode];

        consequenceDataSource = pageState.inputs.services[0].dataSource;

        const stopPromises = pageState.inputs.services.map((service) =>
            fetchStops(service.id, pageState.inputs.vehicleMode, service.dataSource),
        );
        stops = (await Promise.all(stopPromises)).flat();
    }

    if (ctx.res) destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_SERVICES_ERRORS, ctx.res);

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
        },
    };
};

export default CreateConsequenceServices;
