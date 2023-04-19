import { Progress, Severity } from "@create-disruptions-data/shared-ts/enums";
import Link from "next/link";
import { Dispatch, ReactElement, SetStateAction, useEffect, useState } from "react";
import { z } from "zod";
import DateSelector from "../components/form/DateSelector";
import { randomUUID } from "crypto";
import Table from "../components/form/Table";
import Select from "../components/form/Select";
import { BaseLayout } from "../components/layout/Layout";
import PageNumbers from "../components/PageNumbers";
import ServiceSearch from "../components/ServiceSearch";
import { ADMIN_AREA_CODE, API_BASE_URL, DISRUPTION_SEVERITIES, DISRUPTION_STATUSES, VEHICLE_MODES } from "../constants";
import { Service, serviceSchema } from "../schemas/consequence.schema";
import { validitySchema } from "../schemas/create-disruption.schema";
import { getPublishedDisruptionsDataFromDynamo } from "../data/dynamo";
import {
    sortDisruptionsByStartDate,
    splitCamelCaseToString,
    reduceStringWithEllipsis,
    getServiceLabel,
    mapValidityPeriods
} from "../utils";
import { convertDateTimeToFormat, getDate } from "../utils/dates";


const title = "View All Disruptions";
const description = "View All Disruptions page for the Create Transport Disruptions Service";

interface Operator {
    operatorName: string;
    operatorRef: string;
}

export interface TableDisruption {
    id: string;
    summary: string;
    modes: string[];
    validityPeriods: {
        startTime: string;
        endTime: string | null;
    }[];
    severity: string;
    status: string;
    serviceLineRefs: string[];
    operators: Operator[];
}

export interface ViewAllDisruptionsProps {
    disruptions: TableDisruption[];
    services: Service[];
    newDisruptionId: string;
}

interface Filter {
    services: Service[];
    startTime?: string;
    endTime?: string;
    severity?: string;
    status?: string;
    operators: Operator[];
    mode?: string;
}

const formatDisruptionsIntoRows = (disruptions: TableDisruption[], offset: number) => {
    return disruptions.map((disruption, index) => {
        const earliestPeriod: {
            startTime: string;
            endTime: string | null;
        } = disruption.validityPeriods[0];
        const latestPeriod: string | null = disruption.validityPeriods[disruption.validityPeriods.length - 1].endTime;

        return {
            header: (
                <Link className="govuk-link" href="/dashboard" key={disruption.id}>
                    {index + 1 + offset}
                </Link>
            ),
            cells: [
                disruption.summary,
                disruption.modes.map((mode) => splitCamelCaseToString(mode)).join(", ") || "N/A",
                convertDateTimeToFormat(earliestPeriod.startTime),
                !!latestPeriod ? convertDateTimeToFormat(latestPeriod) : "No end time",
                splitCamelCaseToString(disruption.severity),
                splitCamelCaseToString(disruption.status),
            ],
        };
    });
};

const getPageOfDisruptions = (pageNumber: number, disruptions: TableDisruption[]): TableDisruption[] => {
    const startPoint = (pageNumber - 1) * 10;
    const endPoint = pageNumber * 10;
    return disruptions.slice(startPoint, endPoint);
};

export const getWorstSeverity = (severitys: Severity[]): Severity => {
    const severityScoringMap: { [key in Severity]: number } = {
        unknown: 0,
        verySlight: 1,
        slight: 2,
        normal: 3,
        severe: 4,
        verySevere: 5,
    };

    let worstSeverity: Severity = Severity.unknown;

    severitys.forEach((severity) => {
        if (!worstSeverity) {
            worstSeverity = severity;
        } else if (severityScoringMap[worstSeverity] < severityScoringMap[severity]) {
            worstSeverity = severity;
        }
    });

    return worstSeverity;
};

const formatServicesIntoRows = (filter: Filter, setFilter: Dispatch<SetStateAction<Filter>>) => {
    const cells: { cells: (string | JSX.Element)[] }[] = [];

    filter.services.forEach((service) => {
        cells.push({
            cells: [
                getServiceLabel(service),
                <button
                    key={service.id}
                    className="govuk-link"
                    onClick={() => {
                        const { services } = filter;
                        const indexToRemove = services.findIndex((service) => service.id === service.id);
                        services.splice(indexToRemove, 1);
                        setFilter({ ...filter, services });
                    }}
                >
                    Remove
                </button>,
            ],
        });
    });

    return cells;
};

