import { NextPageContext } from "next";
import Link from "next/link";
import { ReactElement, useEffect, useRef, useState } from "react";
import { randomUUID } from "crypto";
import Table from "../components/form/Table";
import { BaseLayout } from "../components/layout/Layout";
import PageNumbers from "../components/PageNumbers";
import Tabs from "../components/Tabs";
import { DASHBOARD_PAGE_PATH, VIEW_ALL_DISRUPTIONS_PAGE_PATH } from "../constants";
import { getPendingDisruptionsIdsFromDynamo, getPublishedDisruptionsDataFromDynamo } from "../data/dynamo";
import { Validity } from "../schemas/create-disruption.schema";
import { Disruption } from "../schemas/disruption.schema";
import { getSortedDisruptionFinalEndDate, reduceStringWithEllipsis, sortDisruptionsByStartDate } from "../utils";
import { canPublish, getSessionWithOrgDetail } from "../utils/apiUtils/auth";
import { convertDateTimeToFormat, getDate, getDatetimeFromDateAndTime, isLiveDisruption } from "../utils/dates";
import logger from "../utils/logger";

const title = "Create Disruptions Dashboard";
const description = "Create Disruptions Dashboard page for the Create Transport Disruptions Service";

export interface DashboardDisruption {
    id: string;
    summary: string;
    validityPeriods: {
        startTime: string;
        endTime: string | null;
    }[];
}

export interface DashboardProps {
    liveDisruptions: DashboardDisruption[];
    upcomingDisruptions: DashboardDisruption[];
    recentlyClosedDisruptions: DashboardDisruption[];
    newDisruptionId: string;
    pendingApprovalCount?: number;
    canPublish: boolean;
    orgName: string;
}

const mapDisruptions = (disruptions: Disruption[]) => {
    return sortDisruptionsByStartDate(disruptions).map((disruption) => {
        const maxEndDate = getSortedDisruptionFinalEndDate(disruption);

        return {
            id: disruption.disruptionId,
            summary: disruption.summary,
            validityPeriods: (disruption.validity || []).map((period) => ({
                startTime: getDatetimeFromDateAndTime(
                    period.disruptionStartDate,
                    period.disruptionStartTime,
                ).toISOString(),
                endTime: maxEndDate ? maxEndDate.toISOString() : null,
            })),
        };
    });
};

