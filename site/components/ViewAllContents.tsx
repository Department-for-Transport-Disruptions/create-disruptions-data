import { ConsequenceOperators, Service } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { validitySchema } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { Datasource, Progress } from "@create-disruptions-data/shared-ts/enums";
import { getDate, getFormattedDate } from "@create-disruptions-data/shared-ts/utils/dates";
import { makeFilteredArraySchema } from "@create-disruptions-data/shared-ts/utils/zod";
import { LoadingBox } from "@govuk-react/loading-box";
import { pdf } from "@react-pdf/renderer";
import saveAs from "file-saver";
import Link from "next/link";
import Papa from "papaparse";
import { Dispatch, ReactElement, SetStateAction, memo, useEffect, useState } from "react";
import writeXlsxFile, { Schema } from "write-excel-file";
import { z } from "zod";
import DateSelector from "./form/DateSelector";
import Select from "./form/Select";
import SortableTable, { SortOrder, TableColumn } from "./form/SortableTable";
import Table from "./form/Table";
import PDFDoc from "./pdf/DownloadPDF";
import ExportPopUp from "./popup/ExportPopup";
import OperatorSearch from "./search/OperatorSearch";
import ServiceSearch from "./search/ServiceSearch";
import {
    DISRUPTION_DETAIL_PAGE_PATH,
    DISRUPTION_SEVERITIES,
    DISRUPTION_STATUSES,
    REVIEW_DISRUPTION_PAGE_PATH,
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
    VEHICLE_MODES,
    VIEW_ALL_DISRUPTIONS_PAGE_PATH,
    VIEW_ALL_TEMPLATES_PAGE_PATH,
} from "../constants";
import { fetchOperators, fetchServices } from "../data/refDataApi";
import { Operator } from "../schemas/consequence.schema";
import {
    ExportDisruptionData,
    TableDisruption,
    disruptionsTableSchema,
    exportDisruptionsSchema,
} from "../schemas/disruption.schema";
import { getDisplayByValue, getServiceLabel, sortServices, splitCamelCaseToString } from "../utils";
import {
    convertDateTimeToFormat,
    dateIsSameOrBeforeSecondDate,
    filterDatePeriodMatchesDisruptionDatePeriod,
} from "../utils/dates";
import { getExportSchema } from "../utils/exportUtils";
import { filterServices } from "../utils/formUtils";

export interface ViewAllContentProps {
    adminAreaCodes: string[];
    newContentId: string;
    orgId: string;
    csrfToken?: string;
    filterStatus?: Progress | null;
    enableLoadingSpinnerOnPageLoad?: boolean;
    isTemplate?: boolean;
}

export interface Filter {
    services: Service[];
    period?: {
        startTime: string;
        endTime: string;
    };
    severity?: string;
    status?: Progress | "any";
    operators: FilterOperator[];
    mode?: string;
    searchText?: string;
}

export interface FilterOperator {
    operatorName: string;
    operatorRef: string;
}

export interface ContentTable {
    id: JSX.Element;
    summary: string;
    modes: string;
    start: string;
    end: string;
    severity: string;
    status: string;
}

