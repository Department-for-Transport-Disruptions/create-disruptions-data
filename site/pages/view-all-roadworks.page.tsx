import { getDate, sortEarliestDate } from "@create-disruptions-data/shared-ts/utils/dates";
import { NextPageContext } from "next";
import Link from "next/link";
import SortableTable, { TableColumn } from "../components/form/SortableTable";
import { BaseLayout } from "../components/layout/Layout";
import Tabs from "../components/layout/Tabs";
import { fetchRoadworks } from "../data/refDataApi";
import { Roadwork } from "../schemas/roadwork.schema";
import { getSessionWithOrgDetail } from "../utils/apiUtils/auth";
import { convertDateTimeToFormat } from "../utils/dates";

const title = "View All Roadworks";
const description = "View All Roadworks page for the Create Transport Disruptions Service";

export interface ViewAllRoadworksProps {
    liveRoadworks: Roadwork[];
}

export interface RoadworksTable {
    datesAffected: string;
    description: JSX.Element;
}
const columns: TableColumn<RoadworksTable>[] = [
    {
        displayName: "Dates affected",
        key: "datesAffected",
        widthClass: "w-[1=30%]",
    },
    {
        displayName: "Description",
        key: "description",
        widthClass: "w-[1=70%]",
    },
];

const formatRows = (roadworks: Roadwork[]) => {
    return roadworks.map((roadwork) => {
        return {
            datesAffected: `${convertDateTimeToFormat(roadwork.actualStartDateTime ?? "")} - ${convertDateTimeToFormat(
                roadwork.proposedEndDateTime ?? "",
            )}`,
            description: (
                <Link
                    className="govuk-link"
                    href={`roadwork-detail/${encodeURIComponent(roadwork.permitReferenceNumber)}`}
                >
                    {roadwork.streetName?.toUpperCase()} - {roadwork.activityType}
                </Link>
            ),
        };
    });
};

const ViewAllRoadworks = ({ liveRoadworks }: ViewAllRoadworksProps) => {
    return (
        <BaseLayout title={title} description={description}>
            <h1 className="govuk-heading-xl">Roadworks in your area</h1>
            <Tabs
                tabs={[
                    {
                        tabHeader: "Live",
                        content: (
                            <>
                                <SortableTable
                                    columns={columns}
                                    rows={formatRows(liveRoadworks)}
                                    caption={{ text: "Recent live roadworks", size: "m" }}
                                />
                            </>
                        ),
                    },
                ]}
                tabsTitle={"Recent live roadworks"}
            />
        </BaseLayout>
    );
};

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: ViewAllRoadworksProps }> => {
    const baseProps = {
        props: {
            liveRoadworks: [],
        },
    };

    if (!ctx.req) {
        return baseProps;
    }

    const session = await getSessionWithOrgDetail(ctx.req);

    if (!session) {
        return baseProps;
    }

    const roadworks = await fetchRoadworks({ adminAreaCodes: session.adminAreaCodes });

    const liveRoadworks = roadworks
        .filter((roadwork) => roadwork.workStatus === "Works in progress" && !roadwork.actualEndDateTime)
        .sort((a, b) => {
            return sortEarliestDate(getDate(a.actualStartDateTime ?? ""), getDate(b.actualStartDateTime ?? ""));
        });

    return {
        props: {
            liveRoadworks: liveRoadworks,
        },
    };
};

export default ViewAllRoadworks;