const formatDisruptionsIntoRows = (disruptions: DashboardDisruption[], offset: number) => {
    return disruptions.map((disruption, index) => {
        const earliestPeriod = disruption.validityPeriods[0];
        const latestPeriod = disruption.validityPeriods[disruption.validityPeriods.length - 1].endTime;

        const dateStrings = (
            <div key={earliestPeriod.startTime} className="pb-2 last:pb-0">
                {convertDateTimeToFormat(earliestPeriod.startTime)}{" "}
                {latestPeriod ? `- ${convertDateTimeToFormat(latestPeriod)}` : " onwards"}
            </div>
        );

        return {
            header: (
                <Link
                    className="govuk-link"
                    href={{
                        pathname: `/disruption-detail/${disruption.id}`,
                        query: { return: DASHBOARD_PAGE_PATH },
                    }}
                    key={disruption.id}
                >
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

const Dashboard = ({
    liveDisruptions,
    upcomingDisruptions,
    recentlyClosedDisruptions,
    newDisruptionId,
    pendingApprovalCount,
    canPublish,
    orgName,
}: DashboardProps): ReactElement => {
    const hasInitialised = useRef(false);
    const numberOfLiveDisruptionsPages = Math.ceil(liveDisruptions.length / 10);
    const numberOfUpcomingDisruptionsPages = Math.ceil(upcomingDisruptions.length / 10);
    const numberOfRecentlyClosedDisruptionsPages = Math.ceil(recentlyClosedDisruptions.length / 10);
    const [currentLivePage, setCurrentLivePage] = useState(1);
    const [currentUpcomingPage, setCurrentUpcomingPage] = useState(1);
    const [currentRecentlyClosedPage, setCurrentRecentlyClosedPage] = useState(1);
    const [liveDisruptionsToDisplay, setLiveDisruptionsToDisplay] = useState(
        getPageOfDisruptions(currentLivePage, liveDisruptions),
    );
    const [upcomingDisruptionsToDisplay, setUpcomingDisruptionsToDisplay] = useState(
        getPageOfDisruptions(currentUpcomingPage, upcomingDisruptions),
    );
    const [recentlyClosedDisruptionsToDisplay, setRecentlyClosedToDisplay] = useState(
        getPageOfDisruptions(currentRecentlyClosedPage, recentlyClosedDisruptions),
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

    useEffect(() => {
        setRecentlyClosedToDisplay(getPageOfDisruptions(currentRecentlyClosedPage, recentlyClosedDisruptions));
    }, [currentRecentlyClosedPage, recentlyClosedDisruptions]);

    return (
        <BaseLayout title={title} description={description} errors={[]}>
            <h1 className="govuk-heading-xl">{orgName} disruptions data</h1>
            {pendingApprovalCount && pendingApprovalCount > 0 && canPublish ? (
                <div className="govuk-warning-text">
                    <span className="govuk-warning-text__icon" aria-hidden="true">
                        !
                    </span>
                    <strong className="govuk-warning-text__text">
                        <span className="govuk-warning-text__assistive">Warning</span>
                        You have {pendingApprovalCount} new disruption{pendingApprovalCount > 1 ? "s" : ""} that require
                        {pendingApprovalCount === 1 ? "s" : ""} approval.
                        <Link
                            className="govuk-link"
                            href={{
                                pathname: VIEW_ALL_DISRUPTIONS_PAGE_PATH,
                                query: {
                                    pending: true,
                                },
                            }}
                        >
                            <h2 className="govuk-heading-s text-govBlue">View all</h2>
                        </Link>
                    </strong>
                </div>
            ) : null}
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
                                    caption={{ text: "Live disruptions", size: "l" }}
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
                                    caption={{ text: "Upcoming disruptions", size: "l" }}
                                    columns={["ID", "Summary", "Affected dates"]}
                                    rows={formatDisruptionsIntoRows(
                                        upcomingDisruptionsToDisplay,
                                        (currentUpcomingPage - 1) * 10,
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
                    {
                        tabHeader: "Recently closed",
                        content: (
                            <>
                                <Table
                                    caption={{ text: "Closed disruptions", size: "l" }}
                                    columns={["ID", "Summary", "Affected dates"]}
                                    rows={formatDisruptionsIntoRows(
                                        recentlyClosedDisruptionsToDisplay,
                                        (currentRecentlyClosedPage - 1) * 10,
                                    )}
                                />
                                <PageNumbers
                                    numberOfPages={numberOfRecentlyClosedDisruptionsPages}
                                    currentPage={currentRecentlyClosedPage}
                                    setCurrentPage={setCurrentRecentlyClosedPage}
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
        </BaseLayout>
    );
};

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: DashboardProps }> => {
    const baseProps = {
        props: {
            liveDisruptions: [],
            upcomingDisruptions: [],
            recentlyClosedDisruptions: [],
            newDisruptionId: randomUUID(),
            canPublish: false,
            orgName: "",
        },
    };

    if (!ctx.req) {
        return baseProps;
    }

    const sessionWithOrg = await getSessionWithOrgDetail(ctx.req);
    if (!sessionWithOrg) {
        return baseProps;
    }

    logger.info("here on the dashboard");
    const data = await Promise.all([
        getPublishedDisruptionsDataFromDynamo(sessionWithOrg.orgId),
        getPendingDisruptionsIdsFromDynamo(sessionWithOrg.orgId),
    ]);

    const publishedDisruption = data[0];
    const pendingDisruption = data[1];

    if (publishedDisruption) {
        const liveDisruptions: Disruption[] = [];
        const upcomingDisruptions: Disruption[] = [];
        const recentlyClosedDisruptions: Disruption[] = [];
        const today = getDate();
        const pendingApprovalCount = pendingDisruption.size;

        publishedDisruption
            .filter((data) => !pendingDisruption.has(data.disruptionId))
            .forEach((disruption) => {
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
                        disruptionRepeatsEndDate: disruption.disruptionRepeatsEndDate,
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
                    const isLive = isLiveDisruption(validityPeriods);

                    if (isLive) {
                        liveDisruptions.push(disruption);
                    }

                    // start time after today --> upcoming
                    const isUpcoming = validityPeriods.every((period) =>
                        getDatetimeFromDateAndTime(period.disruptionStartDate, period.disruptionStartTime).isAfter(
                            today,
                        ),
                    );

                    if (isUpcoming) {
                        upcomingDisruptions.push(disruption);
                    }
                } else {
                    const getEndDateTime = getSortedDisruptionFinalEndDate({
                        ...disruption,
                        validity: validityPeriods,
                    });

                    const isRecentlyClosed = !!getEndDateTime && getEndDateTime.isAfter(today.subtract(7, "day"));

                    if (isRecentlyClosed) recentlyClosedDisruptions.push(disruption);
                }
            });

        return {
            props: {
                liveDisruptions: mapDisruptions(liveDisruptions),
                upcomingDisruptions: mapDisruptions(upcomingDisruptions),
                recentlyClosedDisruptions: mapDisruptions(recentlyClosedDisruptions),
                newDisruptionId: randomUUID(),
                pendingApprovalCount: pendingApprovalCount,
                canPublish: canPublish(sessionWithOrg),
                orgName: sessionWithOrg.orgName,
            },
        };
    }

    return baseProps;
};

export default Dashboard;
