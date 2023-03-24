import Link from "next/link";
import { ReactElement, useEffect, useRef } from "react";
import Table from "../components/form/Table";
import { BaseLayout } from "../components/layout/Layout";
import Tabs from "../components/Tabs";
import { getDisruptionsDataFromDynamo } from "../data/dynamo";
import { convertDateTimeToFormat, getDate } from "../utils/dates";

const title = "Create Disruptions Dashboard";
const description = "Create Disruptions Dashboard page for the Create Transport Disruptions Service";

export interface DashboardDisruption {
    id: string;
    summary: string;
    validityPeriod: {
        startTime: string;
        endTime: string | null;
    }[];
}

export interface DashboardProps {
    liveDisruptions: DashboardDisruption[];
    upcomingDisruptions: DashboardDisruption[];
}

const formatDisruptionsIntoRows = (disruptions: DashboardDisruption[]) => {
    return disruptions.map((disruption) => {
        const dateStrings = disruption.validityPeriod.map((period) => (
            <div key={period.startTime} className="pb-2 last:pb-0">
                {convertDateTimeToFormat(period.startTime)}{" "}
                {period.endTime ? `- ${convertDateTimeToFormat(period.endTime)}` : " onwards"}
            </div>
        ));

        return {
            header: (
                <Link className="govuk-link" href="/dashboard">
                    {disruption.id}
                </Link>
            ),
            cells: [disruption.summary, dateStrings],
        };
    });
};

const Dashboard = ({ liveDisruptions, upcomingDisruptions }: DashboardProps): ReactElement => {
    const hasInitialised = useRef(false);

    useEffect(() => {
        if (window.GOVUKFrontend && !hasInitialised.current) {
            window.GOVUKFrontend.initAll();
        }

        hasInitialised.current = true;
    });

    return (
        <BaseLayout title={title} description={description} errors={[]}>
            <h1 className="govuk-heading-xl">Dashboard</h1>
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

            <Tabs
                tabs={[
                    {
                        tabHeader: "Live",
                        content: (
                            <Table
                                caption="Live disruptions"
                                columns={["ID", "Summary", "Affected dates"]}
                                rows={formatDisruptionsIntoRows(liveDisruptions)}
                            />
                        ),
                    },
                    {
                        tabHeader: "Upcoming",
                        content: (
                            <Table
                                caption="Upcoming disruptions"
                                columns={["ID", "Summary", "Affected dates"]}
                                rows={formatDisruptionsIntoRows(upcomingDisruptions)}
                            />
                        ),
                    },
                ]}
                tabsTitle="Disruptions"
            />
            <Link className="govuk-link" href="/dashboard">
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
    const data = await getDisruptionsDataFromDynamo();

    if (data) {
        const shortenedData: DashboardDisruption[] = data.map((entry) => {
            return {
                id: entry.SituationNumber,
                summary: entry.Summary,
                validityPeriod: entry.ValidityPeriod.map((period) => ({
                    startTime: period.StartTime,
                    endTime: period.EndTime || null,
                })),
            };
        });

        const liveDisruptions: DashboardDisruption[] = [];
        const upcomingDisruptions: DashboardDisruption[] = [];
        const today = getDate();

        shortenedData.forEach((disruption) => {
            // end time before today --> dont show
            const shouldNotDisplayDisruption = disruption.validityPeriod.every(
                (period) => !!period.endTime && getDate(period.endTime).isBefore(today),
            );

            if (!shouldNotDisplayDisruption) {
                // as long as start time is NOT after today AND (end time is TODAY or AFTER TODAY) OR (no end time) --> LIVE
                const isLive = disruption.validityPeriod.some((period) => {
                    const startTime = getDate(period.startTime);

                    return (
                        startTime.isSameOrBefore(today) &&
                        (!period.endTime || (!!period.endTime && getDate(period.endTime).isSameOrAfter(today)))
                    );
                });

                if (isLive) {
                    liveDisruptions.push(disruption);
                }

                // start time after today --> upcoming
                const isUpcoming = disruption.validityPeriod.every((period) =>
                    getDate(period.startTime).isAfter(today),
                );

                if (isUpcoming) {
                    upcomingDisruptions.push(disruption);
                }
            }
        });

        return {
            props: {
                liveDisruptions,
                upcomingDisruptions,
            },
        };
    }

    return {
        props: {
            liveDisruptions: [],
            upcomingDisruptions: [],
        },
    };
};

export default Dashboard;
