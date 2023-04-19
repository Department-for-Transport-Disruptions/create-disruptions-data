import dayjs from "dayjs";
import Link from "next/link";
import { ReactElement, useEffect, useRef, useState } from "react";
import { randomUUID } from "crypto";
import Table from "../components/form/Table";
import { BaseLayout } from "../components/layout/Layout";
import PageNumbers from "../components/PageNumbers";
import Tabs from "../components/Tabs";
import { getPublishedDisruptionsDataFromDynamo } from "../data/dynamo";
import { Validity } from "../schemas/create-disruption.schema";
import { Disruption } from "../schemas/disruption.schema";
import { reduceStringWithEllipsis, sortDisruptionsByStartDate } from "../utils";
import { convertDateTimeToFormat, getDate, getDatetimeFromDateAndTime, getFormattedDate } from "../utils/dates";

const title = "Create Disruptions Dashboard";
const description = "Create Disruptions Dashboard page for the Create Transport Disruptions Service";

export interface DashboardDisruption {
    id: string;
    summary: string;
    validityPeriods: {
        startTime: string;
        endTime: string | null;
        endingOnDate?: string | null;
    }[];
}

export interface DashboardProps {
    liveDisruptions: DashboardDisruption[];
    upcomingDisruptions: DashboardDisruption[];
    newDisruptionId: string;
}

const mapDisruptions = (disruptions: Disruption[]) => {
    return sortDisruptionsByStartDate(disruptions).map((disruption) => {
        return {
            id: disruption.disruptionId,
            summary: disruption.summary,
            validityPeriods: (disruption.validity || []).map((period) => ({
                startTime: getDatetimeFromDateAndTime(
                    period.disruptionStartDate,
                    period.disruptionStartTime,
                ).toISOString(),
                endTime:
                    period.disruptionEndDate && period.disruptionEndTime
                        ? getDatetimeFromDateAndTime(period.disruptionEndDate, period.disruptionEndTime).toISOString()
                        : null,
                endingOnDate:
                    period.disruptionRepeats !== "doesntRepeat"
                        ? period.disruptionDailyRepeatsEndDate
                            ? getFormattedDate(period.disruptionDailyRepeatsEndDate).toISOString()
                            : period.disruptionWeeklyRepeatsEndDate
                            ? getFormattedDate(period.disruptionWeeklyRepeatsEndDate).toISOString()
                            : null
                        : null,
            })),
        };
    });
};

const formatDisruptionsIntoRows = (disruptions: DashboardDisruption[], offset: number, test?: string) => {
    return disruptions.map((disruption, index) => {
        const earliestPeriod = disruption.validityPeriods[0];
        let maxEndDate = dayjs().subtract(100, "year");
        const latestPeriod = disruption.validityPeriods[disruption.validityPeriods.length - 1].endTime;
        if (latestPeriod) {
            disruption.validityPeriods.forEach((validity) => {
                const endDate = validity.endingOnDate ? dayjs(validity.endingOnDate) : dayjs(validity.endTime);

                if (endDate.isAfter(maxEndDate)) maxEndDate = endDate;
            });
        }

        const dateStrings = (
            <div key={earliestPeriod.startTime} className="pb-2 last:pb-0">
                {convertDateTimeToFormat(earliestPeriod.startTime)}{" "}
                {latestPeriod ? `- ${convertDateTimeToFormat(maxEndDate.toISOString())}` : " onwards"}
            </div>
        );

        return {
            header: (
                <Link className="govuk-link" href={`/review-disruption/${disruption.id}`} key={disruption.id}>
                    {index + 1 + offset}
                </Link>
            ),
            cells: [reduceStringWithEllipsis(disruption.summary, 150), dateStrings],
        };
    });
};

const getPageOfDisruptions = (pageNumber: number, disruptions: DashboardDisruption[]): DashboardDisruption[] => {
    const startPoint = (pageNumber - 1) * 10;
    const endPoint = pageNumber * 10;
    return disruptions.slice(startPoint, endPoint);
};

