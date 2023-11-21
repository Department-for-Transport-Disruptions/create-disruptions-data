import { NextPageContext } from "next";
import Link from "next/link";
import { randomUUID } from "crypto";
import SortableTable, { TableColumn } from "../components/form/SortableTable";
import { BaseLayout } from "../components/layout/Layout";
import Tabs from "../components/layout/Tabs";
import { CREATE_DISRUPTION_PAGE_PATH } from "../constants";
import { getSessionWithOrgDetail } from "../utils/apiUtils/auth";
import { convertDateTimeToFormat } from "../utils/dates";

const title = "View All Roadworks";
const description = "View All Roadworks page for the Create Transport Disruptions Service";
export interface Roadwork {
    permitReferenceNumber: string;
    proposedStartDateTime: string;
    proposedEndDateTime: string;
    actualStartDateTime: string;
    actualEndDateTime: string;
    workStatus: string;
    streetName: string;
    trafficManagementType: string;
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

const mockRoadworks: Roadwork[] = [
    {
        permitReferenceNumber: "LM213MB10186822-01",
        actualStartDateTime: "2023-10-29T08:36:00.000Z",
        actualEndDateTime: "2023-11-01T00:00:00.000Z",
        proposedStartDateTime: "2023-10-29T08:36:00.000Z",
        proposedEndDateTime: "2023-11-01T00:00:00.000Z",
        streetName: "New Station Street",
        trafficManagementType: "Road closure",
        workStatus: "Works in progress",
    },
    {
        permitReferenceNumber: "LM213MB10186822-01",
        actualStartDateTime: "2023-10-01T08:36:00.000Z",
        actualEndDateTime: "2023-10-15T00:00:00.000Z",
        proposedStartDateTime: "2023-10-29T08:36:00.000Z",
        proposedEndDateTime: "2023-11-01T00:00:00.000Z",
        streetName: "Wellington Street",
        trafficManagementType: "Stop/go boards",
        workStatus: "Works in progress",
    },
    {
        permitReferenceNumber: "LM213MB10186822-01",
        actualStartDateTime: "2023-12-01T08:36:00.000Z",
        actualEndDateTime: "2023-12-10T00:00:00.000Z",
        proposedStartDateTime: "2023-10-29T08:36:00.000Z",
        proposedEndDateTime: "2023-11-01T00:00:00.000Z",
        streetName: "Call Lane",
        trafficManagementType: "Two way signals",
        workStatus: "Works in progress",
    },
    {
        permitReferenceNumber: "LM213MB10186822-01",
        actualStartDateTime: "2023-10-29T08:36:00.000Z",
        actualEndDateTime: "2023-11-01T00:00:00.000Z",
        proposedStartDateTime: "2023-10-29T08:36:00.000Z",
        proposedEndDateTime: "2023-11-01T00:00:00.000Z",
        streetName: "New Station Street",
        trafficManagementType: "Road closure",
        workStatus: "Works in progress",
    },
    {
        permitReferenceNumber: "LM213MB10186822-01",
        actualStartDateTime: "2023-10-01T08:36:00.000Z",
        actualEndDateTime: "2023-10-15T00:00:00.000Z",
        proposedStartDateTime: "2023-10-29T08:36:00.000Z",
        proposedEndDateTime: "2023-11-01T00:00:00.000Z",
        streetName: "Wellington Street",
        trafficManagementType: "Stop/go boards",
        workStatus: "Works in progress",
    },
    {
        permitReferenceNumber: "LM213MB10186822-01",
        actualStartDateTime: "2023-12-01T08:36:00.000Z",
        actualEndDateTime: "2023-12-10T00:00:00.000Z",
        proposedStartDateTime: "2023-10-29T08:36:00.000Z",
        proposedEndDateTime: "2023-11-01T00:00:00.000Z",
        streetName: "Call Lane",
        trafficManagementType: "Two way signals",
        workStatus: "Works in progress",
    },
    {
        permitReferenceNumber: "LM213MB10186822-01",
        actualStartDateTime: "2023-10-29T08:36:00.000Z",
        actualEndDateTime: "2023-11-01T00:00:00.000Z",
        proposedStartDateTime: "2023-10-29T08:36:00.000Z",
        proposedEndDateTime: "2023-11-01T00:00:00.000Z",
        streetName: "New Station Street",
        trafficManagementType: "Road closure",
        workStatus: "Works in progress",
    },
    {
        permitReferenceNumber: "LM213MB10186822-01",
        actualStartDateTime: "2023-10-01T08:36:00.000Z",
        actualEndDateTime: "2023-10-15T00:00:00.000Z",
        proposedStartDateTime: "2023-10-29T08:36:00.000Z",
        proposedEndDateTime: "2023-11-01T00:00:00.000Z",
        streetName: "Wellington Street",
        trafficManagementType: "Stop/go boards",
        workStatus: "Works in progress",
    },
    {
        permitReferenceNumber: "LM213MB10186822-01",
        actualStartDateTime: "2023-12-01T08:36:00.000Z",
        actualEndDateTime: "2023-12-10T00:00:00.000Z",
        proposedStartDateTime: "2023-10-29T08:36:00.000Z",
        proposedEndDateTime: "2023-11-01T00:00:00.000Z",
        streetName: "Call Lane",
        trafficManagementType: "Two way signals",
        workStatus: "Works in progress",
    },
    {
        permitReferenceNumber: "LM213MB10186822-01",
        actualStartDateTime: "2023-10-29T08:36:00.000Z",
        actualEndDateTime: "2023-11-01T00:00:00.000Z",
        proposedStartDateTime: "2023-10-29T08:36:00.000Z",
        proposedEndDateTime: "2023-11-01T00:00:00.000Z",
        streetName: "New Station Street",
        trafficManagementType: "Road closure",
        workStatus: "Works in progress",
    },
    {
        permitReferenceNumber: "LM213MB10186822-01",
        actualStartDateTime: "2023-10-01T08:36:00.000Z",
        actualEndDateTime: "2023-10-15T00:00:00.000Z",
        proposedStartDateTime: "2023-10-29T08:36:00.000Z",
        proposedEndDateTime: "2023-11-01T00:00:00.000Z",
        streetName: "Wellington Street",
        trafficManagementType: "Stop/go boards",
        workStatus: "Works in progress",
    },
    {
        permitReferenceNumber: "LM213MB10186822-01",
        actualStartDateTime: "2023-12-01T08:36:00.000Z",
        actualEndDateTime: "2023-12-10T00:00:00.000Z",
        proposedStartDateTime: "2023-10-29T08:36:00.000Z",
        proposedEndDateTime: "2023-11-01T00:00:00.000Z",
        streetName: "Call Lane",
        trafficManagementType: "Two way signals",
        workStatus: "Works in progress",
    },
    {
        permitReferenceNumber: "LM213MB10186822-01",
        actualStartDateTime: "2023-10-29T08:36:00.000Z",
        actualEndDateTime: "2023-11-01T00:00:00.000Z",
        proposedStartDateTime: "2023-10-29T08:36:00.000Z",
        proposedEndDateTime: "2023-11-01T00:00:00.000Z",
        streetName: "New Station Street",
        trafficManagementType: "Road closure",
        workStatus: "Works in progress",
    },
    {
        permitReferenceNumber: "LM213MB10186822-01",
        actualStartDateTime: "2023-10-01T08:36:00.000Z",
        actualEndDateTime: "2023-10-15T00:00:00.000Z",
        proposedStartDateTime: "2023-10-29T08:36:00.000Z",
        proposedEndDateTime: "2023-11-01T00:00:00.000Z",
        streetName: "Wellington Street",
        trafficManagementType: "Stop/go boards",
        workStatus: "Works in progress",
    },
    {
        permitReferenceNumber: "LM213MB10186822-01",
        actualStartDateTime: "2023-12-01T08:36:00.000Z",
        actualEndDateTime: "2023-12-10T00:00:00.000Z",
        proposedStartDateTime: "2023-10-29T08:36:00.000Z",
        proposedEndDateTime: "2023-11-01T00:00:00.000Z",
        streetName: "Call Lane",
        trafficManagementType: "Two way signals",
        workStatus: "Works in progress",
    },
    {
        permitReferenceNumber: "LM213MB10186822-01",
        actualStartDateTime: "2023-10-29T08:36:00.000Z",
        actualEndDateTime: "2023-11-01T00:00:00.000Z",
        proposedStartDateTime: "2023-10-29T08:36:00.000Z",
        proposedEndDateTime: "2023-11-01T00:00:00.000Z",
        streetName: "New Station Street",
        trafficManagementType: "Road closure",
        workStatus: "Works in progress",
    },
    {
        permitReferenceNumber: "LM213MB10186822-01",
        actualStartDateTime: "2023-10-01T08:36:00.000Z",
        actualEndDateTime: "2023-10-15T00:00:00.000Z",
        proposedStartDateTime: "2023-10-29T08:36:00.000Z",
        proposedEndDateTime: "2023-11-01T00:00:00.000Z",
        streetName: "Wellington Street",
        trafficManagementType: "Stop/go boards",
        workStatus: "Works in progress",
    },
    {
        permitReferenceNumber: "LM213MB10186822-01",
        actualStartDateTime: "2023-12-01T08:36:00.000Z",
        actualEndDateTime: "2023-12-10T00:00:00.000Z",
        proposedStartDateTime: "2023-10-29T08:36:00.000Z",
        proposedEndDateTime: "2023-11-01T00:00:00.000Z",
        streetName: "Call Lane",
        trafficManagementType: "Two way signals",
        workStatus: "Works in progress",
    },
];

const formatRows = (roadworks: Roadwork[], newDisruptionId: string) => {
    return roadworks.map((roadwork) => {
        return {
            datesAffected: `${convertDateTimeToFormat(roadwork.actualStartDateTime)} - ${convertDateTimeToFormat(
                roadwork.actualEndDateTime,
            )}`,
            description: `${roadwork.streetName} - ${roadwork.trafficManagementType}`,
            action: (
                <Link className="govuk-link" href={`${CREATE_DISRUPTION_PAGE_PATH}/${newDisruptionId}`}>
                    Create disruption
                </Link>
            ),
        };
    });
};

const ViewAllRoadworks = ({ newDisruptionId, liveRoadworks }: ViewAllRoadworksProps) => {
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
                                    rows={formatRows(liveRoadworks, newDisruptionId)}
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

    const liveRoadworks = mockRoadworks;

    return {
        props: {
            newDisruptionId,
            liveRoadworks: liveRoadworks,
        },
    };
};

export default ViewAllRoadworks;
