import { Disruption, Validity } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { sortDisruptionsByStartDate, getSortedDisruptionFinalEndDate } from "@create-disruptions-data/shared-ts/utils";
import { getDate, getDatetimeFromDateAndTime } from "@create-disruptions-data/shared-ts/utils/dates";
import { NextPageContext } from "next";
import Link from "next/link";
import { ReactElement, useEffect, useRef, useState } from "react";
import { randomUUID } from "crypto";
import Table from "../components/form/Table";
import { BaseLayout } from "../components/layout/Layout";
import PageNumbers from "../components/layout/PageNumbers";
import Tabs from "../components/layout/Tabs";
import { DASHBOARD_PAGE_PATH, STAGE, VIEW_ALL_DISRUPTIONS_PAGE_PATH } from "../constants";
import { getPendingDisruptionsIdsFromDynamo, getPublishedDisruptionsDataFromDynamo } from "../data/dynamo";
import { filterDisruptionsForOperatorUser, reduceStringWithEllipsis } from "../utils";
import { canPublish, getSessionWithOrgDetail } from "../utils/apiUtils/auth";
import { convertDateTimeToFormat, isLiveDisruption, isUpcomingDisruption } from "../utils/dates";

const title = "Create Disruptions Dashboard";
const description = "Create Disruptions Dashboard page for the Create Transport Disruptions Service";

export interface DashboardDisruption {
    id: string;
    summary: string;
    validityPeriods: {
        startTime: string;
        endTime: string | null;
    }[];
    displayId: string;
}

export interface DashboardProps {
    liveDisruptions: DashboardDisruption[];
    upcomingDisruptions: DashboardDisruption[];
    recentlyClosedDisruptions: DashboardDisruption[];
    newDisruptionId: string;
    pendingApprovalCount?: number;
    canPublish: boolean;
    orgName: string;
    isOperatorUser: boolean;
    stage: string;
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
            displayId: disruption.displayId,
        };
    });
};

const formatContentsIntoRows = (disruptions: DashboardDisruption[]) => {
    return disruptions.map((disruption) => {
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
                    {disruption.displayId ? disruption.displayId : ""}
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
    isOperatorUser = false,
    stage,
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
        <BaseLayout title={title} description={description} errors={[]} disableBackButton>
            <h1 className="govuk-heading-xl">{orgName} disruptions data</h1>
            {pendingApprovalCount && pendingApprovalCount > 0 && canPublish && !isOperatorUser ? (
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
                                    rows={formatContentsIntoRows(liveDisruptionsToDisplay)}
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
                                    rows={formatContentsIntoRows(upcomingDisruptionsToDisplay)}
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
                                    rows={formatContentsIntoRows(recentlyClosedDisruptionsToDisplay)}
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

            <Link className="govuk-link" href="/view-all-social-media">
                <h2 className="govuk-heading-s text-govBlue">View all social media</h2>
            </Link>

            <Link className="govuk-link" href="/view-all-disruptions?draft=true">
                <h2 className="govuk-heading-s text-govBlue">Draft disruptions</h2>
            </Link>
            {!isOperatorUser && (
                <Link className="govuk-link" href="/view-all-templates">
                    <h2 className="govuk-heading-s text-govBlue">Templates</h2>
                </Link>
            )}
            {stage !== "prod" && stage !== "preprod" && (
                <Link className="govuk-link" href="/view-all-roadworks">
                    <h2 className="govuk-heading-s text-govBlue">Create disruptions from roadworks in your area</h2>
                </Link>
            )}
        </BaseLayout>
    );
};

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: DashboardProps }> => {
    const newDisruptionId = randomUUID();

    const baseProps = {
        props: {
            liveDisruptions: [],
            upcomingDisruptions: [],
            recentlyClosedDisruptions: [],
            newDisruptionId,
            canPublish: false,
            orgName: "",
            isOperatorUser: false,
            stage: "dev",
        },
    };

    if (!ctx.req) {
        return baseProps;
    }

    const sessionWithOrg = await getSessionWithOrgDetail(ctx.req);
    if (!sessionWithOrg) {
        return baseProps;
    }

    const data = await Promise.all([
        getPublishedDisruptionsDataFromDynamo(sessionWithOrg.orgId),
        getPendingDisruptionsIdsFromDynamo(sessionWithOrg.orgId),
    ]);

    let publishedDisruption = data[0];
    const pendingDisruption = data[1];

    if (sessionWithOrg.isOperatorUser) {
        publishedDisruption = filterDisruptionsForOperatorUser(publishedDisruption, sessionWithOrg.operatorOrgId);
    }

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

                const getEndDateTime = getSortedDisruptionFinalEndDate({
                    ...disruption,
                    validity: validityPeriods,
                });

                if (!shouldNotDisplayDisruption) {
                    // Between when the first validity period has started and the last validity has yet to end
                    const isLive = isLiveDisruption(validityPeriods, getEndDateTime);

                    if (isLive) {
                        liveDisruptions.push(disruption);
                    }

                    // Prior to the first validity period starting
                    const isUpcoming = isUpcomingDisruption(validityPeriods, today);

                    if (isUpcoming) {
                        upcomingDisruptions.push(disruption);
                    }
                } else {
                    // Up to 7 days after the last validity period has ended
                    const isRecentlyClosed = !!getEndDateTime && getEndDateTime.isAfter(today.subtract(7, "day"));

                    if (isRecentlyClosed) recentlyClosedDisruptions.push(disruption);
                }
            });

        return {
            props: {
                liveDisruptions: mapDisruptions(liveDisruptions),
                upcomingDisruptions: mapDisruptions(upcomingDisruptions),
                recentlyClosedDisruptions: mapDisruptions(recentlyClosedDisruptions),
                newDisruptionId,
                pendingApprovalCount: pendingApprovalCount,
                canPublish: canPublish(sessionWithOrg),
                orgName: sessionWithOrg.orgName,
                isOperatorUser: sessionWithOrg.isOperatorUser,
                stage: STAGE,
            },
        };
    }

    return baseProps;
};

export default Dashboard;
