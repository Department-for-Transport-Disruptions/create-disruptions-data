import { NextPageContext } from "next";
import Link from "next/link";
import { randomUUID } from "crypto";
import SortableTable, { TableColumn } from "../components/form/SortableTable";
import { BaseLayout } from "../components/layout/Layout";
import Tabs from "../components/layout/Tabs";
import { CREATE_DISRUPTION_PAGE_PATH } from "../constants";
import { getSessionWithOrgDetail } from "../utils/apiUtils/auth";

const title = "View All Roadworks";
const description = "View All Roadworks page for the Create Transport Disruptions Service";
export interface Roadwork {
    id: string;
    proposedStartDateTime: string;
    proposedEndDateTime: string;
    actualStartDateTime: string;
    actualEndDateTime: string;
    workStatus: string;
    streetName: string;
}

export interface ViewAllRoadworksProps {
    liveRoadworks: Roadwork[];
    newDisruptionId: string;
}

export interface RoadworksTable {
    datesAffected: string;
    description: string;
    action: JSX.Element;
}
const columns: TableColumn<RoadworksTable>[] = [
    {
        displayName: "Dates affected",
        key: "datesAffected",
        widthClass: "w-[1=20%]",
    },
    {
        displayName: "Description",
        key: "description",
        widthClass: "w-[1=60%]",
    },
    {
        displayName: "Action",
        key: "action",
        widthClass: "w-[1=20%]",
    },
];

const mockRoadworkData: RoadworksTable[] = [
    {
        datesAffected: "01/12/2023 - 15/12/2023",
        description: "Corporation street - Utility repair and maintenance work",
        action: (
            <Link className="govuk-link" href={CREATE_DISRUPTION_PAGE_PATH}>
                Create disruption
            </Link>
        ),
    },
    {
        datesAffected: "01/12/2023 - 15/12/2023",
        description: "My description",
        action: (
            <Link className="govuk-link" href={CREATE_DISRUPTION_PAGE_PATH}>
                View disruption
            </Link>
        ),
    },
];

const formatRows = (roadworks: Roadwork[]) => {
    return roadworks.map((roadwork) => {
        return { datesAffect: `${roadwork.actualStartDateTime}` };
    });
};

const ViewAllRoadworks = () => {
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
                                    rows={mockRoadworkData}
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
    const newDisruptionId = randomUUID();

    const baseProps = {
        props: {
            newDisruptionId,
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

    return {
        props: {
            newDisruptionId,
            liveRoadworks: [],
        },
    };
};

export default ViewAllRoadworks;
