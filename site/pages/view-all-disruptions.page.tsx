import { Progress, Severity } from "@create-disruptions-data/shared-ts/enums";
import Link from "next/link";
import { ReactElement, useEffect, useState } from "react";
import { randomUUID } from "crypto";
import Table from "../components/form/Table";
import { BaseLayout } from "../components/layout/Layout";
import PageNumbers from "../components/PageNumbers";
import { getPublishedDisruptionsDataFromDynamo } from "../data/dynamo";
import {
    sortDisruptionsByStartDate,
    splitCamelCaseToString,
    reduceStringWithEllipsis,
    mapValidityPeriods,
} from "../utils";
import { convertDateTimeToFormat } from "../utils/dates";

const title = "View All Disruptions";
const description = "View All Disruptions page for the Create Transport Disruptions Service";

export interface TableDisruption {
    id: string;
    summary: string;
    modes: string;
    validityPeriods: {
        startTime: string;
        endTime: string | null;
    }[];
    severity: string;
    status: string;
}

export interface ViewAllDisruptionsProps {
    disruptions: TableDisruption[];
    newDisruptionId: string;
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
                disruption.modes,
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

const ViewAllDisruptions = ({ disruptions, newDisruptionId }: ViewAllDisruptionsProps): ReactElement => {
    const numberOfDisruptionsPages = Math.ceil(disruptions.length / 10);
    const [currentPage, setCurrentPage] = useState(1);

    const [disruptionsToDisplay, setDisruptionsToDisplay] = useState(getPageOfDisruptions(currentPage, disruptions));

    useEffect(() => {
        setDisruptionsToDisplay(getPageOfDisruptions(currentPage, disruptions));
    }, [currentPage, disruptions]);

    return (
        <BaseLayout title={title} description={description} errors={[]}>
            <h1 className="govuk-heading-xl">View all disruptions</h1>
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

            <>
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
    const data = await getPublishedDisruptionsDataFromDynamo();

    if (data) {
        const sortedDisruptions = sortDisruptionsByStartDate(data);
        const shortenedData: TableDisruption[] = sortedDisruptions.map((disruption) => {
            const modes: string[] = [];
            const severities: Severity[] = [];

            if (disruption.consequences) {
                disruption.consequences.forEach((consequence) => {
                    severities.push(consequence.disruptionSeverity);
                    modes.push(splitCamelCaseToString(consequence.vehicleMode));
                });
            }

            return {
                id: disruption.disruptionId,
                summary: reduceStringWithEllipsis(disruption.summary, 95),
                validityPeriods: mapValidityPeriods(disruption),
                modes: modes.join(", ") || "N/A",
                status: splitCamelCaseToString(Progress.open),
                severity: splitCamelCaseToString(getWorstSeverity(severities)),
            };
        });

        return {
            props: {
                disruptions: shortenedData,
                newDisruptionId: randomUUID(),
            },
        };
    }

    return {
        props: {
            disruptions: [],
            newDisruptionId: randomUUID(),
        },
    };
};

export default ViewAllDisruptions;
