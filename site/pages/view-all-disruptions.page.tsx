import { Severity } from "@create-disruptions-data/shared-ts/enums";
import { PtSituationElement } from "@create-disruptions-data/shared-ts/siriTypes";
import Link from "next/link";
import { Dispatch, ReactElement, SetStateAction, useEffect, useState } from "react";
import { z } from "zod";
import Table from "../components/form/Table";
import { BaseLayout } from "../components/layout/Layout";
import PageNumbers from "../components/PageNumbers";
import ServiceSearch from "../components/ServiceSearch";
import { ADMIN_AREA_CODE, API_BASE_URL } from "../constants";
import { getDisruptionsDataFromDynamo } from "../data/dynamo";
import { Service, serviceSchema } from "../schemas/consequence.schema";
import { sortDisruptionsByStartDate, splitCamelCaseToString, reduceStringWithEllipsis } from "../utils";
import { convertDateTimeToFormat } from "../utils/dates";

const title = "View All Disruptions";
const description = "View All Disruptions page for the Create Transport Disruptions Service";

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
    operator: { operatorName: string; operatorRef: string } | null;
}

export interface ViewAllDisruptionsProps {
    disruptions: TableDisruption[];
    services: Service[];
}

interface Filter {
    services: Service[];
    startTime?: string;
    severity?: string;
    status?: string;
    operator?: { operatorName: string; operatorRef: string };
    mode?: string;
}

const formatDisruptionsIntoRows = (disruptions: TableDisruption[], offset: number) => {
    return disruptions.map((disruption, index) => {
        const earliestPeriod = disruption.validityPeriods[0];
        const latestPeriod = disruption.validityPeriods[disruption.validityPeriods.length - 1].endTime;

        return {
            header: (
                <Link className="govuk-link" href="/dashboard" key={disruption.id}>
                    {index + 1 + offset}
                </Link>
            ),
            cells: [
                disruption.summary,
                disruption.modes.join(", ") || "N/A",
                convertDateTimeToFormat(earliestPeriod.startTime),
                !!latestPeriod ? convertDateTimeToFormat(latestPeriod) : "No end time",
                disruption.severity,
                disruption.status,
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

const useFiltersOnDisruptions = (
    disruptions: TableDisruption[],
    setDisruptionsToDisplay: Dispatch<SetStateAction<TableDisruption[]>>,
    filter: Filter,
): void => {
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

    if (filter.operator) {
        disruptionsToDisplay = disruptionsToDisplay.filter(
            (disruption) => !!disruption.operator && disruption.operator.operatorRef === filter.operator?.operatorRef,
        );
    }
};

const ViewAllDisruptions = ({ disruptions, services }: ViewAllDisruptionsProps): ReactElement => {
    const numberOfDisruptionsPages = Math.ceil(disruptions.length / 10);
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedServices, setSelectedServices] = useState<Service[]>([]);
    const [filter, setFilter] = useState<Filter>({
        services: [],
    });

    const [disruptionsToDisplay, setDisruptionsToDisplay] = useState(getPageOfDisruptions(currentPage, disruptions));

    useEffect(() => {
        setDisruptionsToDisplay(getPageOfDisruptions(currentPage, disruptions));
    }, [currentPage, disruptions]);

    useEffect(() => {
        if (showFilters) {
            useFiltersOnDisruptions(disruptions, setDisruptionsToDisplay, filter);
        }
    }, [showFilters]);

    return (
        <BaseLayout title={title} description={description} errors={[]}>
            <h1 className="govuk-heading-xl">View all disruptions</h1>

            <Link
                href="/create-disruption"
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

            <button
                className="govuk-button govuk-button--secondary mt-2"
                data-module="govuk-button"
                onClick={() => setShowFilters(!showFilters)}
            >
                {showFilters ? "Hide" : "Show"} filters
            </button>

            {showFilters ? (
                <>
                    <ServiceSearch
                        services={services}
                        setSelectedServices={setSelectedServices}
                        selectedServices={selectedServices}
                    />
                </>
            ) : null}

            <>
                {selectedServices.map((service) => (
                    <p>{service.lineName}</p>
                ))}
                <Table
                    caption=""
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

    const data = await getDisruptionsDataFromDynamo();

    if (data) {
        const sortedDisruptions: PtSituationElement[] = sortDisruptionsByStartDate(data);
        const shortenedData: TableDisruption[] = sortedDisruptions.map((disruption) => {
            const modes: string[] = [];
            const severitys: Severity[] = [];
            const serviceLineRefs: string[] = [];
            let operator;

            if (disruption.Consequences) {
                disruption.Consequences.Consequence.forEach((consequence) => {
                    severitys.push(consequence.Severity);
                    if (!!consequence.Affects.Networks) {
                        modes.push(splitCamelCaseToString(consequence.Affects.Networks.AffectedNetwork.VehicleMode));
                    }

                    if (!!consequence.Affects.Networks?.AffectedNetwork.AffectedLine) {
                        serviceLineRefs.push(consequence.Affects.Networks.AffectedNetwork.AffectedLine.LineRef);
                        const affectedOperator =
                            consequence.Affects.Networks.AffectedNetwork.AffectedLine.AffectedOperator;
                        operator = {
                            operatorRef: affectedOperator.OperatorRef,
                            operatorName: affectedOperator.OperatorName || "",
                        };
                    }
                });
            }

            return {
                id: disruption.SituationNumber,
                summary: reduceStringWithEllipsis(disruption.Summary, 95),
                validityPeriods: disruption.ValidityPeriod.map((period) => ({
                    startTime: period.StartTime,
                    endTime: period.EndTime || null,
                })),
                modes,
                status: splitCamelCaseToString(disruption.Progress),
                severity: splitCamelCaseToString(getWorstSeverity(severitys)),
                serviceLineRefs,
                operator: !!operator ? operator : null,
            };
        });

        return {
            props: {
                disruptions: shortenedData,
                services,
            },
        };
    }

    return {
        props: {
            disruptions: [],
            services,
        },
    };
};

export default ViewAllDisruptions;