export const applyDateFilters = (disruptions: TableDisruption[], filter: Filter): TableDisruption[] => {
    if (!filter.startTime && !filter.endTime) {
        return disruptions;
    }

    if (filter.startTime && !filter.endTime) {
        const filterStartDate = getDate(filter.startTime);

        return disruptions.filter((disruption) => {
            let periodMatches = false;
            disruption.validityPeriods.forEach((period) => {
                const { startTime, endTime } = period;
                if (!endTime && getDate(startTime).isSameOrBefore(filterStartDate)) {
                    periodMatches = true;
                } else if (endTime && getDate(endTime).isSameOrAfter(filterStartDate)) {
                    periodMatches = true;
                }
            });
            return periodMatches;
        });
    }

    if (!filter.startTime && filter.endTime) {
        const filterEndDate = getDate(filter.endTime);

        return disruptions.filter((disruption) => {
            let periodMatches = false;
            disruption.validityPeriods.forEach((period) => {
                const { startTime, endTime } = period;
                if (!endTime && getDate(startTime).isSameOrBefore(filterEndDate)) {
                    periodMatches = true;
                } else if (endTime && getDate(endTime).isSameOrAfter(filterEndDate)) {
                    periodMatches = true;
                }
            });
            return periodMatches;
        });
    }

    if (filter.startTime && filter.endTime) {
        const filterStartDate = getDate(filter.startTime);
        const filterEndDate = getDate(filter.endTime);

        return disruptions.filter((disruption) => {
            let periodMatches = false;
            disruption.validityPeriods.forEach((period) => {
                const { startTime, endTime } = period;

                if (startTime && endTime) {
                    
                }
            });
            return periodMatches;
        });

    }

    return disruptions;
};

export const filterDisruptions = (disruptions: TableDisruption[], filter: Filter): TableDisruption[] => {
    let disruptionsToDisplay = disruptions;

    if (filter.services.length > 0) {
        disruptionsToDisplay = disruptionsToDisplay.filter((disruption) => {
            const filterServiceRefs = filter.services.map((service) => service.id.toString());
            const disruptionServiceRefs = disruption.serviceLineRefs;
            let showService = false;

            disruptionServiceRefs.forEach((disruptionServiceRef) => {
                if (filterServiceRefs.includes(disruptionServiceRef)) {
                    showService = true;
                }
            });

            return showService;
        });
    }

    if (filter.mode) {
        disruptionsToDisplay = disruptionsToDisplay.filter((disruption) =>
            disruption.modes.includes(filter.mode as string),
        );
    }

    if (filter.severity) {
        disruptionsToDisplay = disruptionsToDisplay.filter((disruption) => disruption.severity === filter.severity);
    }

    if (filter.status) {
        disruptionsToDisplay = disruptionsToDisplay.filter((disruption) => disruption.status === filter.status);
    }

    if (filter.operators.length > 0) {
        const filterOperatorsRefs = filter.operators.map((op) => op.operatorRef);
        disruptionsToDisplay = disruptionsToDisplay.filter((disruption) =>
            disruption.operators.find((operator) => filterOperatorsRefs.includes(operator.operatorRef)),
        );
    }

    disruptionsToDisplay = applyDateFilters(disruptionsToDisplay, filter);

    return disruptionsToDisplay;
}

const useFiltersOnDisruptions = (
    disruptions: TableDisruption[],
    setDisruptionsToDisplay: Dispatch<SetStateAction<TableDisruption[]>>,
    currentPage: number,
    filter: Filter,
    setNumberOfDisruptionsPages: Dispatch<SetStateAction<number>>,
): void => {
    const disruptionsToDisplay = filterDisruptions(disruptions, filter);

    setDisruptionsToDisplay(getPageOfDisruptions(currentPage, disruptionsToDisplay));
    setNumberOfDisruptionsPages(Math.ceil(disruptionsToDisplay.length / 10));
};

const filterIsEmpty = (filter: Filter): boolean =>
    Object.keys(filter).length === 2 && filter.services.length === 0 && filter.operators.length === 0;

