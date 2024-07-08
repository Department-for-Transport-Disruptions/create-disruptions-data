import { getDate, sortEarliestDate } from "@create-disruptions-data/shared-ts/utils/dates";
import renderer from "react-test-renderer";
import { describe, expect, it } from "vitest";
import { mockViewAllRoadworksData } from "../testData/mockData";
import ViewAllRoadworks from "./view-all-roadworks.page";

const mockLiveRoadworks = mockViewAllRoadworksData
    .filter((roadwork) => roadwork.workStatus === "Works in progress" && !roadwork.actualEndDateTime)
    .sort((a, b) => {
        return sortEarliestDate(getDate(a.actualStartDateTime ?? ""), getDate(b.actualStartDateTime ?? ""));
    });

describe("ViewAllRoadworks", () => {
    it("should render correctly when roadworks data is present", () => {
        const tree = renderer.create(<ViewAllRoadworks liveRoadworks={mockLiveRoadworks} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
    it("should render correctly when no roadworks data is present", () => {
        const tree = renderer.create(<ViewAllRoadworks liveRoadworks={[]} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
