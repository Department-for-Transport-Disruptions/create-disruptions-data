import MockDate from "mockdate";
import { expect, describe, it } from "vitest";
import { sortedDisruption } from "../../testData/mockData";
import { formatSortedDisruption } from ".";

describe("formatSortedDisruptions", () => {
    MockDate.set("2023-10-18");

    it("correctly formats disruptions", () => {
        const formatted = formatSortedDisruption(sortedDisruption);
        expect(formatted).toMatchSnapshot();
    });

    it("correctly formats disruptions to live", () => {
        const formatted = formatSortedDisruption({
            ...sortedDisruption,
            validity: [
                {
                    disruptionStartDate: "25/03/2022",
                    disruptionStartTime: "1123",
                    disruptionEndDate: "30/03/2022",
                    disruptionEndTime: "1123",
                },
                {
                    disruptionStartDate: "25/12/2040",
                    disruptionStartTime: "1123",
                    disruptionEndDate: "30/12/2040",
                    disruptionEndTime: "1123",
                },
                {
                    disruptionStartDate: "25/03/2090",
                    disruptionStartTime: "1123",
                    disruptionEndDate: "30/03/2090",
                    disruptionEndTime: "1123",
                },
            ],
        });

        expect(formatted.isLive).toEqual(true);
    });
    it("correctly formats disruptions to upcoming", () => {
        const formatted = formatSortedDisruption({
            ...sortedDisruption,
            validity: [
                {
                    disruptionStartDate: "25/03/2090",
                    disruptionStartTime: "1123",
                    disruptionEndDate: "30/03/2090",
                    disruptionEndTime: "1123",
                },
                {
                    disruptionStartDate: "25/12/2090",
                    disruptionStartTime: "1123",
                    disruptionEndDate: "30/12/2090",
                    disruptionEndTime: "1123",
                },
            ],
        });
        expect(formatted.isLive).toEqual(false);
    });
    it("correctly formats disruptions to recently closed", () => {
        const formatted = formatSortedDisruption({
            ...sortedDisruption,
            validity: [
                {
                    disruptionStartDate: "25/03/2021",
                    disruptionStartTime: "1123",
                    disruptionEndDate: "30/03/2021",
                    disruptionEndTime: "1123",
                },
                {
                    disruptionStartDate: "10/10/2023",
                    disruptionStartTime: "1123",
                    disruptionEndDate: "11/10/2023",
                    disruptionEndTime: "1123",
                },
            ],
        });

        expect(formatted.isLive).toEqual(false);
    });
});
