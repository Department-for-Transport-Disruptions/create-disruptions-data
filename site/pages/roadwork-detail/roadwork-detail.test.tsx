import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import renderer from "react-test-renderer";
import { describe, expect, it } from "vitest";
import RoadworkDetail from "./[permitReferenceNumber].page";
import { Roadwork } from "../../schemas/roadwork.schema";

const mockNewDisruptionId = "d7991c1b-f332-4f6e-a150-faffebcd1ff6";

const mockRoadwork: Roadwork = {
    permitReferenceNumber: "JG222OC_CAP-1436121A-02",
    highwayAuthoritySwaCode: 4225,
    highwayAuthority: "ROCHDALE BOROUGH COUNCIL",
    streetName: "KING STREET EAST",
    areaName: "MILKSTONE",
    town: "ROCHDALE",
    worksLocationCoordinates: "LINESTRING(389406.96 412449.54,389566.12 412498.74)",
    activityType: "Utility repair and maintenance works",
    trafficManagementType: "Multi-way signals",
    proposedStartDateTime: "2023-11-27T00:00:00.000Z",
    proposedEndDateTime: "2023-12-08T00:00:00.000Z",
    actualStartDateTime: "2023-11-27T09:00:00.000Z",
    actualEndDateTime: null,
    permitStatus: "granted",
    workStatus: "Works in progress",
    administrativeAreaCode: "083",
    createdDateTime: "2023-12-01T08:54:05.351Z",
    lastUpdatedDateTime: "2023-12-01T08:54:05.351Z",
};

describe("RoadworkDetail", () => {
    it("should render correctly when roadworks data is present", () => {
        const tree = renderer
            .create(<RoadworkDetail roadwork={mockRoadwork} newDisruptionId={mockNewDisruptionId} />)
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly when roadwork data is present and a published disruption exists for given roadwork", () => {
        const tree = renderer
            .create(
                <RoadworkDetail
                    roadwork={mockRoadwork}
                    newDisruptionId={mockNewDisruptionId}
                    disruptionId={mockNewDisruptionId}
                    disruptionPublishStatus={PublishStatus.published}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly when roadwork data is present and a draft disruption exists for given roadwork", () => {
        const tree = renderer
            .create(
                <RoadworkDetail
                    roadwork={mockRoadwork}
                    newDisruptionId={mockNewDisruptionId}
                    disruptionId={mockNewDisruptionId}
                    disruptionPublishStatus={PublishStatus.draft}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