const ViewAllDisruptions = ({ disruptions, services, newDisruptionId }: ViewAllDisruptionsProps): ReactElement => {
    const [numberOfDisruptionsPages, setNumberOfDisruptionsPages] = useState<number>(
        Math.ceil(disruptions.length / 10),
    );
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedServices, setSelectedServices] = useState<Service[]>([]);
    const [filter, setFilter] = useState<Filter>({
        services: [],
        operators: [],
    });
    const [showFilters, setShowFilters] = useState(false);
    const [clearButtonClicked, setClearButtonClicked] = useState(false);
    const [disruptionsToDisplay, setDisruptionsToDisplay] = useState(getPageOfDisruptions(currentPage, disruptions));

    const handleFilterUpdate = (
        filter: Filter,
        setFilter: Dispatch<SetStateAction<Filter>>,
        key: keyof Filter,
        value: string,
    ) => {
        setFilter({ ...filter, [key]: value });
    };

    useEffect(() => {
        setDisruptionsToDisplay(getPageOfDisruptions(currentPage, disruptions));
    }, [currentPage, disruptions]);

    useEffect(() => {
        setFilter({ ...filter, services: selectedServices });
        useFiltersOnDisruptions(
            disruptions,
            setDisruptionsToDisplay,
            currentPage,
            { ...filter, services: selectedServices },
            setNumberOfDisruptionsPages,
        );
    }, [selectedServices]);

    useEffect(() => {
        if (filterIsEmpty(filter)) {
            setDisruptionsToDisplay(getPageOfDisruptions(currentPage, disruptions));
            setNumberOfDisruptionsPages(Math.ceil(disruptions.length / 10));
        } else {
            useFiltersOnDisruptions(
                disruptions,
                setDisruptionsToDisplay,
                currentPage,
                filter,
                setNumberOfDisruptionsPages,
            );
        }
    }, [filter]);

    return (
        <BaseLayout title={title} description={description}>
            <h1 className="govuk-heading-xl">View all disruptions</h1>
            <div>
               
            <Link
                href={`/create-disruption/${newDisruptionId}`}
                role="button"
                draggable="false"
                className="govuk-button govuk-button--start"
                data-module="govuk-button"
                id="create-new-button"
            >
                Create new disruption
                <svg
                    className="govuk-button__start-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="17.5"
                    height="19"
                    viewBox="0 0 33 40"
                    role="presentation"
                    focusable="false"
                >
                    Create new disruption
                  
                    </svg>
                </Link>
                <button
                    className="govuk-button govuk-button--secondary block"
                    data-module="govuk-button"
                    onClick={() => {
                        if (showFilters) {
                            setShowFilters(false);
                        } else {
                            setShowFilters(true);
                        }
                    }}
                >
                    {showFilters ? "Hide and clear f" : "F"}ilters
                </button>
            </div>

            {showFilters ? (
                <>
                    <ServiceSearch
                        services={services}
                        setSelectedServices={setSelectedServices}
                        selectedServices={selectedServices}
                        reset={clearButtonClicked}
                    />

                    {filter.services.length > 0 ? <Table rows={formatServicesIntoRows(filter, setFilter)} /> : null}

                    <DateSelector
                        display="Start date"
                        hiddenHint="Enter in format DD/MM/YYYY"
                        value=""
                        disabled={false}
                        disablePast={false}
                        inputName="disruptionStartDate"
                        stateUpdater={(value) => {
                            handleFilterUpdate(filter, setFilter, "startTime", value);
                            setClearButtonClicked(false);
                        }}
                        reset={clearButtonClicked}
                        schema={validitySchema.shape.disruptionStartDate}
                        errorOnBlur={false}
                    />
                    <DateSelector
                        display="End date"
                        hiddenHint="Enter in format DD/MM/YYYY"
                        value=""
                        disabled={false}
                        disablePast={false}
                        inputName="disruptionEndDate"
                        stateUpdater={(value) => {
                            handleFilterUpdate(filter, setFilter, "endTime", value);
                            setClearButtonClicked(false);
                        }}
                        reset={clearButtonClicked}
                        schema={validitySchema.shape.disruptionEndDate}
                        errorOnBlur={false}
                    />
                    <Select
                        inputName="severityFilter"
                        display="Severity"
                        value={filter.severity}
                        defaultDisplay="Select a severity"
                        selectValues={DISRUPTION_SEVERITIES.sort((a, b) => a.display.localeCompare(b.display))}
                        stateUpdater={(value) => handleFilterUpdate(filter, setFilter, "severity", value)}
                        width="1/4"
                        updateOnChange
                    />
                    <Select
                        inputName="statusFilter"
                        display="Status"
                        value={filter.status}
                        defaultDisplay="Select a status"
                        selectValues={DISRUPTION_STATUSES.sort((a, b) => a.display.localeCompare(b.display))}
                        stateUpdater={(value) => handleFilterUpdate(filter, setFilter, "status", value)}
                        width="1/4"
                        updateOnChange
                    />
                    <Select
                        inputName="modeFilter"
                        display="Mode"
                        value={filter.mode}
                        defaultDisplay="Select a mode"
                        selectValues={VEHICLE_MODES.sort((a, b) => a.display.localeCompare(b.display))}
                        stateUpdater={(value) => handleFilterUpdate(filter, setFilter, "mode", value)}
                        width="1/4"
                        updateOnChange
                    />
                    <button
                        className="govuk-button govuk-button--secondary mt-2"
                        data-module="govuk-button"
                        onClick={() => {
                            setFilter({ services: [], operators: [] });
                            setDisruptionsToDisplay(getPageOfDisruptions(currentPage, disruptions));
                            setClearButtonClicked(true);
                        }}
                    >
                        Clear filters
                    </button>
                </>
            ) : null}

            <>
                <Table
                    columns={["ID", "Summary", "Modes", "Starts", "Ends", "Severity", "Status"]}
                    rows={formatDisruptionsIntoRows(disruptionsToDisplay, (currentPage - 1) * 10)}
                />
                <PageNumbers
                    numberOfPages={numberOfDisruptionsPages}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                />
            </>
        </BaseLayout>
    );
};

