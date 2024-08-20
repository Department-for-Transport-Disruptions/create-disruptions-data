import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { mockViewAllRoadworksData } from "../testData/mockData";
import ViewAllRoadworks from "./view-all-roadworks.page";
import { getDate, sortEarliestDate } from "@create-disruptions-data/shared-ts/utils/dates";

const mockLiveRoadworks = mockViewAllRoadworksData
    .filter((roadwork) => roadwork.workStatus === "Works in progress" && !roadwork.actualEndDateTime)
    .sort((a, b) => sortEarliestDate(getDate(a.actualStartDateTime ?? ""), getDate(b.actualStartDateTime ?? "")));

describe("ViewAllRoadworks", () => {
    it("should render correctly when roadworks data is present", () => {
        const { asFragment } = render(<ViewAllRoadworks liveRoadworks={mockLiveRoadworks} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly when no roadworks data is present", () => {
        const { asFragment } = render(<ViewAllRoadworks liveRoadworks={[]} />);
        expect(asFragment()).toMatchSnapshot();
    });
});
