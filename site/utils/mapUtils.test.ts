import { describe, it, expect } from "vitest";
import { groupByJourneyPattern } from "./mapUtils";
import { RouteWithServiceInfo, RouteWithServiceInfoPreformatted } from ".";

describe("groupByJourneyPattern", () => {
    it("should group stops by journeyPatternId and sort by sequenceNumber", () => {
        const input: RouteWithServiceInfoPreformatted[] = [
            {
                serviceId: 1,
                serviceCode: "SC1",
                lineId: "L1",
                outbound: [
                    { journeyPatternId: 1, sequenceNumber: "2" },
                    { journeyPatternId: 1, sequenceNumber: "1" },
                    { journeyPatternId: 2, sequenceNumber: "1" },
                ],
                inbound: [
                    { journeyPatternId: 3, sequenceNumber: "2" },
                    { journeyPatternId: 3, sequenceNumber: "1" },
                    { journeyPatternId: 4, sequenceNumber: "1" },
                ],
            },
        ];

        const expected: RouteWithServiceInfo[] = [
            {
                serviceId: 1,
                serviceCode: "SC1",
                lineId: "L1",
                outbound: {
                    1: [
                        { journeyPatternId: 1, sequenceNumber: "1" },
                        { journeyPatternId: 1, sequenceNumber: "2" },
                    ],
                    2: [{ journeyPatternId: 2, sequenceNumber: "1" }],
                },
                inbound: {
                    3: [
                        { journeyPatternId: 3, sequenceNumber: "1" },
                        { journeyPatternId: 3, sequenceNumber: "2" },
                    ],
                    4: [{ journeyPatternId: 4, sequenceNumber: "1" }],
                },
            },
        ];

        const result = groupByJourneyPattern(input);
        expect(result).toEqual(expected);
    });

    it("should handle stops without journeyPatternId", () => {
        const input: RouteWithServiceInfoPreformatted[] = [
            {
                serviceId: 2,
                serviceCode: "SC2",
                lineId: "L2",
                outbound: [{ sequenceNumber: "2" }, { sequenceNumber: "1" }],
                inbound: [{ sequenceNumber: "1" }],
            },
        ];

        const expected: RouteWithServiceInfo[] = [
            {
                serviceId: 2,
                serviceCode: "SC2",
                lineId: "L2",
                outbound: {
                    unknown: [{ sequenceNumber: "1" }, { sequenceNumber: "2" }],
                },
                inbound: {
                    unknown: [{ sequenceNumber: "1" }],
                },
            },
        ];

        const result = groupByJourneyPattern(input);
        expect(result).toEqual(expected);
    });

    it("should handle empty input", () => {
        const input: RouteWithServiceInfoPreformatted[] = [];
        const expected: RouteWithServiceInfo[] = [];
        const result = groupByJourneyPattern(input);
        expect(result).toEqual(expected);
    });
});
