import { Datasource, Progress, PublishStatus, Severity } from "@create-disruptions-data/shared-ts/enums";
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
import Table from "../components/form/Table";
import { BaseLayout } from "../components/layout/Layout";
import PageNumbers from "../components/layout/PageNumbers";
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
import { getDisruptionsDataFromDynamo } from "../data/dynamo";
import { fetchOperators, fetchServices } from "../data/refDataApi";
import { ConsequenceOperators, Operator, Service, ServiceApiResponse } from "../schemas/consequence.schema";
import { validitySchema } from "../schemas/create-disruption.schema";
import { exportDisruptionsSchema, ExportDisruptionData } from "../schemas/disruption.schema";
import {
    sortDisruptionsByStartDate,
    splitCamelCaseToString,
    reduceStringWithEllipsis,
    getServiceLabel,
    mapValidityPeriods,
    getDisplayByValue,
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
    isLiveDisruption,
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
    disruptions: TableDisruption[];
    adminAreaCodes: string[];
    newDisruptionId: string;
    filterStatus?: Progress;
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

const getDisruptionStatus = (disruption: SortedDisruption): Progress => {
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

const formatDisruptionsIntoRows = (disruptions: TableDisruption[], currentPage: number) => {
    const pageOfDisruptions = getPageOfDisruptions(currentPage, disruptions);
    return pageOfDisruptions.map((disruption) => {
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
                    {disruption.displayId}
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
    setNumberOfDisruptionsPages: Dispatch<SetStateAction<number>>,
): void => {
    const disruptionsToDisplay = filterDisruptions(disruptions, filter);

    setDisruptionsToDisplay(disruptionsToDisplay);
    setNumberOfDisruptionsPages(Math.ceil(disruptionsToDisplay.length / 10));
};

const filterIsEmpty = (filter: Filter): boolean =>
    Object.keys(filter).length === 2 && filter.services.length === 0 && filter.operators.length === 0;

const ViewAllDisruptions = ({
    disruptions,
    newDisruptionId,
    adminAreaCodes,
    filterStatus,
}: ViewAllDisruptionsProps): ReactElement => {
    const [numberOfDisruptionsPages, setNumberOfDisruptionsPages] = useState<number>(
        Math.ceil(disruptions.length / 10),
    );
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedServices, setSelectedServices] = useState<Service[]>([]);
    const [selectedOperators, setSelectedOperators] = useState<ConsequenceOperators[]>([]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const stateUpdater = (change: ConsequenceOperators[], _field: string): void => {
        setSelectedOperators([...change]);
    };
    const [filter, setFilter] = useState<Filter>({
        services: [],
        operators: [],
        status: filterStatus,
    });
    const [showFilters, setShowFilters] = useState(false);
    const [filtersLoading, setFiltersLoading] = useState(false);
    const [clearButtonClicked, setClearButtonClicked] = useState(false);
    const [disruptionsToDisplay, setDisruptionsToDisplay] = useState(disruptions);
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
        applyFiltersToDisruptions(
            disruptions,
            setDisruptionsToDisplay,
            { ...filter, services: selectedServices },
            setNumberOfDisruptionsPages,
        ); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedServices]);

    useEffect(() => {
        setFilter({ ...filter, searchText });
        applyFiltersToDisruptions(
            disruptions,
            setDisruptionsToDisplay,
            { ...filter, searchText },
            setNumberOfDisruptionsPages,
        ); // eslint-disable-next-line react-hooks/exhaustive-deps
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

        applyFiltersToDisruptions(
            disruptions,
            setDisruptionsToDisplay,
            { ...filter, operators: disruptionOperatorsToSet },
            setNumberOfDisruptionsPages,
        ); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedOperators]);

    useEffect(() => {
        if (filterIsEmpty(filter)) {
            setDisruptionsToDisplay(disruptions);
            setNumberOfDisruptionsPages(Math.ceil(disruptions.length / 10));
        } else {
            applyFiltersToDisruptions(disruptions, setDisruptionsToDisplay, filter, setNumberOfDisruptionsPages);
            setCurrentPage(1);
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
        services = filterServices(getDate(), combinedServices) ?? [];

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
                                setNumberOfDisruptionsPages(Math.ceil(disruptions.length / 10));
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
                                setNumberOfDisruptionsPages(Math.ceil(disruptions.length / 10));
                                setCurrentPage(1);
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
                            schema={validitySchema.shape.disruptionStartDate}
                            errorOnBlur={startDateFilterError || endDateFilterError}
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
                            selectValues={[
                                { display: "Any", value: "any" },
                                ...DISRUPTION_SEVERITIES.sort((a, b) => a.display.localeCompare(b.display)),
                            ]}
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
                                selectValues={[
                                    { display: "Any", value: "any" },
                                    ...DISRUPTION_STATUSES.sort((a, b) => a.display.localeCompare(b.display)),
                                ]}
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
                                selectValues={[
                                    { display: "Any", value: "any" },
                                    ...VEHICLE_MODES.sort((a, b) => a.display.localeCompare(b.display)),
                                ]}
                                stateUpdater={(value) => handleFilterUpdate(filter, setFilter, "mode", value)}
                                width="1/4"
                                updateOnChange
                                useDefaultValue={false}
                            />
                        </div>
                    </div>
                </LoadingBox>
            ) : null}

            <>
                <Table
                    columns={["ID", "Summary", "Modes", "Starts", "Ends", "Severity", "Status"]}
                    rows={formatDisruptionsIntoRows(disruptionsToDisplay, currentPage)}
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
            adminAreaCodes: [],
        },
    };

    if (!ctx.req) {
        return baseProps;
    }

    const session = await getSessionWithOrgDetail(ctx.req);

    if (!session) {
        return baseProps;
    }

    let disruptionsData = await getDisruptionsDataFromDynamo(session.orgId);

    if (disruptionsData) {
        disruptionsData = disruptionsData.filter(
            (item) =>
                item.publishStatus === PublishStatus.published ||
                item.publishStatus === PublishStatus.draft ||
                item.publishStatus === PublishStatus.pendingApproval ||
                item.publishStatus === PublishStatus.editPendingApproval ||
                item.publishStatus === PublishStatus.rejected,
        );
        const sortedDisruptions = sortDisruptionsByStartDate(disruptionsData);

        const shortenedData: TableDisruption[] = sortedDisruptions.map((disruption) => {
            const modes: string[] = [];
            const severitys: Severity[] = [];
            const serviceIds: string[] = [];
            const disruptionOperators: string[] = [];
            let isOperatorWideCq = false;
            let isNetworkWideCq = false;
            let stopsAffectedCount = 0;
            const atcoCodeSet = new Set<string>();

            const isLive = disruption.validity ? isLiveDisruption(disruption.validity) : false;

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

                        consequence.stops?.map((stop) => {
                            if (!atcoCodeSet.has(stop.atcoCode)) {
                                atcoCodeSet.add(stop.atcoCode);
                                stopsAffectedCount++;
                            }
                        });
                    } else if (consequence.consequenceType === "operatorWide") {
                        isOperatorWideCq = true;
                        consequence.consequenceOperators.forEach((op) => {
                            disruptionOperators.push(op.operatorNoc);
                        });
                    } else if (consequence.consequenceType === "networkWide") {
                        isNetworkWideCq = true;
                    } else if (consequence.consequenceType === "stops") {
                        consequence.stops?.map((stop) => {
                            if (!atcoCodeSet.has(stop.atcoCode)) {
                                atcoCodeSet.add(stop.atcoCode);
                                stopsAffectedCount++;
                            }
                        });
                    }
                });
            }

            const status = getDisruptionStatus(disruption);

            return {
                displayId: disruption.displayId,
                modes,
                consequenceLength: disruption.consequences ? disruption.consequences.length : 0,
                status,
                severity: getWorstSeverity(severitys),
                serviceIds,
                operators: disruptionOperators,
                id: disruption.disruptionId,
                summary: reduceStringWithEllipsis(disruption.summary, 95),
                validityPeriods: mapValidityPeriods(disruption),
                isOperatorWideCq: isOperatorWideCq,
                isNetworkWideCq: isNetworkWideCq,
                isLive: isLive,
                stopsAffectedCount: stopsAffectedCount,
            };
        });

        const showPending = ctx.query.pending?.toString() === "true";
        const showDraft = ctx.query.draft?.toString() === "true";

        return {
            props: {
                disruptions: shortenedData,
                adminAreaCodes: session.adminAreaCodes,
                newDisruptionId: randomUUID(),
                filterStatus: showPending ? Progress.pendingApproval : showDraft ? Progress.draft : undefined,
            },
        };
    }

    return {
        props: {
            disruptions: [],
            adminAreaCodes: session.adminAreaCodes,
            newDisruptionId: randomUUID(),
        },
    };
};

export default ViewAllDisruptions;
