import { getDate, sortEarliestDate } from "@create-disruptions-data/shared-ts/utils/dates";
import center from "@turf/center";
import { getCoords } from "@turf/invariant";
import { NextPageContext } from "next";
import Link from "next/link";
import proj4 from "proj4";
import { GeoJSONPolygon, parse, GeoJSONFeature, GeoJSONGeometry, GeoJSONLineString } from "wellknown";
import SortableTable, { TableColumn } from "../components/form/SortableTable";
import Warning from "../components/form/Warning";
import { BaseLayout } from "../components/layout/Layout";
import Tabs from "../components/layout/Tabs";
import Map from "../components/map/RoadWorksMap";
import { fetchRoadworks } from "../data/refDataApi";
import { Roadwork } from "../schemas/roadwork.schema";
import { getSessionWithOrgDetail } from "../utils/apiUtils/auth";
import { convertDateTimeToFormat } from "../utils/dates";

const title = "View All Roadworks";
const description = "View All Roadworks page for the Create Transport Disruptions Service";

export interface ViewAllRoadworksProps {
    liveRoadworks: Roadwork[];
}

const isPolygon = (geometry: GeoJSONGeometry): geometry is GeoJSONPolygon => geometry && geometry.type === "Polygon";

const isLineString = (geometry: GeoJSONGeometry): geometry is GeoJSONLineString =>
    geometry && geometry.type === "LineString";