const sortFunction = (contents: ContentTable[], sortField: keyof ContentTable, sortOrder: SortOrder) => {
    return contents.sort((a, b) => {
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

export const getDisruptionData = async (
    orgId: string,
    isTemplate?: boolean,
    nextKey?: string,
): Promise<TableDisruption[]> => {
    const options: RequestInit = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            NextKey: nextKey || "",
        },
    };

    const queryParams = [];

    if (isTemplate) {
        queryParams.push("template=true");
    }

    if (nextKey) {
        queryParams.push(`nextKey=${encodeURIComponent(nextKey)}`);
    }

    const res = await fetch(
        `/api/get-all-disruptions/${orgId}${queryParams.length > 0 ? `?${queryParams.join("&")}` : ""}`,
        options,
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { disruptions, nextKey: newNextKey } = await res.json();

    const parsedDisruptions = makeFilteredArraySchema(disruptionsTableSchema).safeParse(disruptions);

    if (!parsedDisruptions.success) {
        return [];
    }

    if (newNextKey) {
        return [...parsedDisruptions.data, ...(await getDisruptionData(orgId, isTemplate, newNextKey as string))];
    }

    return parsedDisruptions.data;
};

export const filterContents = (contents: TableDisruption[], filter: Filter): TableDisruption[] => {
    let disruptionsToDisplay = contents.filter((disruption) => {
        if (filter.services.length > 0) {
            const disruptionServices = disruption.services;

            return disruptionServices.some((service) =>
                filter.services.some(
                    (filterService) =>
                        filterService.dataSource === service.dataSource &&
                        (filterService.dataSource === Datasource.bods
                            ? filterService.lineId === service.ref
                            : filterService.serviceCode === service.ref),
                ),
            );
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
            return (
                disruption.summary.toLowerCase().includes(filter.searchText.toLowerCase()) ||
                disruption.displayId.toLowerCase().includes(filter.searchText.toLowerCase())
            );
        }

        return true;
    });

    if (filter.period) {
        disruptionsToDisplay = applyDateFilters(disruptionsToDisplay, filter.period);
    }

    return disruptionsToDisplay;
};

export const applyDateFilters = (
    contents: TableDisruption[],
    period: {
        startTime: string;
        endTime: string;
    },
): TableDisruption[] => {
    return contents.filter((content) =>
        content.validityPeriods.some((valPeriod) => {
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

export const applyFiltersToContents = (
    disruptions: TableDisruption[],
    setContentsToDisplay: Dispatch<SetStateAction<TableDisruption[]>>,
    filter: Filter,
): void => {
    const disruptionsToDisplay = filterContents(disruptions, filter);

    setContentsToDisplay(
        disruptionsToDisplay.filter(
            (disruption, index, self) => index === self.findIndex((val) => val.id === disruption.id),
        ),
    );
};

export const filterIsEmpty = (filter: Filter): boolean =>
    Object.keys(filter).length === 2 && filter.services.length === 0 && filter.operators.length === 0;

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

export const handleFilterUpdate = (
    filter: Filter,
    setFilter: Dispatch<SetStateAction<Filter>>,
    key: keyof Filter,
    value: string,
) => {
    setFilter({ ...filter, [key]: value });
};
export type HandleDateFilterProps = {
    filter: Filter;
    setFilter: Dispatch<SetStateAction<Filter>>;
    typeOfDate: "start" | "end";
    value: string;
    setStartDateFilter: Dispatch<SetStateAction<string>>;
    setEndDateFilter: Dispatch<SetStateAction<string>>;
    schema: z.ZodTypeAny;
    endDateFilter: string;
    startDateFilter: string;
    setIncompatibleDatesError: Dispatch<SetStateAction<boolean>>;
};

export const handleDateFilterUpdate = (dateFilterProps: HandleDateFilterProps) => {
    if (dateFilterProps.typeOfDate === "start") {
        const { success } = dateFilterProps.schema.safeParse(dateFilterProps.value);
        if (success) {
            dateFilterProps.setStartDateFilter(dateFilterProps.value);
        } else {
            dateFilterProps.setStartDateFilter("");
        }

        if (!!dateFilterProps.endDateFilter && success) {
            if (
                dateIsSameOrBeforeSecondDate(
                    getFormattedDate(dateFilterProps.value),
                    getFormattedDate(dateFilterProps.endDateFilter),
                )
            ) {
                dateFilterProps.setIncompatibleDatesError(false);
                dateFilterProps.setFilter({
                    ...dateFilterProps.filter,
                    period: { startTime: dateFilterProps.value, endTime: dateFilterProps.endDateFilter },
                });
            } else {
                dateFilterProps.setIncompatibleDatesError(true);
                dateFilterProps.setFilter({ ...dateFilterProps.filter, period: undefined });
            }
        } else {
            dateFilterProps.setFilter({ ...dateFilterProps.filter, period: undefined });
        }
    } else {
        const { success } = dateFilterProps.schema.safeParse(dateFilterProps.value);
        if (success) {
            dateFilterProps.setEndDateFilter(dateFilterProps.value);
        } else {
            dateFilterProps.setEndDateFilter("");
        }

        if (!!dateFilterProps.startDateFilter && success) {
            if (
                dateIsSameOrBeforeSecondDate(
                    getFormattedDate(dateFilterProps.startDateFilter),
                    getFormattedDate(dateFilterProps.value),
                )
            ) {
                dateFilterProps.setIncompatibleDatesError(false);
                dateFilterProps.setFilter({
                    ...dateFilterProps.filter,
                    period: { startTime: dateFilterProps.startDateFilter, endTime: dateFilterProps.value },
                });
            } else {
                dateFilterProps.setIncompatibleDatesError(true);
                dateFilterProps.setFilter({ ...dateFilterProps.filter, period: undefined });
            }
        } else {
            dateFilterProps.setFilter({ ...dateFilterProps.filter, period: undefined });
        }
    }
};

export const getContentPage = (pageNumber: number, contents: TableDisruption[]): TableDisruption[] => {
    const startPoint = (pageNumber - 1) * 10;
    const endPoint = pageNumber * 10;
    return contents.slice(startPoint, endPoint);
};

const formatContentsIntoRows = (contents: TableDisruption[], isTemplate: boolean): ContentTable[] => {
    return contents.map((content) => {
        const earliestPeriod: {
            startTime: string;
            endTime: string | null;
        } = content.validityPeriods[0];
        const latestPeriod: string | null = content.validityPeriods[content.validityPeriods.length - 1].endTime;

        return {
            id: (
                <Link
                    className="govuk-link"
                    href={
                        content.status === Progress.draft && !isTemplate
                            ? content.consequenceLength && content.consequenceLength > 0
                                ? {
                                      pathname: `${REVIEW_DISRUPTION_PAGE_PATH}/${content.id}`,
                                      query: {
                                          return: VIEW_ALL_DISRUPTIONS_PAGE_PATH,
                                      },
                                  }
                                : {
                                      pathname: `${TYPE_OF_CONSEQUENCE_PAGE_PATH}/${content.id}/0`,
                                      query: {
                                          return: VIEW_ALL_DISRUPTIONS_PAGE_PATH,
                                      },
                                  }
                            : {
                                  pathname: `${DISRUPTION_DETAIL_PAGE_PATH}/${content.id}`,
                                  query: isTemplate
                                      ? {
                                            return: VIEW_ALL_TEMPLATES_PAGE_PATH,
                                            template: "true",
                                        }
                                      : {
                                            return: VIEW_ALL_DISRUPTIONS_PAGE_PATH,
                                        },
                              }
                    }
                    key={content.id}
                >
                    {content.displayId}
                </Link>
            ),
            summary: content.summary,
            modes: content.modes.map((mode) => splitCamelCaseToString(mode)).join(", ") || "N/A",
            start: convertDateTimeToFormat(earliestPeriod.startTime),
            end: !!latestPeriod ? convertDateTimeToFormat(latestPeriod) : "No end time",
            severity: splitCamelCaseToString(content.severity),
            status: splitCamelCaseToString(content.status),
        };
    });
};

const columns: TableColumn<ContentTable>[] = [
    {
        displayName: "ID",
        key: "id",
        widthClass: "w-[10%]",
    },
    {
        displayName: "Summary",
        key: "summary",
        widthClass: "w-[30%]",
    },
    {
        displayName: "Modes",
        key: "modes",
        widthClass: "w-[10%]",
    },
    {
        displayName: "Start",
        key: "start",
        sortable: true,
        widthClass: "w-[13%]",
    },
    {
        displayName: "End",
        key: "end",
        sortable: true,
        widthClass: "w-[13%]",
    },
    {
        displayName: "Severity",
        key: "severity",
        widthClass: "w-[12%]",
    },
    {
        displayName: "Status",
        key: "status",
        widthClass: "w-[12%]",
    },
];

const setInitialFilters = (
    filter: Filter,
    setContentsToDisplay: Dispatch<SetStateAction<TableDisruption[]>>,
    contents: TableDisruption[],
) => {
    if (filterIsEmpty(filter)) {
        setContentsToDisplay(contents);
    } else {
        applyFiltersToContents(contents, setContentsToDisplay, filter);
    }
};

const ViewAllContents = ({
    newContentId,
    adminAreaCodes,
    filterStatus,
    enableLoadingSpinnerOnPageLoad = true,
    isTemplate = false,
    orgId,
}: ViewAllContentProps): ReactElement => {
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
    const [contentsToDisplay, setContentsToDisplay] = useState<TableDisruption[]>([]);
    const [contents, setContents] = useState<TableDisruption[]>([]);
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

    useEffect(() => {
        const fetchData = async () => {
            setLoadPage(true);

            const data = await getDisruptionData(orgId, isTemplate);

            setInitialFilters(filter, setContentsToDisplay, data);
            setContents(data);
            setLoadPage(false);
        };

        fetchData().catch(() => {
            setInitialFilters(filter, setContentsToDisplay, []);
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
        applyFiltersToContents(contents, setContentsToDisplay, { ...filter, services: selectedServices }); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedServices]);

    useEffect(() => {
        setFilter({ ...filter, searchText });
        applyFiltersToContents(contents, setContentsToDisplay, { ...filter, searchText }); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchText]);

    useEffect(() => {
        const filterOperatorsToSet: FilterOperator[] = [];
        selectedOperators.forEach((selOpNoc) => {
            const operator = operatorsList.find((op) => op.nocCode === selOpNoc.operatorNoc);
            if (operator) {
                filterOperatorsToSet.push({
                    operatorName: operator.operatorPublicName,
                    operatorRef: operator.nocCode,
                });
            }
        });

        setFilter({
            ...filter,
            operators: filterOperatorsToSet,
        });

        applyFiltersToContents(contents, setContentsToDisplay, { ...filter, operators: filterOperatorsToSet }); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedOperators]);

    useEffect(() => {
        setInitialFilters(filter, setContentsToDisplay, contents); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    useEffect(() => {
        const generatePdf = async () => {
            if (downloadPdf) {
                const parseDisruptions = exportDisruptionsSchema.safeParse(contentsToDisplay);
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
        const parseDisruptions = exportDisruptionsSchema.safeParse(contentsToDisplay);

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
                "publishStartDate",
                "publishEndDate",
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
        const parseDisruptions = exportDisruptionsSchema.safeParse(contentsToDisplay);

        const data = parseDisruptions.success ? parseDisruptions.data : [];

        const exportSchema: Schema<ExportDisruptionData> = getExportSchema();

        await writeXlsxFile(data, {
            schema: exportSchema,
            fileName: "Disruptions_list.xlsx",
        });
    };

    const setServicesAndOperators = async (adminAreaCodes: string[]) => {
        const [operators, servicesBodsData, servicesTndsData] = await Promise.all([
            fetchOperators({ adminAreaCodes: adminAreaCodes }),
            fetchServices({ adminAreaCodes: adminAreaCodes }),
            fetchServices({ adminAreaCodes: adminAreaCodes, dataSource: Datasource.tnds }),
        ]);

        const combinedServices = sortServices([
            ...filterServices(servicesBodsData),
            ...filterServices(servicesTndsData),
        ]);

        setOperatorsList(operators);
        setServicesList(combinedServices);
    };

    const cancelActionHandler = (): void => {
        setPopUpState(false);
    };

    return (
        <>
            {popUpState ? <ExportPopUp confirmHandler={exportHandler} closePopUp={cancelActionHandler} /> : null}
            {isTemplate ? (
                <h1 className="govuk-heading-xl">Templates</h1>
            ) : (
                <h1 className="govuk-heading-xl">View all disruptions</h1>
            )}
            <div>
                <Link
                    href={`/create-disruption/${newContentId}${isTemplate ? "?template=true" : ""}`}
                    role="button"
                    draggable="false"
                    className="govuk-button govuk-button--start"
                    data-module="govuk-button"
                    id="create-new-button"
                >
                    {isTemplate ? "Create new template" : "Create new disruption"}
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
                                setContentsToDisplay(contents);
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
                                setContentsToDisplay(contents);
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
                                ID/Summary
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
                    <OperatorSearch<FilterOperator>
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
                            disablePast={false}
                            inputName="disruptionStartDate"
                            stateUpdater={(value) => {
                                handleDateFilterUpdate({
                                    filter,
                                    setFilter,
                                    typeOfDate: "start",
                                    value,
                                    setStartDateFilter,
                                    setEndDateFilter,
                                    schema: validitySchema.shape.disruptionStartDate,
                                    endDateFilter,
                                    startDateFilter,
                                    setIncompatibleDatesError,
                                });
                                setClearButtonClicked(false);
                            }}
                            reset={clearButtonClicked}
                        />
                        <div className="ml-5">
                            <DateSelector
                                display="End date"
                                hint={{ hidden: true, text: "Enter in format DD/MM/YYYY" }}
                                value=""
                                disablePast={false}
                                inputName="disruptionEndDate"
                                stateUpdater={(value) => {
                                    handleDateFilterUpdate({
                                        filter,
                                        setFilter,
                                        typeOfDate: "end",
                                        value,
                                        setStartDateFilter,
                                        setEndDateFilter,
                                        schema: validitySchema.shape.disruptionEndDate,
                                        endDateFilter,
                                        startDateFilter,
                                        setIncompatibleDatesError,
                                    });
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
                        rows={formatContentsIntoRows(contentsToDisplay, isTemplate)}
                        sortFunction={sortFunction}
                    />
                </LoadingBox>
            ) : (
                <SortableTable
                    columns={columns}
                    rows={formatContentsIntoRows(contentsToDisplay, isTemplate)}
                    sortFunction={sortFunction}
                />
            )}
        </>
    );
};

export default memo(ViewAllContents);
