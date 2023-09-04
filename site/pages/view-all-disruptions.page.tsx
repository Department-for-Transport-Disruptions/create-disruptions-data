import { ConsequenceOperators, Service } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { validitySchema } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { Datasource, Progress, PublishStatus, Severity } from "@create-disruptions-data/shared-ts/enums";
import { getDate, getFormattedDate } from "@create-disruptions-data/shared-ts/utils/dates";
import { makeFilteredArraySchema } from "@create-disruptions-data/shared-ts/utils/zod";
import { LoadingBox } from "@govuk-react/loading-box";
import { pdf } from "@react-pdf/renderer";
import { Dayjs } from "dayjs";
import { saveAs } from "file-saver";
import { NextPageContext } from "next";
import Link from "next/link";
import Papa from "papaparse";
import { Dispatch, ReactElement, SetStateAction, useEffect, useState } from "react";
import writeXlsxFile, { Schema } from "write-excel-file";
import { z } from "zod";
import { randomUUID } from "crypto";
import DateSelector from "../components/form/DateSelector";
import Select from "../components/form/Select";
import SortableTable, { SortOrder, TableColumn } from "../components/form/SortableTable";
import Table from "../components/form/Table";
import { BaseLayout } from "../components/layout/Layout";
import PDFDoc from "../components/pdf/DownloadPDF";
import ExportPopUp from "../components/popup/ExportPopup";
import OperatorSearch from "../components/search/OperatorSearch";
import ServiceSearch from "../components/search/ServiceSearch";
import {
    DISRUPTION_DETAIL_PAGE_PATH,
    DISRUPTION_SEVERITIES,
    DISRUPTION_STATUSES,
    REVIEW_DISRUPTION_PAGE_PATH,
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
    VEHICLE_MODES,
    VIEW_ALL_DISRUPTIONS_PAGE_PATH,
} from "../constants";
import { fetchOperators, fetchServices } from "../data/refDataApi";
import { Operator, ServiceApiResponse } from "../schemas/consequence.schema";
import { ExportDisruptionData, disruptionsTableSchema, exportDisruptionsSchema } from "../schemas/disruption.schema";
import {
    SortedDisruption,
    getDisplayByValue,
    getServiceLabel,
    getSortedDisruptionFinalEndDate,
    splitCamelCaseToString,
} from "../utils";
import { getSessionWithOrgDetail } from "../utils/apiUtils/auth";
import {
    convertDateTimeToFormat,
    dateIsSameOrBeforeSecondDate,
    filterDatePeriodMatchesDisruptionDatePeriod,
} from "../utils/dates";
import { getExportSchema } from "../utils/exportUtils";
import { filterServices } from "../utils/formUtils";

const title = "View All Disruptions";
const description = "View All Disruptions page for the Create Transport Disruptions Service";

interface DisruptionOperator {
    operatorName: string;
    operatorRef: string;
}

export interface TableDisruption {
    displayId: string;
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
    operators: string[];
    isOperatorWideCq: boolean;
    isNetworkWideCq: boolean;
    isLive: boolean;
    stopsAffectedCount: number;
    consequenceLength?: number;
}