const Dashboard = ({ liveDisruptions, upcomingDisruptions, newDisruptionId }: DashboardProps): ReactElement => {
    const hasInitialised = useRef(false);
    const numberOfLiveDisruptionsPages = Math.ceil(liveDisruptions.length / 10);
    const numberOfUpcomingDisruptionsPages = Math.ceil(upcomingDisruptions.length / 10);
    const [currentLivePage, setCurrentLivePage] = useState(1);
    const [currentUpcomingPage, setCurrentUpcomingPage] = useState(1);
    const [liveDisruptionsToDisplay, setLiveDisruptionsToDisplay] = useState(
        getPageOfDisruptions(currentLivePage, liveDisruptions),
    );
    const [upcomingDisruptionsToDisplay, setUpcomingDisruptionsToDisplay] = useState(
        getPageOfDisruptions(currentUpcomingPage, upcomingDisruptions),
    );

    useEffect(() => {
        if (window.GOVUKFrontend && !hasInitialised.current) {
            window.GOVUKFrontend.initAll();
        }

        hasInitialised.current = true;
    });

    useEffect(() => {
        setLiveDisruptionsToDisplay(getPageOfDisruptions(currentLivePage, liveDisruptions));
    }, [currentLivePage, liveDisruptions]);

    useEffect(() => {
        setUpcomingDisruptionsToDisplay(getPageOfDisruptions(currentUpcomingPage, upcomingDisruptions));
    }, [currentUpcomingPage, upcomingDisruptions]);

    return (
        <BaseLayout title={title} description={description} errors={[]}>
            <h1 className="govuk-heading-xl">Dashboard</h1>
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

            <Tabs
                tabs={[
                    {
                        tabHeader: "Live",
                        content: (
                            <>
                                <Table
                                    caption="Live disruptions"
                                    columns={["ID", "Summary", "Affected dates"]}
                                    rows={formatDisruptionsIntoRows(
                                        liveDisruptionsToDisplay,
                                        (currentLivePage - 1) * 10,
                                    )}
                                />
                                <PageNumbers
                                    numberOfPages={numberOfLiveDisruptionsPages}
                                    currentPage={currentLivePage}
                                    setCurrentPage={setCurrentLivePage}
                                />
                            </>
                        ),
                    },
                    {
                        tabHeader: "Upcoming",
                        content: (
                            <>
                                <Table
                                    caption="Upcoming disruptions"
                                    columns={["ID", "Summary", "Affected dates"]}
                                    rows={formatDisruptionsIntoRows(
                                        upcomingDisruptionsToDisplay,
                                        (currentUpcomingPage - 1) * 10,
                                        "testing",
                                    )}
                                />
                                <PageNumbers
                                    numberOfPages={numberOfUpcomingDisruptionsPages}
                                    currentPage={currentUpcomingPage}
                                    setCurrentPage={setCurrentUpcomingPage}
                                />
                            </>
                        ),
                    },
                ]}
                tabsTitle="Disruptions"
            />

            <Link className="govuk-link" href="/view-all-disruptions">
                <h2 className="govuk-heading-s text-govBlue">View all disruptions</h2>
            </Link>

            <Link className="govuk-link" href="/dashboard">
                <h2 className="govuk-heading-s text-govBlue">View all social media</h2>
            </Link>

            <Link className="govuk-link" href="/dashboard">
                <h2 className="govuk-heading-s text-govBlue">Draft disruptions</h2>
            </Link>

            <div className="govuk-!-padding-top-5">
                <h2 className="govuk-heading-s">Reviews</h2>
                <p className="govuk-body">You have nothing to review</p>
                <Link className="govuk-link" href="/dashboard">
                    <h2 className="govuk-heading-s text-govBlue">View all</h2>
                </Link>
            </div>
        </BaseLayout>
    );
};

export const getServerSideProps = async (): Promise<{ props: DashboardProps }> => {
    const data = await getPublishedDisruptionsDataFromDynamo();

    if (data) {
        const liveDisruptions: Disruption[] = [];
        const upcomingDisruptions: Disruption[] = [];
        const today = getDate();

        data.forEach((disruption) => {
            // end time before today --> dont show
            const validityPeriods: Validity[] = [
                ...(disruption.validity ?? []),
                {
                    disruptionStartDate: disruption.disruptionStartDate,
                    disruptionStartTime: disruption.disruptionStartTime,
                    disruptionEndDate: disruption.disruptionEndDate,
                    disruptionEndTime: disruption.disruptionEndTime,
                    disruptionNoEndDateTime: disruption.disruptionNoEndDateTime,
                    disruptionRepeats: disruption.disruptionRepeats,
                    disruptionDailyRepeatsEndDate: disruption.disruptionDailyRepeatsEndDate,
                    disruptionWeeklyRepeatsEndDate: disruption.disruptionWeeklyRepeatsEndDate,
                },
            ];
            const shouldNotDisplayDisruption = validityPeriods.every(
                (period) =>
                    !!period.disruptionEndDate &&
                    !!period.disruptionEndTime &&
                    getDatetimeFromDateAndTime(period.disruptionEndDate, period.disruptionEndTime).isBefore(today),
            );

            if (!shouldNotDisplayDisruption) {
                // as long as start time is NOT after today AND (end time is TODAY or AFTER TODAY) OR (no end time) --> LIVE
                const isLive = validityPeriods.some((period) => {
                    const startTime = getDatetimeFromDateAndTime(
                        period.disruptionStartDate,
                        period.disruptionStartTime,
                    );

                    return (
                        startTime.isSameOrBefore(today) &&
                        (!period.disruptionEndDate ||
                            (!!period.disruptionEndDate &&
                                !!period.disruptionEndTime &&
                                getDatetimeFromDateAndTime(
                                    period.disruptionEndDate,
                                    period.disruptionEndTime,
                                ).isSameOrAfter(today)))
                    );
                });

                if (isLive) {
                    liveDisruptions.push(disruption);
                }

                // start time after today --> upcoming
                const isUpcoming = validityPeriods.every((period) =>
                    getDatetimeFromDateAndTime(period.disruptionStartDate, period.disruptionStartTime).isAfter(today),
                );

                if (isUpcoming) {
                    upcomingDisruptions.push(disruption);
                }
            }
        });

        return {
            props: {
                liveDisruptions: mapDisruptions(liveDisruptions),
                upcomingDisruptions: mapDisruptions(upcomingDisruptions),
                newDisruptionId: randomUUID(),
            },
        };
    }

    return {
        props: {
            liveDisruptions: [],
            upcomingDisruptions: [],
            newDisruptionId: randomUUID(),
        },
    };
};

export default Dashboard;
