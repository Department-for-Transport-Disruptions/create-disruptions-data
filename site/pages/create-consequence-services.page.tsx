import { NextPageContext } from "next";
import Link from "next/link";
import { parseCookies } from "nookies";
import { ReactElement, SyntheticEvent, useCallback, useState } from "react";
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
    COOKIES_CONSEQUENCE_SERVICES_ERRORS,
    API_BASE_URL,
    ADMIN_AREA_CODE,
} from "../constants";
import { CreateConsequenceProps, PageState } from "../interfaces";
import {
    StopsConsequence,
    Stop,
    stopsConsequenceSchema,
    stopSchema,
    ServicesConsequence,
    Service,
    serviceSchema,
    servicesConsequenceSchema,
} from "../schemas/consequence.schema";
import { typeOfConsequenceSchema } from "../schemas/type-of-consequence.schema";
import { flattenZodErrors, getDisplayByValue, getPageStateFromCookies } from "../utils";
import { getStateUpdater } from "../utils/formUtils";

const title = "Create Consequence Services";
const description = "Create Consequence Services page for the Create Transport Disruptions Service";

const CreateConsequenceServices = ({
    inputs,
    previousConsequenceInformation,
    services,
}: CreateConsequenceProps<ServicesConsequence>): ReactElement => {
    const [pageState, setPageState] = useState<PageState<Partial<ServicesConsequence>>>(inputs);
    const stateUpdater = getStateUpdater(setPageState, pageState);
    const [selected, setSelected] = useState<SingleValue<Stop>>(null);
    const [selectedService, setSelectedService] = useState<SingleValue<Service>>(null);
    const [stopOptions, setStopOptions] = useState<Stop[]>([]);
    const [selectAll, setSelectAll] = useState<boolean>(true);

    const getOptionLabel = (stop: Stop) => {
        if (stop.commonName && stop.indicator && stop.atcoCode) {
            return `${stop.commonName} ${stop.indicator} ${stop.atcoCode}`;
        } else if (stop.commonName && stop.atcoCode) {
            return `${stop.commonName} ${stop.atcoCode}`;
        } else {
            return "";
        }
    };

    const handleChange = (value: SingleValue<Stop>) => {
        if (!pageState.inputs.stops || !pageState.inputs.stops.some((data) => data.atcoCode === value?.atcoCode)) {
            addStop(value);
        }
        setSelected(null);
    };

    const loadOptions = useCallback(async () => {
        if (selectedService) {
            const searchApiUrl = `${API_BASE_URL}services/${selectedService.id}/stops`;
            const res = await fetch(searchApiUrl, { method: "GET" });
            const data: Stop[] = z.array(stopSchema).parse(await res.json());
            if (data) {
                setStopOptions(data);
                return data;
            }
        }
        return [];
    }, [selectedService]);

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

    const getOptionValue = (stop: Stop) => stop.atcoCode.toString();

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
            if (stopToAdd && selectedService) {
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

    const getServiceLabel = (service: Service) =>
        `${service.lineName} - ${service.origin} - ${service.destination} (${service.operatorShortName})`;

    const getServiceValue = (service: Service) => service.id.toString();

    const handleServiceChange = (value: SingleValue<Service>) => {
        setSelectedService(value);
        if (!pageState.inputs.services || !pageState.inputs.services.some((data) => data.id === value?.id)) {
            addService(value);
        }
    };

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
                    inputs: {
                        ...pageState.inputs,
                        services: [...(pageState.inputs.services ?? []), serviceToAdd].sort((a, b) => {
                            return (
                                a.lineName.localeCompare(b.lineName) ||
                                a.origin.localeCompare(b.origin) ||
                                a.destination.localeCompare(b.destination) ||
                                a.operatorShortName.localeCompare(b.operatorShortName)
                            );
                        }),
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

    const removeService = (e: SyntheticEvent, index: number) => {
        e.preventDefault();
        if (pageState.inputs.services) {
            const services = [...pageState.inputs.services];
            services.splice(index, 1);

            setPageState({
                inputs: {
                    ...pageState.inputs,
                    services,
                },
                errors: pageState.errors,
            });
        }
    };

    const getServiceRows = () => {
        if (pageState.inputs.services) {
            return pageState.inputs.services.map((service, i) => ({
                cells: [
                    `${service.lineName} - ${service.origin} - ${service.destination} (${service.operatorShortName})`,
                    <button
                        id={`remove-service-${i + 1}`}
                        key={`remove-service-${i + 1}`}
                        className="govuk-link"
                        onClick={(e) => removeService(e, i)}
                    >
                        Remove
                    </button>,
                ],
            }));
        }
        return [];
    };

    const selectAllStops = (e: SyntheticEvent) => {
        e.preventDefault();
        const parsed = servicesConsequenceSchema.shape.stops.safeParse(stopOptions);

        if (!selectAll) {
            setPageState({
                inputs: {
                    ...pageState.inputs,
                    stops: [],
                },
                errors: pageState.errors,
            });
        }
        if (!parsed.success) {
            setPageState({
                ...pageState,
                errors: [
                    ...pageState.errors.filter((err) => !Object.keys(stopsConsequenceSchema.shape).includes(err.id)),
                    ...flattenZodErrors(parsed.error),
                ],
            });
        } else {
            if (stopOptions && stopOptions.length > 0 && selectedService && selectAll) {
                setPageState({
                    inputs: {
                        ...pageState.inputs,
                        stops: [...(pageState.inputs.stops ?? []), ...stopOptions].sort((a, b) => {
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
        setSelectAll(!selectAll);
    };

    return (
        <BaseLayout title={title} description={description}>
            <form action="/api/create-consequence-services" method="post">
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

                        <SearchSelect<Service>
                            selected={selectedService}
                            inputName="service"
                            initialErrors={pageState.errors}
                            placeholder="Select services"
                            getOptionLabel={getServiceLabel}
                            options={services}
                            handleChange={handleServiceChange}
                            tableData={pageState.inputs.services}
                            getRows={getServiceRows}
                            getOptionValue={getServiceValue}
                            display="Services impacted"
                            hint="Services"
                            displaySize="l"
                            inputId="services"
                            isClearable
                            isAsync={false}
                        />

                        <button
                            className="govuk-button govuk-button--secondary mt-2"
                            data-module="govuk-button"
                            onClick={selectAllStops}
                        >
                            {!selectAll ? "Unselect all stops" : "Select all stops"}
                        </button>

                        <SearchSelect<Stop>
                            selected={selected}
                            inputName="stop"
                            initialErrors={pageState.errors}
                            placeholder="Select stops"
                            getOptionLabel={getOptionLabel}
                            loadOptions={loadOptions}
                            handleChange={handleChange}
                            tableData={pageState.inputs.stops}
                            getRows={getStopRows}
                            getOptionValue={getOptionValue}
                            display=""
                            hint="Stops"
                            displaySize="l"
                            inputId="stops"
                        />

                        <TextInput<ServicesConsequence>
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
                            schema={stopsConsequenceSchema.shape.removeFromJourneyPlanners}
                        />

                        <TimeSelector<ServicesConsequence>
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

                        <Select<ServicesConsequence>
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

                        <input type="hidden" name="consequenceType" value="services" />
                        <input
                            type="hidden"
                            name="vehicleMode"
                            value={previousConsequenceInformation.modeOfTransport}
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

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: object } | void> => {
    let inputs: PageState<Partial<StopsConsequence>> = {
        errors: [],
        inputs: {},
    };

    let previousConsequenceInformationData = {};

    const cookies = parseCookies(ctx);
    const typeCookie = cookies[COOKIES_CONSEQUENCE_TYPE_INFO];
    const dataCookie = cookies[COOKIES_CONSEQUENCE_INFO];
    const errorCookie = cookies[COOKIES_CONSEQUENCE_SERVICES_ERRORS];

    if (typeCookie) {
        const previousConsequenceInformation = typeOfConsequenceSchema.safeParse(JSON.parse(typeCookie));

        if (previousConsequenceInformation.success) {
            previousConsequenceInformationData = previousConsequenceInformation.data;
        }
    }

    inputs = getPageStateFromCookies<StopsConsequence>(dataCookie, errorCookie, stopsConsequenceSchema);

    let services: Service[] = [];
    const searchApiUrl = `${API_BASE_URL}services?adminCodes=${ADMIN_AREA_CODE}`;
    const res = await fetch(searchApiUrl, { method: "GET" });
    const data: Service[] = z.array(serviceSchema).parse(await res.json());
    if (data) {
        services = data;
    }

    return {
        props: { inputs: inputs, previousConsequenceInformation: previousConsequenceInformationData, services },
    };
};

export default CreateConsequenceServices;
