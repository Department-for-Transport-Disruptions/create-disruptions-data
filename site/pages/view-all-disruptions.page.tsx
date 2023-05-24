import { Progress, PublishStatus, Severity } from "@create-disruptions-data/shared-ts/enums";
import { NextPageContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { Dispatch, ReactElement, SetStateAction, useEffect, useState } from "react";
import { z } from "zod";
import { randomUUID } from "crypto";
import DateSelector from "../components/form/DateSelector";
import Select from "../components/form/Select";
import Table from "../components/form/Table";
import { BaseLayout } from "../components/layout/Layout";
import OperatorSearch from "../components/OperatorSearch";
import PageNumbers from "../components/PageNumbers";
import ServiceSearch from "../components/ServiceSearch";
import {
    DISRUPTION_DETAIL_PAGE_PATH,
    DISRUPTION_SEVERITIES,
    DISRUPTION_STATUSES,
    REVIEW_DISRUPTION_PAGE_PATH,
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
    VEHICLE_MODES,
    VIEW_ALL_DISRUPTIONS_PAGE_PATH,
} from "../constants";
import { getDisruptionsDataFromDynamo } from "../data/dynamo";
import { fetchOperators, fetchServices } from "../data/refDataApi";
import { Operator, Service } from "../schemas/consequence.schema";
import { validitySchema } from "../schemas/create-disruption.schema";
import {
    sortDisruptionsByStartDate,
    splitCamelCaseToString,
    reduceStringWithEllipsis,
    getServiceLabel,
    mapValidityPeriods,
    getDisplayByValue,
    sortServices,
    SortedDisruption,
    getSortedDisruptionFinalEndDate,
} from "../utils";
import { getSessionWithOrgDetail } from "../utils/apiUtils/auth";
import {
    convertDateTimeToFormat,
    filterDatePeriodMatchesDisruptionDatePeriod,
    getDate,
    getFormattedDate,
    dateIsSameOrBeforeSecondDate,
} from "../utils/dates";

const title = "View All Disruptions";
const description = "View All Disruptions page for the Create Transport Disruptions Service";

interface DisruptionOperator {
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
    serviceIds: string[];
    operators: DisruptionOperator[];
    consequenceLength?: number;
}

export interface ViewAllDisruptionsProps {
    disruptions: TableDisruption[];
    services: Service[];
    newDisruptionId: string;
    operators: Operator[];
}

export interface Filter {
    services: Service[];
    period?: {
        startTime: string;
        endTime: string;
    };
    severity?: string;
    status?: string;
    operators: DisruptionOperator[];
    mode?: string;
    searchText?: string;
}

export const getDisruptionStatus = (disruption: SortedDisruption): Progress => {
    if (disruption.publishStatus === "DRAFT") {
        return Progress.draft;
    }

    if (
        disruption.publishStatus === PublishStatus.editPendingApproval ||
        disruption.publishStatus === PublishStatus.pendingAndEditing
    ) {
        return Progress.pendingApproval;
    }

    if (!disruption.validity) {
        return Progress.closed;
    }

    if (disruption.publishStatus === PublishStatus.pendingApproval) {
        return Progress.pendingApproval;
    }

    const today = getDate();
    const disruptionEndDate = getSortedDisruptionFinalEndDate(disruption);

    if (!!disruptionEndDate && dateIsSameOrBeforeSecondDate(disruptionEndDate, today)) {
        if (disruptionEndDate.isBefore(today)) {
            return Progress.closed;
        } else {
            return Progress.closing;
        }
    }

    return Progress.open;
};

const formatDisruptionsIntoRows = (disruptions: TableDisruption[], offset: number) => {
    return disruptions.map((disruption, index) => {
        const earliestPeriod: {
            startTime: string;
            endTime: string | null;
        } = disruption.validityPeriods[0];
        const latestPeriod: string | null = disruption.validityPeriods[disruption.validityPeriods.length - 1].endTime;

        return {
            header: (
                <Link
                    className="govuk-link"
                    href={
                        disruption.status === Progress.draft
                            ? disruption.consequenceLength && disruption.consequenceLength > 0
                                ? {
                                      pathname: `${REVIEW_DISRUPTION_PAGE_PATH}/${disruption.id}`,
                                      query: { return: VIEW_ALL_DISRUPTIONS_PAGE_PATH },
                                  }
                                : {
                                      pathname: `${TYPE_OF_CONSEQUENCE_PAGE_PATH}/${disruption.id}/0`,
                                      query: { return: VIEW_ALL_DISRUPTIONS_PAGE_PATH },
                                  }
                            : {
                                  pathname: `${DISRUPTION_DETAIL_PAGE_PATH}/${disruption.id}`,
                                  query: { return: VIEW_ALL_DISRUPTIONS_PAGE_PATH },
                              }
                    }
                    key={disruption.id}
                >
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

const applyDateFilters = (
    disruptions: TableDisruption[],
    period: {
        startTime: string;
        endTime: string;
    },
): TableDisruption[] => {
    return disruptions.filter((disruption) =>
        disruption.validityPeriods.some((valPeriod) => {
            const { startTime, endTime } = valPeriod;

            const periodStartDate = getDate(startTime);
            const periodEndDate = endTime ? getDate(endTime) : undefined;

            return filterDatePeriodMatchesDisruptionDatePeriod(
                getFormattedDate(period.startTime),
                getFormattedDate(period.endTime),
                periodStartDate,
                periodEndDate,
            );
        }),
    );
};

export const filterDisruptions = (disruptions: TableDisruption[], filter: Filter): TableDisruption[] => {
    let disruptionsToDisplay = disruptions;

    disruptionsToDisplay = disruptionsToDisplay.filter((disruption) => {
        if (filter.services.length > 0) {
            const filterServiceRefs = filter.services.map((service) => service.id.toString());
            const disruptionServiceRefs = disruption.serviceIds;
            let showService = false;

            disruptionServiceRefs.forEach((disruptionServiceRef) => {
                if (filterServiceRefs.includes(disruptionServiceRef)) {
                    showService = true;
                }
            });

            if (!showService) {
                return false;
            }
        }

        if (filter.mode) {
            const swappedMode = getDisplayByValue(VEHICLE_MODES, filter.mode);

            if (!swappedMode || !disruption.modes.includes(swappedMode)) {
                return false;
            }
        }

        if (filter.severity && disruption.severity !== filter.severity) {
            return false;
        }

        if (filter.status && disruption.status !== filter.status) {
            return false;
        }

        if (filter.operators.length > 0) {
            const filterOperatorsRefs = filter.operators.map((op) => op.operatorRef);

            if (!disruption.operators.some((operator) => filterOperatorsRefs.includes(operator.operatorRef))) {
                return false;
            }
        }

        if (filter.searchText && filter.searchText.length > 2) {
            return disruption.summary.toLowerCase().includes(filter.searchText.toLowerCase());
        }

        return true;
    });

    if (filter.period) {
        disruptionsToDisplay = applyDateFilters(disruptionsToDisplay, filter.period);
    }

    return disruptionsToDisplay;
};

const applyFiltersToDisruptions = (
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

const ViewAllDisruptions = ({
    disruptions,
    services,
    newDisruptionId,
    operators,
}: ViewAllDisruptionsProps): ReactElement => {
    const [numberOfDisruptionsPages, setNumberOfDisruptionsPages] = useState<number>(
        Math.ceil(disruptions.length / 10),
    );
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedServices, setSelectedServices] = useState<Service[]>([]);
    const [selectedOperatorsNocs, setSelectedOperatorsNocs] = useState<string[]>([]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const stateUpdater = (change: string[], _field: string): void => {
        setSelectedOperatorsNocs(change);
    };
    const router = useRouter();
    const query = router.query;
    const [filter, setFilter] = useState<Filter>({
        services: [],
        operators: [],
        status: (query["pending"] as string) ? Progress.pendingApproval : undefined,
    });
    const [showFilters, setShowFilters] = useState(false);
    const [clearButtonClicked, setClearButtonClicked] = useState(false);
    const [disruptionsToDisplay, setDisruptionsToDisplay] = useState(getPageOfDisruptions(currentPage, disruptions));
    const [startDateFilter, setStartDateFilter] = useState("");
    const [endDateFilter, setEndDateFilter] = useState("");
    const [startDateFilterError, setStartDateFilterError] = useState(false);
    const [endDateFilterError, setEndDateFilterError] = useState(false);
    const [incompatibleDatesError, setIncompatibleDatesError] = useState(false);
    const [searchText, setSearchText] = useState("");

    const handleFilterUpdate = (
        filter: Filter,
        setFilter: Dispatch<SetStateAction<Filter>>,
        key: keyof Filter,
        value: string,
    ) => {
        setFilter({ ...filter, [key]: value });
    };

    const handleDateFilterUpdate = (
        filter: Filter,
        setFilter: Dispatch<SetStateAction<Filter>>,
        typeOfDate: "start" | "end",
        value: string,
        setStartDateFilter: Dispatch<SetStateAction<string>>,
        setEndDateFilter: Dispatch<SetStateAction<string>>,
        schema: z.ZodTypeAny,
    ) => {
        if (typeOfDate === "start") {
            const { success } = schema.safeParse(value);
            if (success) {
                setStartDateFilter(value);
            } else {
                setStartDateFilter("");
            }

            if (!!endDateFilter && success) {
                if (dateIsSameOrBeforeSecondDate(getFormattedDate(value), getFormattedDate(endDateFilter))) {
                    setIncompatibleDatesError(false);
                    setFilter({ ...filter, period: { startTime: value, endTime: endDateFilter } });
                } else {
                    setIncompatibleDatesError(true);
                    setFilter({ ...filter, period: undefined });
                }
            } else {
                setFilter({ ...filter, period: undefined });
            }
        } else {
            const { success } = schema.safeParse(value);
            if (success) {
                setEndDateFilter(value);
            } else {
                setEndDateFilter("");
            }

            if (!!startDateFilter && success) {
                if (dateIsSameOrBeforeSecondDate(getFormattedDate(startDateFilter), getFormattedDate(value))) {
                    setIncompatibleDatesError(false);
                    setFilter({ ...filter, period: { startTime: startDateFilter, endTime: value } });
                } else {
                    setIncompatibleDatesError(true);
                    setFilter({ ...filter, period: undefined });
                }
            } else {
                setFilter({ ...filter, period: undefined });
            }
        }
    };

    useEffect(() => {
        const statusValue = query["pending"];
        if (statusValue) {
            setShowFilters(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (clearButtonClicked) {
            setStartDateFilter("");
            setStartDateFilterError(false);
            setEndDateFilter("");
            setEndDateFilterError(false);
            setSelectedOperatorsNocs([]);
            setSelectedServices([]);
            setClearButtonClicked(false);
            setSearchText("");
        }
    }, [clearButtonClicked]);

    useEffect(() => {
        if (startDateFilter && !endDateFilter) {
            setEndDateFilterError(true);
        }

        if (endDateFilter && !startDateFilter) {
            setStartDateFilterError(true);
        }

        if (startDateFilter && endDateFilter) {
            setEndDateFilterError(false);
            setStartDateFilterError(false);
        }

        if (!startDateFilter && !endDateFilter) {
            setEndDateFilterError(false);
            setStartDateFilterError(false);
            setIncompatibleDatesError(false);
        }
    }, [startDateFilter, endDateFilter]);

    useEffect(() => {
        setDisruptionsToDisplay(getPageOfDisruptions(currentPage, disruptions));
    }, [currentPage, disruptions]);

    useEffect(() => {
        setFilter({ ...filter, services: selectedServices });
        applyFiltersToDisruptions(
            disruptions,
            setDisruptionsToDisplay,
            currentPage,
            { ...filter, services: selectedServices },
            setNumberOfDisruptionsPages,
        ); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedServices]);

    useEffect(() => {
        setFilter({ ...filter, searchText });
        applyFiltersToDisruptions(
            disruptions,
            setDisruptionsToDisplay,
            currentPage,
            { ...filter, searchText },
            setNumberOfDisruptionsPages,
        ); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchText]);

    useEffect(() => {
        const disruptionOperatorsToSet: DisruptionOperator[] = [];
        selectedOperatorsNocs.forEach((selOpNoc) => {
            const operator = operators.find((op) => op.nocCode === selOpNoc);
            if (operator) {
                disruptionOperatorsToSet.push({
                    operatorName: operator.operatorPublicName,
                    operatorRef: operator.nocCode,
                });
            }
        });

        setFilter({
            ...filter,
            operators: disruptionOperatorsToSet,
        });

        applyFiltersToDisruptions(
            disruptions,
            setDisruptionsToDisplay,
            currentPage,
            { ...filter, operators: disruptionOperatorsToSet },
            setNumberOfDisruptionsPages,
        ); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedOperatorsNocs]);

    useEffect(() => {
        if (filterIsEmpty(filter)) {
            setDisruptionsToDisplay(getPageOfDisruptions(currentPage, disruptions));
            setNumberOfDisruptionsPages(Math.ceil(disruptions.length / 10));
        } else {
            applyFiltersToDisruptions(
                disruptions,
                setDisruptionsToDisplay,
                currentPage,
                filter,
                setNumberOfDisruptionsPages,
            );
        } // eslint-disable-next-line react-hooks/exhaustive-deps
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
                        <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z" />
                    </svg>
                </Link>
                <div className="flex">
                    <button
                        className="govuk-button govuk-button--secondary block"
                        data-module="govuk-button"
                        onClick={() => {
                            if (showFilters) {
                                setFilter({ services: [], operators: [] });
                                setDisruptionsToDisplay(getPageOfDisruptions(currentPage, disruptions));
                                setClearButtonClicked(true);
                                setShowFilters(false);
                            } else {
                                setShowFilters(true);
                            }
                        }}
                    >
                        {showFilters ? "Hide and clear " : "Show "}filters
                    </button>
                    {showFilters && (
                        <button
                            className="govuk-button govuk-button--secondary ml-2"
                            data-module="govuk-button"
                            onClick={() => {
                                setFilter({ services: [], operators: [] });
                                setDisruptionsToDisplay(getPageOfDisruptions(currentPage, disruptions));
                                setClearButtonClicked(true);
                            }}
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            </div>

            {showFilters ? (
                <>
                    <div className="flex">
                        <div>
                            <label className="govuk-label govuk-label--s" htmlFor="summary-search">
                                Summary
                            </label>
                            <div id="summary-search-hint" className="govuk-hint">
                                3 characters minimum
                            </div>
                            <input
                                className="govuk-input govuk-input--width-20 mb-4"
                                id="summary-search"
                                name="summarySearch"
                                type="text"
                                maxLength={20}
                                onChange={(e) => {
                                    setSearchText(e.target.value);
                                }}
                                value={searchText}
                                aria-describedby="summary-search-hint"
                            />
                        </div>
                    </div>
                    <OperatorSearch
                        display="Operators"
                        displaySize="s"
                        operators={operators}
                        selectedOperatorNocs={selectedOperatorsNocs}
                        stateUpdater={stateUpdater}
                        initialErrors={[]}
                        inputName="operatorsFilter"
                        reset={clearButtonClicked}
                    />
                    {selectedOperatorsNocs.length > 0 ? (
                        <Table
                            rows={selectedOperatorsNocs.map((selOpNoc) => {
                                return {
                                    cells: [
                                        operators.find((op) => op.nocCode === selOpNoc)?.operatorPublicName,
                                        selOpNoc,
                                        <button
                                            key={selOpNoc}
                                            className="govuk-link"
                                            onClick={() => {
                                                const selectedOperatorsWithRemoved =
                                                    selectedOperatorsNocs.filter((opNoc) => opNoc !== selOpNoc) || [];
                                                stateUpdater(selectedOperatorsWithRemoved, "");
                                            }}
                                        >
                                            Remove
                                        </button>,
                                    ],
                                };
                            })}
                        />
                    ) : null}
                    <ServiceSearch
                        services={services}
                        setSelectedServices={setSelectedServices}
                        selectedServices={selectedServices}
                        reset={clearButtonClicked}
                    />

                    {filter.services.length > 0 ? <Table rows={formatServicesIntoRows(filter, setFilter)} /> : null}

                    {(startDateFilterError || endDateFilterError) && (
                        <div>
                            <span className="govuk-error-message">
                                <span className="govuk-visually-hidden">Error: </span>
                                Both start date and end date must be provided to filter by date.
                            </span>
                        </div>
                    )}

                    {incompatibleDatesError && (
                        <div>
                            <span className="govuk-error-message">
                                <span className="govuk-visually-hidden">Error: </span>
                                The end date must be the same day or after the start date.
                            </span>
                        </div>
                    )}

                    <div className="flex">
                        <DateSelector
                            display="Start date"
                            hiddenHint="Enter in format DD/MM/YYYY"
                            value=""
                            disabled={false}
                            disablePast={false}
                            inputName="disruptionStartDate"
                            stateUpdater={(value) => {
                                handleDateFilterUpdate(
                                    filter,
                                    setFilter,
                                    "start",
                                    value,
                                    setStartDateFilter,
                                    setEndDateFilter,
                                    validitySchema.shape.disruptionStartDate,
                                );
                                setClearButtonClicked(false);
                            }}
                            reset={clearButtonClicked}
                            schema={validitySchema.shape.disruptionStartDate}
                            errorOnBlur={startDateFilterError || endDateFilterError}
                        />
                        <div className="ml-5">
                            <DateSelector
                                display="End date"
                                hiddenHint="Enter in format DD/MM/YYYY"
                                value=""
                                disabled={false}
                                disablePast={false}
                                inputName="disruptionEndDate"
                                stateUpdater={(value) => {
                                    handleDateFilterUpdate(
                                        filter,
                                        setFilter,
                                        "end",
                                        value,
                                        setStartDateFilter,
                                        setEndDateFilter,
                                        validitySchema.shape.disruptionEndDate,
                                    );
                                    setClearButtonClicked(false);
                                }}
                                reset={clearButtonClicked}
                                schema={validitySchema.shape.disruptionEndDate}
                                errorOnBlur={startDateFilterError || endDateFilterError}
                            />
                        </div>
                    </div>

                    <div className="flex">
                        <Select
                            inputName="severityFilter"
                            display="Severity"
                            value={filter.severity}
                            defaultDisplay="Select a severity"
                            selectValues={DISRUPTION_SEVERITIES.sort((a, b) => a.display.localeCompare(b.display))}
                            stateUpdater={(value) => handleFilterUpdate(filter, setFilter, "severity", value)}
                            width="1/4"
                            updateOnChange
                            useDefaultValue={false}
                        />
                        <div className="ml-10">
                            <Select
                                inputName="statusFilter"
                                display="Status"
                                value={filter.status}
                                defaultDisplay="Select a status"
                                selectValues={DISRUPTION_STATUSES.sort((a, b) => a.display.localeCompare(b.display))}
                                stateUpdater={(value) => handleFilterUpdate(filter, setFilter, "status", value)}
                                width="1/4"
                                updateOnChange
                                useDefaultValue={false}
                            />
                        </div>
                        <div className="ml-10">
                            <Select
                                inputName="modeFilter"
                                display="Mode"
                                value={filter.mode}
                                defaultDisplay="Select a mode"
                                selectValues={VEHICLE_MODES.sort((a, b) => a.display.localeCompare(b.display))}
                                stateUpdater={(value) => handleFilterUpdate(filter, setFilter, "mode", value)}
                                width="1/4"
                                updateOnChange
                                useDefaultValue={false}
                            />
                        </div>
                    </div>
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

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: ViewAllDisruptionsProps }> => {
    const baseProps = {
        props: {
            disruptions: [],
            newDisruptionId: randomUUID(),
            services: [],
            operators: [],
        },
    };

    if (!ctx.req) {
        return baseProps;
    }

    const session = await getSessionWithOrgDetail(ctx.req);

    if (!session) {
        return baseProps;
    }
    const operators = await fetchOperators({ adminAreaCodes: session.adminAreaCodes });
    let data = await getDisruptionsDataFromDynamo(session.orgId);

    const servicesData: Service[] = await fetchServices({ adminAreaCodes: session.adminAreaCodes });
    let services: Service[] = [];

    if (servicesData.length > 0) {
        services = sortServices(servicesData);

        const setOfServices = new Set();

        const filteredServices: Service[] = services.filter((item) => {
            const serviceDisplay = item.lineName + item.origin + item.destination + item.operatorShortName;
            if (!setOfServices.has(serviceDisplay)) {
                setOfServices.add(serviceDisplay);
                return true;
            } else {
                return false;
            }
        });

        services = filteredServices;
    }

    if (data) {
        data = data.filter(
            (item) =>
                item.publishStatus === PublishStatus.published ||
                item.publishStatus === PublishStatus.draft ||
                item.publishStatus === PublishStatus.pendingApproval ||
                item.publishStatus === PublishStatus.editPendingApproval,
        );
        const sortedDisruptions = sortDisruptionsByStartDate(data);
        const shortenedData: TableDisruption[] = sortedDisruptions.map((disruption) => {
            const modes: string[] = [];
            const severitys: Severity[] = [];
            const serviceIds: string[] = [];
            const disruptionOperators: DisruptionOperator[] = [];

            if (disruption.consequences) {
                disruption.consequences.forEach((consequence) => {
                    const modeToAdd = getDisplayByValue(VEHICLE_MODES, consequence.vehicleMode);
                    if (!!modeToAdd && !modes.includes(modeToAdd)) {
                        modes.push(modeToAdd);
                    }

                    severitys.push(consequence.disruptionSeverity);

                    if (consequence.consequenceType === "services") {
                        consequence.services.forEach((service) => {
                            serviceIds.push(service.id.toString());
                        });
                    }

                    if (consequence.consequenceType === "operatorWide") {
                        consequence.consequenceOperators.forEach((consOp) => {
                            const foundOperator = operators.find((op) => op.nocCode === consOp);

                            if (foundOperator) {
                                disruptionOperators.push({
                                    operatorName: foundOperator.operatorPublicName,
                                    operatorRef: foundOperator.nocCode,
                                });
                            }
                        });
                    }
                });
            }

            const status = getDisruptionStatus(disruption);

            return {
                modes,
                consequenceLength: disruption.consequences ? disruption.consequences.length : 0,
                status,
                severity: getWorstSeverity(severitys),
                serviceIds,
                operators: disruptionOperators,
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
                operators,
            },
        };
    }

    return {
        props: {
            disruptions: [],
            services,
            newDisruptionId: randomUUID(),
            operators,
        },
    };
};

export default ViewAllDisruptions;