export const getServerSideProps = async (): Promise<{ props: ViewAllDisruptionsProps }> => {
    let services: Service[] = [];
    const searchApiUrl = `${API_BASE_URL}services?adminAreaCodes=${ADMIN_AREA_CODE}`;
    const res = await fetch(searchApiUrl, { method: "GET" });
    const parse = z.array(serviceSchema).safeParse(await res.json());

    if (parse.success) {
        services = parse.data;
    }

    const data = await getPublishedDisruptionsDataFromDynamo();

    if (data) {
        const sortedDisruptions = sortDisruptionsByStartDate(data);
        const shortenedData: TableDisruption[] = sortedDisruptions.map((disruption) => {
            const modes: string[] = [];
            const severitys: Severity[] = [];
            const serviceLineRefs: string[] = [];
            const operators: Operator[] = [];


            if (disruption.consequences) {
                disruption.consequences.forEach((consequence) => {

                    modes.push(consequence.vehicleMode);
                    // severitys.push(consequence.disruptionSeverity);
                    // if (!!consequence.Affects.Networks) {
                    //     modes.push(consequence.Affects.Networks.AffectedNetwork.VehicleMode);
                    // }

                    // if (!!consequence.Affects.Networks?.AffectedNetwork.AffectedLine) {
                    //     consequence.Affects.Networks.AffectedNetwork.AffectedLine.forEach((line) => {
                    //         serviceLineRefs.push(line.LineRef);
                    //         const affectedOperator = line.AffectedOperator;
                    //         operators.push({
                    //             operatorRef: affectedOperator.OperatorRef,
                    //             operatorName: affectedOperator.OperatorName || "",
                    //         });
                    //     });
                    // }
                });
            }

            return {
                modes,
                status: Progress.open,
                severity: getWorstSeverity(severitys),
                serviceLineRefs,
                operators,
                id: disruption.disruptionId,
                summary: reduceStringWithEllipsis(disruption.summary, 95),
                validityPeriods: mapValidityPeriods(disruption),
            };
        });

        return {
            props: {
                disruptions: shortenedData,
                services,
                newDisruptionId: randomUUID(),
            },
        };
    }

    return {
        props: {
            disruptions: [],
            services,
            newDisruptionId: randomUUID(),
        },
    };
};

export default ViewAllDisruptions;
