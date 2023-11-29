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
        widthClass: "w-[1=40%]",
    },
    {
        displayName: "Description",
        key: "description",
        widthClass: "w-[1=60%]",
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
        workStatus: "planned",
        highwayAuthority: "",
        highwayAuthoritySwaCode: 123,
        worksLocationCoordinates: "123",
        areaName: "My town",
        town: "town",
        workCategory: "Standard",
        usrn: "1234",
        activityType: "Utility works",
        worksLocationType: "Carriageway, Footpath",
        isTrafficSensitive: "No",
        permitStatus: "granted",
        currentTrafficManagementType: null,
        currentTrafficManagementTypeUpdateDate: null,
        lastUpdatedDateTime: "2020-06-11T10:11:00.000Z",
        createdDateTime: "2020-06-11T10:11:00.000Z",
    },
    {
        permitReferenceNumber: "LM213MB10186822-02",
        actualStartDateTime: "2023-10-29T08:36:00.000Z",
        actualEndDateTime: "2023-11-01T00:00:00.000Z",
        proposedStartDateTime: "2023-10-29T08:36:00.000Z",
        proposedEndDateTime: "2023-11-01T00:00:00.000Z",
        streetName: "A nice looking street",
        trafficManagementType: "Road closure",
        workStatus: "planned",
        highwayAuthority: "",
        highwayAuthoritySwaCode: 123,
        worksLocationCoordinates: "123",
        areaName: "My town",
        town: "town",
        workCategory: "Standard",
        usrn: "1234",
        activityType: "Utility works",
        worksLocationType: "Carriageway, Footpath",
        isTrafficSensitive: "No",
        permitStatus: "granted",
        currentTrafficManagementType: null,
        currentTrafficManagementTypeUpdateDate: null,
        lastUpdatedDateTime: "2020-06-11T10:11:00.000Z",
        createdDateTime: "2020-06-11T10:11:00.000Z",
    },
];

const formatRows = (roadworks: Roadwork[]) => {
    return roadworks.map((roadwork) => {
        return {
            datesAffected: `${convertDateTimeToFormat(roadwork.actualStartDateTime ?? "")} - ${convertDateTimeToFormat(
                roadwork.actualEndDateTime ?? "",
            )}`,
            description: (
                <Link className="govuk-link" href={`roadwork-detail/${roadwork.permitReferenceNumber}`}>
                    {roadwork.streetName} - {roadwork.trafficManagementType}
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

    const liveRoadworks = roadworks.filter((roadwork) => roadwork.workStatus === "Works in progress");

    return {
        props: {
            liveRoadworks: mockRoadworks,
        },
    };
};

export default ViewAllRoadworks;