export interface ViewAllDisruptionsProps {
    adminAreaCodes: string[];
    newDisruptionId: string;
    csrfToken?: string;
    filterStatus?: Progress | null;
    enableLoadingSpinnerOnPageLoad?: boolean;
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

export interface DisruptionTable {
    id: JSX.Element;
    summary: string;
    modes: string;
    start: string;
    end: string;
    severity: string;
    status: string;
}

const sortFunction = (disruptions: DisruptionTable[], sortField: keyof DisruptionTable, sortOrder: SortOrder) => {
    return disruptions.sort((a, b) => {
        const aValue = getFormattedDate(a[sortField] === "No end time" ? "01/01/1900" : (a[sortField] as string));
        const bValue = getFormattedDate(b[sortField] === "No end time" ? "01/01/1900" : (b[sortField] as string));

        if (aValue.isBefore(bValue)) {
            return sortOrder === SortOrder.asc ? -1 : 1;
        } else if (aValue.isAfter(bValue)) {
            return sortOrder === SortOrder.asc ? 1 : -1;
        } else {
            return 0;
        }
    });
};

export const getDisruptionStatus = (disruption: SortedDisruption): Progress => {
    if (disruption.publishStatus === PublishStatus.draft) {
        return Progress.draft;
    }

    if (disruption.publishStatus === PublishStatus.rejected) {
        return Progress.rejected;
    }

    if (disruption.publishStatus === PublishStatus.pendingApproval) {
        return Progress.draftPendingApproval;
    }

    if (
        disruption.publishStatus === PublishStatus.editPendingApproval ||
        disruption.publishStatus === PublishStatus.pendingAndEditing
    ) {
        return Progress.editPendingApproval;
    }

    if (!disruption.validity) {
        return Progress.closed;
    }

    const today = getDate();
    const disruptionEndDate = getSortedDisruptionFinalEndDate(disruption);

    if (!!disruptionEndDate) {
        return disruptionIsClosingOrClosed(disruptionEndDate, today);
    }

    return Progress.open;
};

export const disruptionIsClosingOrClosed = (disruptionEndDate: Dayjs, today: Dayjs): Progress => {
    if (disruptionEndDate.isBefore(today)) {
        return Progress.closed;
    } else if (disruptionEndDate.diff(today, "hour") < 24) {
        return Progress.closing;
    }

    return Progress.open;
};

const formatDisruptionsIntoRows = (disruptions: TableDisruption[]): DisruptionTable[] => {
    return disruptions.map((disruption) => {
        const earliestPeriod: {
            startTime: string;
            endTime: string | null;
        } = disruption.validityPeriods[0];
        const latestPeriod: string | null = disruption.validityPeriods[disruption.validityPeriods.length - 1].endTime;

        return {
            id: (
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
                    {disruption.displayId}
                </Link>
            ),
            summary: disruption.summary,
            modes: disruption.modes.map((mode) => splitCamelCaseToString(mode)).join(", ") || "N/A",
            start: convertDateTimeToFormat(earliestPeriod.startTime),
            end: !!latestPeriod ? convertDateTimeToFormat(latestPeriod) : "No end time",
            severity: splitCamelCaseToString(disruption.severity),
            status: splitCamelCaseToString(disruption.status),
        };
    });
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

        if (filter.mode && filter.mode !== "any") {
            const swappedMode = getDisplayByValue(VEHICLE_MODES, filter.mode);

            if (!swappedMode || !disruption.modes.includes(swappedMode)) {
                return false;
            }
        }

        if (filter.severity && filter.severity !== "any" && disruption.severity !== filter.severity) {
            return false;
        }

        if (filter.status && filter.status !== "any" && disruption.status !== filter.status) {
            if (
                filter.status === Progress.pendingApproval &&
                disruption.status !== Progress.editPendingApproval &&
                disruption.status !== Progress.draftPendingApproval
            ) {
                return false;
            } else if (filter.status !== Progress.pendingApproval) {
                return false;
            }
        }

        if (filter.operators.length > 0) {
            const filterOperatorsRefs = filter.operators.map((op) => op.operatorRef);

            if (!disruption.operators.some((operator) => filterOperatorsRefs.includes(operator))) {
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
    filter: Filter,
): void => {
    const disruptionsToDisplay = filterDisruptions(disruptions, filter);

    setDisruptionsToDisplay(disruptionsToDisplay);
};

const filterIsEmpty = (filter: Filter): boolean =>
    Object.keys(filter).length === 2 && filter.services.length === 0 && filter.operators.length === 0;

export const getDisruptionData = async () => {
    const options: RequestInit = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    };

    const res = await fetch("/api/get-all-disruptions", options);

    const parseResult = makeFilteredArraySchema(disruptionsTableSchema).safeParse(await res.json());
    if (!parseResult.success) {
        return [];
    }
    return parseResult.data;
};

const ViewAllDisruptions = ({
    newDisruptionId,
    adminAreaCodes,
    filterStatus,
    enableLoadingSpinnerOnPageLoad = true,
}: ViewAllDisruptionsProps): ReactElement => {
    const [selectedServices, setSelectedServices] = useState<Service[]>([]);
    const [selectedOperators, setSelectedOperators] = useState<ConsequenceOperators[]>([]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const stateUpdater = (change: ConsequenceOperators[], _field: string): void => {
        setSelectedOperators([...change]);
    };
    const [filter, setFilter] = useState<Filter>({
        services: [],
        operators: [],
        status: filterStatus ? filterStatus : undefined,
    });
    const [showFilters, setShowFilters] = useState(false);
    const [filtersLoading, setFiltersLoading] = useState(false);
    const [clearButtonClicked, setClearButtonClicked] = useState(false);
    const [disruptionsToDisplay, setDisruptionsToDisplay] = useState<TableDisruption[]>([]);
    const [disruptions, setDisruptions] = useState<TableDisruption[]>([]);
    const [startDateFilter, setStartDateFilter] = useState("");
    const [endDateFilter, setEndDateFilter] = useState("");
    const [startDateFilterError, setStartDateFilterError] = useState(false);
    const [endDateFilterError, setEndDateFilterError] = useState(false);
    const [incompatibleDatesError, setIncompatibleDatesError] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [servicesList, setServicesList] = useState<Service[]>([]);
    const [operatorsList, setOperatorsList] = useState<Operator[]>([]);
    const [popUpState, setPopUpState] = useState(false);
    const [downloadPdf, setDownloadPdf] = useState(false);
    const [downloadExcel, setDownloadExcel] = useState(false);
    const [downloadCsv, setDownloadCsv] = useState(false);
    const [loadPage, setLoadPage] = useState(false);

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
        const fetchData = async () => {
            setLoadPage(true);

            const disruptions = await getDisruptionData();
            setDisruptionsToDisplay(disruptions);
            setDisruptions(disruptions);
            setLoadPage(false);
        };

        fetchData().catch(() => {
            setDisruptionsToDisplay([]);
            setLoadPage(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (clearButtonClicked) {
            setStartDateFilter("");
            setStartDateFilterError(false);
            setEndDateFilter("");
            setEndDateFilterError(false);
            setSelectedOperators([]);
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
        setFilter({ ...filter, services: selectedServices });
        applyFiltersToDisruptions(disruptions, setDisruptionsToDisplay, { ...filter, services: selectedServices }); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedServices]);

    useEffect(() => {
        setFilter({ ...filter, searchText });
        applyFiltersToDisruptions(disruptions, setDisruptionsToDisplay, { ...filter, searchText }); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchText]);

    useEffect(() => {
        const disruptionOperatorsToSet: DisruptionOperator[] = [];
        selectedOperators.forEach((selOpNoc) => {
            const operator = operatorsList.find((op) => op.nocCode === selOpNoc.operatorNoc);
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

        applyFiltersToDisruptions(disruptions, setDisruptionsToDisplay, {
            ...filter,
            operators: disruptionOperatorsToSet,
        }); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedOperators]);

    useEffect(() => {
        if (filterIsEmpty(filter)) {
            setDisruptionsToDisplay(disruptions);
        } else {
            applyFiltersToDisruptions(disruptions, setDisruptionsToDisplay, filter);
        } // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    useEffect(() => {
        const generatePdf = async () => {
            if (downloadPdf) {
                const parseDisruptions = exportDisruptionsSchema.safeParse(disruptionsToDisplay);
                const blob = await pdf(
                    <PDFDoc disruptions={parseDisruptions.success ? parseDisruptions.data : []} />,
                ).toBlob();
                saveAs(blob, "Disruptions_list.pdf");
                setDownloadPdf(false);
            }
        };
        generatePdf().catch(() => {
            saveAs(new Blob(["There was an error. Contact your admin team"]), "Disruptions.pdf");
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [downloadPdf]);

    useEffect(() => {
        if (downloadExcel) {
            generateExcel().catch(async () => {
                await writeXlsxFile(["There was an error. Contact your admin team"], {
                    schema: [{ column: "error", type: String, value: (objectData: string) => objectData }],
                    fileName: "Disruptions_list.xlsx",
                });
            });
            setDownloadExcel(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [downloadExcel]);

    useEffect(() => {
        if (downloadCsv) {
            generateCsv();
            setDownloadCsv(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [downloadCsv]);

    const setServicesAndOperators = async (adminAreaCodes: string[]) => {
        const [operators, servicesBodsData, servicesTndsData] = await Promise.all([
            fetchOperators({ adminAreaCodes: adminAreaCodes }),
            fetchServices({ adminAreaCodes: adminAreaCodes }),
            fetchServices({ adminAreaCodes: adminAreaCodes, dataSource: Datasource.tnds }),
        ]);

        let services: ServiceApiResponse[] = [];

        const combinedServices = (servicesBodsData ?? []).concat(servicesTndsData ?? []);
        services = filterServices(combinedServices) ?? [];

        setOperatorsList(operators);
        setServicesList(services);
    };

    const cancelActionHandler = (): void => {
        setPopUpState(false);
    };

    const exportHandler = (fileType: string) => {
        if (fileType === "pdf") {
            setDownloadPdf(true);
        } else if (fileType === "excel") {
            setDownloadExcel(true);
        } else if (fileType === "csv") {
            setDownloadCsv(true);
        }
    };

    const generateCsv = () => {
        const parseDisruptions = exportDisruptionsSchema.safeParse(disruptionsToDisplay);

        const csvData = Papa.unparse({
            fields: [
                "id",
                "title",
                "serviceModes",
                "operatorWide",
                "networkWide",
                "servicesAffectedCount",
                "stopsAffectedCount",
                "startDate",
                "endDate",
                "severity",
                "isLive",
                "status",
            ],
            data: parseDisruptions.success ? parseDisruptions.data : [],
        });

        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });

        saveAs(blob, "Disruptions_list.csv");
    };

    const generateExcel = async () => {
        const parseDisruptions = exportDisruptionsSchema.safeParse(disruptionsToDisplay);

        const data = parseDisruptions.success ? parseDisruptions.data : [];

        const exportSchema: Schema<ExportDisruptionData> = getExportSchema();

        await writeXlsxFile(data, {
            schema: exportSchema,
            fileName: "Disruptions_list.xlsx",
        });
    };

    const columns: TableColumn<DisruptionTable>[] = [
        {
            displayName: "ID",
            key: "id",
        },
        {
            displayName: "Summary",
            key: "summary",
        },
        {
            displayName: "Modes",
            key: "modes",
        },
        {
            displayName: "Start",
            key: "start",
            sortable: true,
        },
        {
            displayName: "End",
            key: "end",
            sortable: true,
        },
        {
            displayName: "Severity",
            key: "severity",
        },
        {
            displayName: "Status",
            key: "status",
        },
    ];

    return (
        <BaseLayout title={title} description={description}>
            {popUpState ? <ExportPopUp confirmHandler={exportHandler} closePopUp={cancelActionHandler} /> : null}
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
                        onClick={async () => {
                            if (showFilters) {
                                setFilter({ services: [], operators: [] });
                                setDisruptionsToDisplay(disruptions);
                                setClearButtonClicked(true);
                                setShowFilters(false);
                            } else {
                                setShowFilters(true);

                                if (servicesList.length === 0 && operatorsList.length === 0) {
                                    setFiltersLoading(true);
                                    await setServicesAndOperators(adminAreaCodes);
                                    setFiltersLoading(false);
                                }
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
                                setDisruptionsToDisplay(disruptions);
                                setClearButtonClicked(true);
                            }}
                        >
                            Clear filters
                        </button>
                    )}
                    <button
                        className="govuk-button govuk-button--secondary ml-2"
                        data-module="govuk-button"
                        onClick={() => {
                            setPopUpState(true);
                        }}
                    >
                        Export
                    </button>
                </div>
            </div>

            {showFilters ? (
                <LoadingBox loading={filtersLoading}>
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
                    <OperatorSearch<DisruptionOperator>
                        display="Operators"
                        displaySize="s"
                        operators={operatorsList}
                        selectedOperators={selectedOperators}
                        stateUpdater={stateUpdater}
                        initialErrors={[]}
                        inputName="operatorName"
                        reset={clearButtonClicked}
                    />
                    {selectedOperators.length > 0 ? (
                        <Table
                            rows={selectedOperators
                                .sort((a, b) => {
                                    return a.operatorPublicName.localeCompare(b.operatorPublicName);
                                })
                                .map((selOpNoc) => {
                                    return {
                                        cells: [
                                            operatorsList.find((op) => op.nocCode === selOpNoc.operatorNoc)
                                                ?.operatorPublicName,
                                            selOpNoc.operatorNoc,
                                            <button
                                                key={selOpNoc.operatorNoc}
                                                className="govuk-link"
                                                onClick={() => {
                                                    const selectedOperatorsWithRemoved =
                                                        selectedOperators.filter((opNoc) => opNoc !== selOpNoc) || [];
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
                        services={servicesList}
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
                            hint={{ hidden: true, text: "Enter in format DD/MM/YYYY" }}
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
                        />
                        <div className="ml-5">
                            <DateSelector
                                display="End date"
                                hint={{ hidden: true, text: "Enter in format DD/MM/YYYY" }}
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
                            />
                        </div>
                    </div>

                    <div className="flex">
                        <Select
                            inputName="severityFilter"
                            display="Severity"
                            value={filter.severity}
                            defaultDisplay="Select a severity"
                            selectValues={[
                                { display: "Any", value: "any" },
                                ...DISRUPTION_SEVERITIES.sort((a, b) => a.display.localeCompare(b.display)),
                            ]}
                            stateUpdater={(value) => handleFilterUpdate(filter, setFilter, "severity", value)}
                            width="1/4"
                            useDefaultValue={false}
                        />
                        <div className="ml-10">
                            <Select
                                inputName="statusFilter"
                                display="Status"
                                value={filter.status}
                                defaultDisplay="Select a status"
                                selectValues={[
                                    { display: "Any", value: "any" },
                                    ...DISRUPTION_STATUSES.sort((a, b) => a.display.localeCompare(b.display)),
                                ]}
                                stateUpdater={(value) => handleFilterUpdate(filter, setFilter, "status", value)}
                                width="1/4"
                                useDefaultValue={false}
                            />
                        </div>
                        <div className="ml-10">
                            <Select
                                inputName="modeFilter"
                                display="Mode"
                                value={filter.mode}
                                defaultDisplay="Select a mode"
                                selectValues={[
                                    { display: "Any", value: "any" },
                                    ...VEHICLE_MODES.sort((a, b) => a.display.localeCompare(b.display)),
                                ]}
                                stateUpdater={(value) => handleFilterUpdate(filter, setFilter, "mode", value)}
                                width="1/4"
                                useDefaultValue={false}
                            />
                        </div>
                    </div>
                </LoadingBox>
            ) : null}

            {enableLoadingSpinnerOnPageLoad ? (
                <LoadingBox loading={loadPage}>
                    <SortableTable
                        columns={columns}
                        rows={formatDisruptionsIntoRows(disruptionsToDisplay)}
                        sortFunction={sortFunction}
                    />
                </LoadingBox>
            ) : (
                <SortableTable
                    columns={columns}
                    rows={formatDisruptionsIntoRows(disruptionsToDisplay)}
                    sortFunction={sortFunction}
                />
            )}
        </BaseLayout>
    );
};

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: ViewAllDisruptionsProps }> => {
    const baseProps = {
        props: {
            newDisruptionId: randomUUID(),
            adminAreaCodes: [],
            orgId: "",
        },
    };

    if (!ctx.req) {
        return baseProps;
    }

    const session = await getSessionWithOrgDetail(ctx.req);

    if (!session) {
        return baseProps;
    }

    const showPending = ctx.query.pending?.toString() === "true";
    const showDraft = ctx.query.draft?.toString() === "true";

    return {
        props: {
            adminAreaCodes: session.adminAreaCodes,
            newDisruptionId: randomUUID(),
            ...(showPending
                ? { filterStatus: Progress.pendingApproval }
                : showDraft
                ? { filterStatus: Progress.draft }
                : {}),
        },
    };
};

export default ViewAllDisruptions;
