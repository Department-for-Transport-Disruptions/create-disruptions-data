import { randomUUID } from "crypto";
import { LoadingBox } from "@govuk-react/loading-box";
import { NextPageContext } from "next";
import Link from "next/link";
import { ReactElement, useEffect, useRef, useState } from "react";
import { getDisruptionData } from "../components/ViewAllContents";
import Table from "../components/form/Table";
import Warning from "../components/form/Warning";
import { BaseLayout } from "../components/layout/Layout";
import PageNumbers from "../components/layout/PageNumbers";
import Tabs from "../components/layout/Tabs";
import { DASHBOARD_PAGE_PATH, VIEW_ALL_DISRUPTIONS_PAGE_PATH } from "../constants";
import { getPendingApprovalCount } from "../data/db";
import { TableDisruption } from "../schemas/disruption.schema";
import { reduceStringWithEllipsis } from "../utils";
import { canPublish, getSessionWithOrgDetail } from "../utils/apiUtils/auth";
import { convertDateTimeToFormat } from "../utils/dates";

const title = "Create Disruptions Dashboard";
const description = "Create Disruptions Dashboard page for the Create Transport Disruptions Service";

export interface DashboardProps {
    newDisruptionId: string;
    canPublish: boolean;
    orgName: string;
    orgId: string;
    pendingApprovalCount: number;
    isOperatorUser: boolean;
    enableLoadingSpinnerOnPageLoad?: boolean;
}

