import { Disruption } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { MiscellaneousReason, PublishStatus, Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { describe, expect, it } from "vitest";
import {
    generateConsequenceStats,
    generateDisruptionReasonCount,
    generateSiriStats,
    initialConsequenceStatsValues,
} from "./statGenerators";

const mockDisruptionReason = "accident";

const mockDisruptionReasonCountStat = {
    roadworks: 1,
    accident: 3,
};

const mockDisruption: Disruption = {
    disruptionId: "0ecde498-cbee-59ee-a604-2b0ceea971e3",
    disruptionType: "planned" as const,
    summary: "Pilley Village (Barnsley)",
    description:
        "Due to Emergency Roadworks being conducted by Yorkshire Water services unable to serve Pilley or Tankersley Villages - expected to be complete Saturday 24th afternoon",
    associatedLink: "",
    disruptionReason: "roadworks" as MiscellaneousReason,
    publishStartDate: "24/06/2023",
    publishStartTime: "1237",
    publishEndDate: "" as const,
    publishEndTime: "" as const,
    disruptionStartDate: "24/06/2023",
    disruptionStartTime: "1237",
    disruptionEndDate: "" as const,
    disruptionEndTime: "" as const,
    disruptionNoEndDateTime: "true" as const,
    disruptionRepeats: "doesntRepeat" as const,
    disruptionRepeatsEndDate: "",
    validity: [],
    displayId: "9dbcb3",
    orgId: "76a85b15-0523-4fa7-95ee-0d9caf05e2d4",
    consequences: [
        {
            disruptionId: "0ecde498-cbee-59ee-a604-2b0ceea971e3",
            description:
                "Service 67A unable to Serve Pilley or Tankersley Villages due to emergency roadworks.\nService diverting via Sheffield Road to M1 Roundabout then to Tankersley industrial estate return to Roundabout then normal to Wombwell. \nTo Barnsley reverse of the above.",
            removeFromJourneyPlanners: "no" as const,
            disruptionDelay: "",
            disruptionSeverity: Severity.unknown,
            vehicleMode: "bus" as VehicleMode,
            consequenceIndex: 0,
            orgId: "76a85b15-0523-4fa7-95ee-0d9caf05e2d4",
            consequenceOperators: [
                {
                    operatorNoc: "SYRK",
                    operatorPublicName: "Stagecoach Yorkshire",
                },
            ],
            consequenceType: "operatorWide",
        },
        {
            disruptionId: "0ecde498-cbee-59ee-a604-2b0ceea971e3",
            description:
                "Service 67A unable to Serve Pilley or Tankersley Villages due to emergency roadworks.\nService diverting via Sheffield Road to M1 Roundabout then to Tankersley industrial estate return to Roundabout then normal to Wombwell. \nTo Barnsley reverse of the above.",
            removeFromJourneyPlanners: "no" as const,
            disruptionDelay: "",
            disruptionSeverity: Severity.unknown,
            vehicleMode: "bus" as VehicleMode,
            consequenceIndex: 0,
            orgId: "76a85b15-0523-4fa7-95ee-0d9caf05e2d4",
            consequenceType: "networkWide",
        },
    ],
    lastUpdated: "2023-10-11T12:00:00Z",
    publishStatus: PublishStatus.published,
    template: false,
};

describe("generateDisruptionReasonCount", () => {
    it("increases the reason count by one for the relevant disruption reason", () => {
        expect(generateDisruptionReasonCount(mockDisruptionReason, mockDisruptionReasonCountStat)).toEqual({
            roadworks: 1,
            accident: 4,
        });
    });
});

describe("generateConsequenceStats", () => {
    it("for a given disruption it correctly counts to the total number of consequences and the number of consequence types", () => {
        expect(generateConsequenceStats("test-org", mockDisruption)).toEqual({
            "test-org": {
                ...initialConsequenceStatsValues,
                totalConsequencesCount: 2,
                operatorWideConsequencesCount: 1,
                networkWideConsequencesCount: 1,
            },
        });
    });
});

describe("generateSiriStats", () => {
    it("correctly calculates the stats for a given set of disruptions", () => {
        expect(generateSiriStats([mockDisruption, mockDisruption])).toEqual({
            "76a85b15-0523-4fa7-95ee-0d9caf05e2d4": {
                disruptionReasonCount: {
                    roadworks: 2,
                },
                ...initialConsequenceStatsValues,
                totalConsequencesCount: 4,
                operatorWideConsequencesCount: 2,
                networkWideConsequencesCount: 2,
                lastUpdated: "2023-10-11T12:00:00Z",
                totalDisruptionsCount: 2,
            },
        });
    });

    it.each([
        [[{ ...mockDisruption, lastUpdated: "2023-11-11T14:00:00Z" }, mockDisruption]],
        [
            [
                { ...mockDisruption, lastUpdated: "" },
                { ...mockDisruption, lastUpdated: "2023-11-11T14:00:00Z" },
            ],
        ],
    ])("correctly calculates the last updated date for multiple disruptions", (testData) => {
        expect(generateSiriStats(testData)).toEqual({
            "76a85b15-0523-4fa7-95ee-0d9caf05e2d4": {
                disruptionReasonCount: {
                    roadworks: 2,
                },
                ...initialConsequenceStatsValues,
                totalConsequencesCount: 4,
                operatorWideConsequencesCount: 2,
                networkWideConsequencesCount: 2,
                lastUpdated: "2023-11-11T14:00:00Z",
                totalDisruptionsCount: 2,
            },
        });
    });
});