const test = [
    {
        permitReferenceNumber: "JG222OC_CAP-1436121A-02",
        highwayAuthoritySwaCode: 4225,
        worksLocationCoordinates: "LINESTRING(389406.96 412449.54,389566.12 412498.74)",
        streetName: "KING STREET EAST",
        areaName: "MILKSTONE",
        proposedStartDateTime: "2023-11-27T00:00:00.000Z",
        proposedEndDateTime: "2023-12-08T00:00:00.000Z",
        actualStartDateTime: "2023-11-27T09:00:00.000Z",
        actualEndDateTime: null,
        workStatus: "Works in progress",
        activityType: "Utility repair and maintenance works",
        permitStatus: "granted",
        town: "ROCHDALE",
        administrativeAreaCode: "083",
    },
    {
        permitReferenceNumber: "1234",
        highwayAuthoritySwaCode: 4225,
        worksLocationCoordinates: "POINT(389869.542722575 414215.411452993)",
        streetName: "WELLINGTON STREET",
        areaName: "SYKE",
        proposedStartDateTime: "2023-11-28T08:00:00.000Z",
        proposedEndDateTime: "2023-11-30T18:00:00.000Z",
        actualStartDateTime: null,
        actualEndDateTime: null,
        workStatus: "Works planned",
        activityType: "Statutory Infrastructure Works",
        permitStatus: "granted",
        town: "ROCHDALE",
        administrativeAreaCode: "083",
    },
    {
        permitReferenceNumber: "B701066841118-02",
        highwayAuthoritySwaCode: 4225,
        worksLocationCoordinates: "POINT(389869.542722575 414215.411452993)",
        streetName: "WELLINGTON STREET",
        areaName: "SYKE",
        proposedStartDateTime: "2023-11-28T08:00:00.000Z",
        proposedEndDateTime: "2023-11-30T18:00:00.000Z",
        actualStartDateTime: null,
        actualEndDateTime: null,
        workStatus: "Works planned",
        activityType: "Statutory Infrastructure Works",
        permitStatus: "granted",
        town: "ROCHDALE",
        administrativeAreaCode: "083",
    },
    {
        permitReferenceNumber: "J2007RO-DPL-AG4-PB3-01",
        highwayAuthoritySwaCode: 4225,
        worksLocationCoordinates:
            "LINESTRING(389625.39424647 411634.263123684,389630.38174647 411624.288123684,389637.99424647 411620.350623684)",
        streetName: "DEAN COURT",
        areaName: "CASTLETON NORTH",
        proposedStartDateTime: "2023-11-29T08:00:00.000Z",
        proposedEndDateTime: "2023-12-04T20:00:00.000Z",
        actualStartDateTime: "2023-11-30T18:00:00.000Z",
        actualEndDateTime: null,
        workStatus: "Works in progress",
        activityType: "Utility repair and maintenance works",
        permitStatus: "granted",
        town: "ROCHDALE",
        administrativeAreaCode: "083",
    },
    {
        permitReferenceNumber: "B701070526236-02",
        highwayAuthoritySwaCode: 4225,
        worksLocationCoordinates: "POINT(389464.184375 412897.720703125)",
        streetName: "ST ALBANS STREET",
        areaName: "ROCHDALE TOWN CENTRE",
        proposedStartDateTime: "2023-11-29T09:30:00.000Z",
        proposedEndDateTime: "2023-12-04T15:30:00.000Z",
        actualStartDateTime: "2023-11-30T15:29:00.000Z",
        actualEndDateTime: null,
        workStatus: "Works in progress",
        activityType: "Permanent reinstatement",
        permitStatus: "granted",
        town: "ROCHDALE",
        administrativeAreaCode: "083",
    },
    {
        permitReferenceNumber: "5678",
        highwayAuthoritySwaCode: 4225,
        worksLocationCoordinates: "POINT(389464.184375 412897.720703125)",
        streetName: "ST ALBANS STREET",
        areaName: "ROCHDALE TOWN CENTRE",
        proposedStartDateTime: "2023-11-29T09:30:00.000Z",
        proposedEndDateTime: "2023-12-04T15:30:00.000Z",
        actualStartDateTime: "2023-11-30T15:29:00.000Z",
        actualEndDateTime: null,
        workStatus: "Works in progress",
        activityType: "Permanent reinstatement",
        permitStatus: "granted",
        town: "ROCHDALE",
        administrativeAreaCode: "083",
    },
    {
        permitReferenceNumber: "J2007RO-DPL-AG3-BL9-01",
        highwayAuthoritySwaCode: 4225,
        worksLocationCoordinates: "LINESTRING(390077.478419296 412480.694084651,390085.038410751 412505.054086787)",
        streetName: "ISHERWOOD STREET",
        areaName: "DEEPLISH",
        proposedStartDateTime: "2023-11-30T08:00:00.000Z",
        proposedEndDateTime: "2023-12-05T20:00:00.000Z",
        actualStartDateTime: "2023-12-01T10:10:00.000Z",
        actualEndDateTime: null,
        workStatus: "Works in progress",
        activityType: "Utility repair and maintenance works",
        permitStatus: "granted",
        town: "ROCHDALE",
        administrativeAreaCode: "083",
    },
    {
        permitReferenceNumber: "J2007RO-DPL-AG2-PB13-01",
        highwayAuthoritySwaCode: 4225,
        worksLocationCoordinates: "LINESTRING(389746.728445305 412177.874099321,389771.718432487 412164.854100389)",
        streetName: "CLARA STREET",
        areaName: "DEEPLISH",
        proposedStartDateTime: "2023-11-30T08:00:00.000Z",
        proposedEndDateTime: "2023-12-05T20:00:00.000Z",
        actualStartDateTime: "2023-12-01T09:36:00.000Z",
        actualEndDateTime: null,
        workStatus: "Works in progress",
        activityType: "Utility repair and maintenance works",
        permitStatus: "granted",
        town: "ROCHDALE",
        administrativeAreaCode: "083",
    },
    {
        permitReferenceNumber: "JG220OC_F10993387-01",
        highwayAuthoritySwaCode: 4225,
        worksLocationCoordinates: "POINT(387242 412603)",
        streetName: "MIDGE HALL DRIVE",
        areaName: "BAMFORD EAST & BROADHALGH",
        proposedStartDateTime: "2023-11-30T10:30:00.000Z",
        proposedEndDateTime: "2023-12-06T00:00:00.000Z",
        actualStartDateTime: "2023-11-30T10:30:00.000Z",
        actualEndDateTime: null,
        workStatus: "Works in progress",
        activityType: "Utility repair and maintenance works",
        permitStatus: "submitted",
        town: "ROCHDALE",
        administrativeAreaCode: "083",
    },
    {
        permitReferenceNumber: "HZ73101328453-2339467-02",
        highwayAuthoritySwaCode: 4230,
        worksLocationCoordinates: "POINT(380416.24 399082.69)",
        streetName: "FARRINGDON STREET",
        areaName: "",
        proposedStartDateTime: "2023-12-01T00:00:00.000Z",
        proposedEndDateTime: "2023-12-01T00:00:00.000Z",
        actualStartDateTime: "2023-12-01T09:30:00.000Z",
        actualEndDateTime: null,
        workStatus: "Works in progress",
        activityType: "Utility repair and maintenance works",
        permitStatus: "granted",
        town: "SALFORD",
        administrativeAreaCode: "083",
    },
    {
        permitReferenceNumber: "BC311001WF7K6R2R-01",
        highwayAuthoritySwaCode: 4225,
        worksLocationCoordinates: "POINT(387941 414832)",
        streetName: "INGS LANE",
        areaName: "ROCHDALE",
        proposedStartDateTime: "2023-12-01T00:00:00.000Z",
        proposedEndDateTime: "2023-12-05T00:00:00.000Z",
        actualStartDateTime: "2023-12-01T09:00:00.000Z",
        actualEndDateTime: null,
        workStatus: "Works in progress",
        activityType: "Highway repair and maintenance works",
        permitStatus: "granted",
        town: "ROCHDALE",
        administrativeAreaCode: "083",
    },
    {
        permitReferenceNumber: "BC311001WF7LL47K-01",
        highwayAuthoritySwaCode: 4225,
        worksLocationCoordinates: "LINESTRING(387856 414933,387914 414876)",
        streetName: "INGS LANE",
        areaName: "ROCHDALE",
        proposedStartDateTime: "2023-12-01T00:00:00.000Z",
        proposedEndDateTime: "2023-12-05T00:00:00.000Z",
        actualStartDateTime: "2023-12-01T09:35:00.000Z",
        actualEndDateTime: null,
        workStatus: "Works in progress",
        activityType: "Utility repair and maintenance works",
        permitStatus: "granted",
        town: "ROCHDALE",
        administrativeAreaCode: "083",
    },
    {
        permitReferenceNumber: "HZ72101433682-2525747-01",
        highwayAuthoritySwaCode: 4225,
        worksLocationCoordinates: "POINT(390144.817819199 413866.09754384)",
        streetName: "YORKSHIRE STREET",
        areaName: "ROCHDALE TOWN CENTRE",
        proposedStartDateTime: "2023-12-01T09:13:00.000Z",
        proposedEndDateTime: "2023-12-01T00:00:00.000Z",
        actualStartDateTime: "2023-12-01T09:13:00.000Z",
        actualEndDateTime: null,
        workStatus: "Works in progress",
        activityType: "Utility repair and maintenance works",
        permitStatus: "submitted",
        town: "ROCHDALE",
        administrativeAreaCode: "083",
    },
    {
        permitReferenceNumber: "HZ09001340089-2-02",
        highwayAuthoritySwaCode: 4230,
        worksLocationCoordinates: "LINESTRING(383489.402424622 398680.447569444,383486.913545227 398685.580893877)",
        streetName: "CHAPEL STREET",
        areaName: "",
        proposedStartDateTime: "2023-12-03T00:00:00.000Z",
        proposedEndDateTime: "2023-12-03T00:00:00.000Z",
        actualStartDateTime: null,
        actualEndDateTime: null,
        workStatus: "Works planned",
        activityType: "New service connection",
        permitStatus: "granted",
        town: "SALFORD",
        administrativeAreaCode: "083",
    },
    {
        permitReferenceNumber: "HZ08001340089-2-02",
        highwayAuthoritySwaCode: 4230,
        worksLocationCoordinates: "LINESTRING(383489.402424622 398680.447569444,383486.913545227 398685.580893877)",
        streetName: "CHAPEL STREET",
        areaName: "",
        proposedStartDateTime: "2023-12-03T00:00:00.000Z",
        proposedEndDateTime: "2023-12-03T00:00:00.000Z",
        actualStartDateTime: "2023-11-03T00:00:00.000Z",
        actualEndDateTime: null,
        workStatus: "Works in progress",
        activityType: "New service connection",
        permitStatus: "granted",
        town: "SALFORD",
        administrativeAreaCode: "083",
    },
    {
        permitReferenceNumber: "AZ7041001295328-02",
        highwayAuthoritySwaCode: 4230,
        worksLocationCoordinates: "POINT(382763.69 401625.07)",
        streetName: "NEW HALL ROAD",
        areaName: "",
        proposedStartDateTime: "2023-12-04T00:00:00.000Z",
        proposedEndDateTime: "2023-12-08T00:00:00.000Z",
        actualStartDateTime: null,
        actualEndDateTime: null,
        workStatus: "Works planned",
        activityType: "New service connection",
        permitStatus: "granted",
        town: "SALFORD",
        administrativeAreaCode: "083",
    },
    {
        permitReferenceNumber: "AZ7041001295329-02",
        highwayAuthoritySwaCode: 4230,
        worksLocationCoordinates: "POINT(382763.69 401625.07)",
        streetName: "NEW HALL ROAD",
        areaName: "",
        proposedStartDateTime: "2023-12-04T00:00:00.000Z",
        proposedEndDateTime: "2023-12-08T00:00:00.000Z",
        actualStartDateTime: "2023-11-03T00:00:00.000Z",
        actualEndDateTime: null,
        workStatus: "Works in progress",
        activityType: "New service connection",
        permitStatus: "granted",
        town: "SALFORD",
        administrativeAreaCode: "083",
    },
    {
        permitReferenceNumber: "QZ00256010688-01",
        highwayAuthoritySwaCode: 4230,
        worksLocationCoordinates:
            "POLYGON((378847.19140625 399233.020703125,378810.44140625 399225.495703125,378810.26640625 399219.370703125,378847.89140625 399220.770703125,378847.19140625 399233.020703125))",
        streetName: "ECCLES OLD ROAD",
        areaName: "",
        proposedStartDateTime: "2023-12-04T20:00:00.000Z",
        proposedEndDateTime: "2023-12-04T21:30:00.000Z",
        actualStartDateTime: null,
        actualEndDateTime: null,
        workStatus: "Works planned",
        activityType: "Highway improvement works",
        permitStatus: "submitted",
        town: "SALFORD",
        administrativeAreaCode: "083",
    },
    {
        permitReferenceNumber: "NX511BRM2383-DIV-03-01",
        highwayAuthoritySwaCode: 4230,
        worksLocationCoordinates:
            "POLYGON((381401.019334646 399232.961097103,381451.025684659 399158.665943668,381466.106964821 399165.968467962,381413.243104249 399243.438619673,381401.019334646 399232.961097103))",
        streetName: "BROAD STREET",
        areaName: "",
        proposedStartDateTime: "2023-12-05T00:00:00.000Z",
        proposedEndDateTime: "2023-12-07T00:00:00.000Z",
        actualStartDateTime: null,
        actualEndDateTime: null,
        workStatus: "Works planned",
        activityType: "Statutory Infrastructure Works",
        permitStatus: "submitted",
        town: "SALFORD",
        administrativeAreaCode: "083",
    },
    {
        permitReferenceNumber: "H2666WAR-CIV-W2220274-01-01",
        highwayAuthoritySwaCode: 4225,
        worksLocationCoordinates: "LINESTRING(388942.2578125 413630.883203125,388943.4828125 413617.233203125)",
        streetName: "ARTHUR STREET",
        areaName: "SPARTHBOTTOMS & COLLEGE BANK",
        proposedStartDateTime: "2023-12-05T00:00:00.000Z",
        proposedEndDateTime: "2023-12-07T00:00:00.000Z",
        actualStartDateTime: null,
        actualEndDateTime: null,
        workStatus: "Works planned",
        activityType: "Utility repair and maintenance works",
        permitStatus: "granted",
        town: "ROCHDALE",
        administrativeAreaCode: "083",
    },
    {
        permitReferenceNumber: "JG202NP_CAP-DELOOP-DOVE1-01",
        highwayAuthoritySwaCode: 4225,
        worksLocationCoordinates: "POINT(391566.69 416838.25)",
        streetName: "DOVEDALE DRIVE",
        areaName: "WARDLE",
        proposedStartDateTime: "2023-12-05T07:00:00.000Z",
        proposedEndDateTime: "2023-12-07T17:00:00.000Z",
        actualStartDateTime: null,
        actualEndDateTime: null,
        workStatus: "Works planned",
        activityType: "Permanent reinstatement",
        permitStatus: "submitted",
        town: "ROCHDALE",
        administrativeAreaCode: "083",
    },
    {
        permitReferenceNumber: "NK106NWID720196A-01",
        highwayAuthoritySwaCode: 4225,
        worksLocationCoordinates: "POINT(392168.136578977 415801.057851711)",
        streetName: "UNION ROAD",
        areaName: "WARDLE",
        proposedStartDateTime: "2023-12-06T00:00:00.000Z",
        proposedEndDateTime: "2023-12-08T00:00:00.000Z",
        actualStartDateTime: null,
        actualEndDateTime: null,
        workStatus: "Works planned",
        activityType: "Utility asset works",
        permitStatus: "submitted",
        town: "ROCHDALE",
        administrativeAreaCode: "083",
    },
    {
        permitReferenceNumber: "A6004FINAD-OR-00001677-01",
        highwayAuthoritySwaCode: 4215,
        worksLocationCoordinates: "POINT(384138.851582458 397862.085183593)",
        streetName: "PORTLAND STREET",
        areaName: "",
        proposedStartDateTime: "2024-01-09T19:00:00.000Z",
        proposedEndDateTime: "2024-01-11T23:00:00.000Z",
        actualStartDateTime: null,
        actualEndDateTime: null,
        workStatus: "Works planned",
        activityType: "Utility repair and maintenance works",
        permitStatus: "granted",
        town: "MANCHESTER",
        administrativeAreaCode: "083",
    },
].map((item) => {
    const worksLocationCoordinates: GeoJSONFeature = {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [0, 0],
        },
    };

    const geometry = parse(item.worksLocationCoordinates) || worksLocationCoordinates.geometry;
    worksLocationCoordinates.geometry = geometry;

    if (isPolygon(geometry) || isLineString(geometry)) {
        const middle = center(geometry);

        worksLocationCoordinates.geometry = {
            type: "Point",
            coordinates: getCoords(middle),
        } as GeoJSONGeometry;
    }

    // Example coordinates in British National Grid (easting, northing)
    const easting = worksLocationCoordinates.geometry.coordinates[0];
    const northing = worksLocationCoordinates.geometry.coordinates[1];

    // Define the British National Grid (BNG) coordinate reference system
    const sourceCRS =
        "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.060,0.1502,0.2470,0.8421,-20.4894 +units=m +no_defs"; // OSGB36

    // Define the target coordinate reference system for longitude and latitude
    const targetCRS = "+proj=longlat +datum=WGS84 +no_defs";

    // Perform the coordinate transformation
    const coordinates = proj4(sourceCRS, targetCRS, [easting, northing]);
    worksLocationCoordinates.geometry = {
        type: "Point",
        coordinates: coordinates,
    } as GeoJSONGeometry;

    return {
        ...item,
        worksLocationCoordinates,
    };
});

console.log(test);
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

            {liveRoadworks.length === 0 && <Warning text="There are no current roadworks in your area" />}

            <Map
                initialViewState={{
                    longitude: -1.7407941662903283,
                    latitude: 53.05975866591879,
                    zoom: 4.5,
                }}
                style={{ width: "100%", height: "40vh", marginBottom: 20 }}
                mapStyle="mapbox://styles/mapbox/streets-v12"
                roadworks={test}
            />
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