const formatContentsIntoRows = (disruptions: TableDisruption[]) => {
    return disruptions.map((disruption) => {
        const dateStrings = (
            <div key={disruption.id} className="pb-2 last:pb-0">
                {convertDateTimeToFormat(disruption.validityStartTimestamp)}{" "}
                {disruption.validityEndTimestamp
                    ? `- ${convertDateTimeToFormat(disruption.validityEndTimestamp)}`
                    : " onwards"}
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

const getPageOfDisruptions = (pageNumber: number, disruptions: TableDisruption[]): TableDisruption[] => {
    const startPoint = (pageNumber - 1) * 10;
    const endPoint = pageNumber * 10;
    return disruptions.slice(startPoint, endPoint);
};

const getNumberOfPages = (disruptions: TableDisruption[]) => Math.ceil(disruptions.length / 10);

const Dashboard = ({
    newDisruptionId,
    canPublish,
    orgName,
    orgId,
    pendingApprovalCount,
    isOperatorUser = false,
    enableLoadingSpinnerOnPageLoad = true,
}: DashboardProps): ReactElement => {
    const hasInitialised = useRef(false);
    const [currentLivePage, setCurrentLivePage] = useState(1);
    const [currentUpcomingPage, setCurrentUpcomingPage] = useState(1);
    const [currentRecentlyClosedPage, setCurrentRecentlyClosedPage] = useState(1);
    const [liveDisruptions, setLiveDisruptions] = useState<TableDisruption[]>([]);
    const [upcomingDisruptions, setUpcomingDisruptions] = useState<TableDisruption[]>([]);
    const [recentlyClosedDisruptions, setRecentlyClosedDisruptions] = useState<TableDisruption[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            await Promise.all([
                setLiveDisruptions(await getDisruptionData(orgId, "live")),
                setUpcomingDisruptions(await getDisruptionData(orgId, "upcoming")),
                setRecentlyClosedDisruptions(await getDisruptionData(orgId, "recentlyClosed")),
            ]);
        };

        fetchData()
            .then(() => setIsLoading(false))
            .catch(() => {
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        if (window.GOVUKFrontend && !hasInitialised.current) {
            window.GOVUKFrontend.initAll();
        }

        hasInitialised.current = true;
    });

    return (
        <BaseLayout title={title} description={description} errors={[]} disableBackButton>
            <h1 className="govuk-heading-xl">{orgName} disruptions data</h1>
            {pendingApprovalCount && pendingApprovalCount > 0 && canPublish && !isOperatorUser ? (
                <Warning
                    text={`You have ${pendingApprovalCount} new disruption${pendingApprovalCount > 1 ? "s" : ""} that require${pendingApprovalCount === 1 ? "s" : ""} approval.`}
                >
                    <br />
                    <Link
                        className="govuk-link text-govBlue text-xl font-bold"
                        href={{
                            pathname: VIEW_ALL_DISRUPTIONS_PAGE_PATH,
                            query: {
                                pending: true,
                            },
                        }}
                    >
                        View all
                    </Link>
                </Warning>
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
                        content: enableLoadingSpinnerOnPageLoad ? (
                            <LoadingBox loading={isLoading}>
                                <Table
                                    caption={{ text: "Live disruptions", size: "l" }}
                                    columns={["ID", "Summary", "Affected dates"]}
                                    rows={formatContentsIntoRows(
                                        getPageOfDisruptions(currentLivePage, liveDisruptions),
                                    )}
                                />
                                <PageNumbers
                                    numberOfPages={getNumberOfPages(liveDisruptions)}
                                    currentPage={currentLivePage}
                                    setCurrentPage={setCurrentLivePage}
                                />
                            </LoadingBox>
                        ) : (
                            <>
                                <Table
                                    caption={{ text: "Live disruptions", size: "l" }}
                                    columns={["ID", "Summary", "Affected dates"]}
                                    rows={formatContentsIntoRows(
                                        getPageOfDisruptions(currentLivePage, liveDisruptions),
                                    )}
                                />
                                <PageNumbers
                                    numberOfPages={getNumberOfPages(liveDisruptions)}
                                    currentPage={currentLivePage}
                                    setCurrentPage={setCurrentLivePage}
                                />
                            </>
                        ),
                    },
                    {
                        tabHeader: "Upcoming",
                        content: enableLoadingSpinnerOnPageLoad ? (
                            <LoadingBox loading={isLoading}>
                                <Table
                                    caption={{ text: "Upcoming disruptions", size: "l" }}
                                    columns={["ID", "Summary", "Affected dates"]}
                                    rows={formatContentsIntoRows(
                                        getPageOfDisruptions(currentUpcomingPage, upcomingDisruptions),
                                    )}
                                />
                                <PageNumbers
                                    numberOfPages={getNumberOfPages(upcomingDisruptions)}
                                    currentPage={currentUpcomingPage}
                                    setCurrentPage={setCurrentUpcomingPage}
                                />
                            </LoadingBox>
                        ) : (
                            <>
                                <Table
                                    caption={{ text: "Upcoming disruptions", size: "l" }}
                                    columns={["ID", "Summary", "Affected dates"]}
                                    rows={formatContentsIntoRows(
                                        getPageOfDisruptions(currentUpcomingPage, upcomingDisruptions),
                                    )}
                                />
                                <PageNumbers
                                    numberOfPages={getNumberOfPages(upcomingDisruptions)}
                                    currentPage={currentUpcomingPage}
                                    setCurrentPage={setCurrentUpcomingPage}
                                />
                            </>
                        ),
                    },
                    {
                        tabHeader: "Recently closed",
                        content: enableLoadingSpinnerOnPageLoad ? (
                            <LoadingBox loading={isLoading}>
                                <Table
                                    caption={{ text: "Closed disruptions", size: "l" }}
                                    columns={["ID", "Summary", "Affected dates"]}
                                    rows={formatContentsIntoRows(
                                        getPageOfDisruptions(currentRecentlyClosedPage, recentlyClosedDisruptions),
                                    )}
                                />
                                <PageNumbers
                                    numberOfPages={getNumberOfPages(recentlyClosedDisruptions)}
                                    currentPage={currentRecentlyClosedPage}
                                    setCurrentPage={setCurrentRecentlyClosedPage}
                                />
                            </LoadingBox>
                        ) : (
                            <>
                                <Table
                                    caption={{ text: "Closed disruptions", size: "l" }}
                                    columns={["ID", "Summary", "Affected dates"]}
                                    rows={formatContentsIntoRows(
                                        getPageOfDisruptions(currentRecentlyClosedPage, recentlyClosedDisruptions),
                                    )}
                                />
                                <PageNumbers
                                    numberOfPages={getNumberOfPages(recentlyClosedDisruptions)}
                                    currentPage={currentRecentlyClosedPage}
                                    setCurrentPage={setCurrentRecentlyClosedPage}
                                />
                            </>
                        ),
                    },
                ]}
                tabsTitle="Disruptions"
            />

            <div className="flex flex-col space-y-4">
                <Link className="govuk-link text-govBlue text-xl font-bold w-fit" href="/view-all-disruptions">
                    View all disruptions
                </Link>

                <Link className="govuk-link text-govBlue text-xl font-bold w-fit" href="/view-all-social-media">
                    View all social media
                </Link>

                <Link
                    className="govuk-link text-govBlue text-xl font-bold w-fit"
                    href="/view-all-disruptions?draft=true"
                >
                    Draft disruptions
                </Link>

                {!isOperatorUser && (
                    <Link className="govuk-link text-govBlue text-xl font-bold w-fit" href="/view-all-templates">
                        Templates
                    </Link>
                )}

                <Link className="govuk-link text-govBlue text-xl font-bold w-fit" href="/view-all-roadworks">
                    {isOperatorUser ? "View roadworks in your area" : "Create disruptions from roadworks in your area"}
                </Link>
            </div>
        </BaseLayout>
    );
};

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: DashboardProps }> => {
    const newDisruptionId = randomUUID();

    const baseProps = {
        newDisruptionId,
        canPublish: false,
        orgName: "",
        orgId: "",
        isOperatorUser: false,
        pendingApprovalCount: 0,
    };

    if (!ctx.req) {
        return {
            props: baseProps,
        };
    }

    const sessionWithOrg = await getSessionWithOrgDetail(ctx.req);
    if (!sessionWithOrg) {
        return {
            props: baseProps,
        };
    }

    return {
        props: {
            ...baseProps,
            orgId: sessionWithOrg.orgId,
            canPublish: canPublish(sessionWithOrg),
            orgName: sessionWithOrg.orgName,
            isOperatorUser: sessionWithOrg.isOperatorUser,
            pendingApprovalCount: await getPendingApprovalCount(sessionWithOrg.orgId),
        },
    };
};

export default Dashboard;
