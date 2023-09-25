import { Service, ServicesConsequence, Stop } from "@create-disruptions-data/shared-ts/disruptionTypes";
import {
    serviceSchema,
    servicesConsequenceSchema,
    stopSchema,
} from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { Datasource, Modes, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { NextPageContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { ReactElement, SyntheticEvent, useEffect, useState } from "react";
import { SingleValue, createFilter } from "react-select";
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
import Map from "../../../components/map/ServicesMap";
import { createChangeLink } from "../../../components/ReviewConsequenceTable";
import {
    DISRUPTION_SEVERITIES,
    VEHICLE_MODES,
    COOKIES_CONSEQUENCE_SERVICES_ERRORS,
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
    CREATE_CONSEQUENCE_SERVICES_PATH,
    DISRUPTION_DETAIL_PAGE_PATH,
} from "../../../constants";
import { getDisruptionById } from "../../../data/dynamo";
import { fetchServiceRoutes, fetchServiceStops, fetchServices } from "../../../data/refDataApi";
import { CreateConsequenceProps, PageState } from "../../../interfaces";
import { Routes } from "../../../schemas/consequence.schema";
import { ModeType } from "../../../schemas/organisation.schema";
import { flattenZodErrors, getServiceLabel, isServicesConsequence, sortServices } from "../../../utils";
import { destroyCookieOnResponseObject, getPageState } from "../../../utils/apiUtils";
import { getSessionWithOrgDetail } from "../../../utils/apiUtils/auth";
import {
    filterServices,
    getStateUpdater,
    getStopLabel,
    getStopValue,
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

export interface CreateConsequenceServicesProps
    extends PageState<Partial<ServicesConsequence>>,
        CreateConsequenceProps {}

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
    const [dataSource, setDataSource] = useState<Datasource>(Datasource.bods);

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

    const isTemplate = (queryParams["template"] as string) || "";

    const handleStopChange = (value: SingleValue<Stop>) => {
        if (!pageState.inputs.stops || !pageState.inputs.stops.some((data) => data.atcoCode === value?.atcoCode)) {
            addStop(value);
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

    const addStop = (stopToAdd: SingleValue<Stop>) => {
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
                setPageState({
                    ...pageState,
                    inputs: {
                        ...pageState.inputs,
                        stops: sortAndFilterStops([...(pageState.inputs.stops ?? []), stopToAdd]),
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
            fetchStops(selectedService.id, pageState.inputs.vehicleMode, dataSource)
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
        }
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
        const source = props.sessionWithOrg?.mode[pageState?.inputs?.vehicleMode as keyof ModeType];

        if (source && pageState?.inputs?.vehicleMode) {
            fetchData(source, pageState.inputs.vehicleMode)
                .then(() => {
                    if (dataSource !== source) {
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
                })
                .catch(() => setServicesRecords([]));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageState?.inputs?.vehicleMode]);

    const findStopsNotToRemove = (stop: Stop, removedServiceId: number, services: Service[]) => {
        const selectedServiceIds = services.map((s) => s.id);

        return stop.serviceIds?.some((id) => (id === removedServiceId ? false : selectedServiceIds.includes(id)));
    };

    const removeService = (e: SyntheticEvent, serviceId: number) => {
        e.preventDefault();

        if (pageState?.inputs?.services) {
            const newServices = [...pageState.inputs.services].filter((service) => service.id !== serviceId);

            setPageState({
                ...pageState,
                inputs: {
                    ...pageState.inputs,
                    ...(pageState.inputs.stops && {
                        stops: [...pageState.inputs.stops].filter((stop) =>
                            findStopsNotToRemove(stop, serviceId, newServices),
                        ),
                    }),
                    services: newServices,
                },
                errors: pageState.errors,
            });

            setStopOptions(stopOptions.filter((stop) => findStopsNotToRemove(stop, serviceId, newServices)));
        }

        setSearchedOptions(searched.filter((route) => route?.serviceId !== serviceId) || []);
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
                                            returnToTemplateOverview || !!queryParams["return"],
                                            returnToTemplateOverview ||
                                                queryParams["return"]?.includes(DISRUPTION_DETAIL_PAGE_PATH),
                                            !!isTemplate,
                                        ),
                                    ],
                                },
                            ]}
                        />

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
                            options={servicesRecords}
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
                            options={stopOptions}
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
                        />

                        {(props.consequenceIndex || 0) <= 10 && (
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
): Promise<{ props: CreateConsequenceServicesProps } | void> => {
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
        throw new Error("No disruption found for operator consequence page");
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

    if (pageState?.inputs?.services) {
        const stopPromises = pageState.inputs.services.map((service) =>
            fetchStops(service.id, pageState.inputs.vehicleMode),
        );
        stops = (await Promise.all(stopPromises)).flat();
    }

    if (ctx.res) destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_SERVICES_ERRORS, ctx.res);

    return {
        props: {
            ...pageState,
            initialStops: stops,
            consequenceIndex: index,
            sessionWithOrg: session,
            disruptionDescription: disruption.description || "",
            template: disruption.template?.toString() || "",
        },
    };
};

export default CreateConsequenceServices;
