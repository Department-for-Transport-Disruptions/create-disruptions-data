import { Datasource, Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { ApiConsequence } from "@create-disruptions-data/shared-ts/utils";
import { describe, expect, it } from "vitest";

import {
    combineDateAndTime,
    getAffectedModesList,
    getAffectedOperatorsList,
    getAffectedServicesCount,
    getAffectedStopsCount,
} from ".";

const testConsequences: ApiConsequence[] = [
    {
        consequenceType: "operatorWide",
        description: "Test operator consequence 1",
        vehicleMode: VehicleMode.bus,
        consequenceOperators: [
            {
                operatorNoc: "NOC1",
                operatorPublicName: "Operator 1",
            },
            {
                operatorNoc: "NOC2",
                operatorPublicName: "Operator 2",
            },
        ],
        disruptionDelay: undefined,
        disruptionSeverity: Severity.normal,
        removeFromJourneyPlanners: "no",
    },
    {
        consequenceType: "networkWide",
        description: "Test network consequence 1",
        vehicleMode: VehicleMode.tram,
        disruptionDelay: "20",
        disruptionSeverity: Severity.severe,
        removeFromJourneyPlanners: "no",
    },
    {
        consequenceType: "operatorWide",
        description: "Test operator consequence 2",
        vehicleMode: VehicleMode.rail,
        consequenceOperators: [
            {
                operatorNoc: "NOC2",
                operatorPublicName: "Operator 2",
            },
            {
                operatorNoc: "NOC3",
                operatorPublicName: "Operator 3",
            },
        ],
        disruptionDelay: undefined,
        disruptionSeverity: Severity.normal,
        removeFromJourneyPlanners: "yes",
    },
    {
        consequenceType: "services",
        description: "Test services consequence 1",
        vehicleMode: VehicleMode.ferryService,
        disruptionDelay: "20",
        disruptionSeverity: Severity.slight,
        removeFromJourneyPlanners: "no",
        disruptionDirection: "allDirections",
        services: [
            {
                id: 1,
                dataSource: Datasource.bods,
                destination: "Test dest",
                startDate: "2023-10-01",
                endDate: "2024-02-03",
                lineId: "line1",
                lineName: "Line 1",
                nocCode: "NOC3",
                operatorShortName: "Op",
                origin: "Leeds",
                serviceCode: "code1",
            },
            {
                id: 2,
                dataSource: Datasource.tnds,
                destination: "Test dest 2",
                startDate: "2022-09-11",
                endDate: "2023-12-05",
                lineId: "line2",
                lineName: "Line 2",
                nocCode: "NOC4",
                operatorShortName: "Op2",
                origin: "Manchester",
                serviceCode: "code2",
            },
            {
                id: 2,
                dataSource: Datasource.tnds,
                destination: "Test dest 2",
                startDate: "2022-09-11",
                endDate: "2023-12-05",
                lineId: "line2",
                lineName: "Line 2",
                nocCode: "NOC4",
                operatorShortName: "Op2",
                origin: "Manchester",
                serviceCode: "code2",
            },
        ],
        stops: [
            {
                atcoCode: "ATCO1",
                commonName: "Stop1",
                latitude: -1.234,
                longitude: 1.234,
            },
        ],
    },
    {
        consequenceType: "stops",
        description: "Test stops consequence 1",
        vehicleMode: VehicleMode.bus,
        stops: [
            {
                atcoCode: "ATCO1",
                commonName: "Stop1",
                latitude: -1.234,
                longitude: 1.234,
            },
            {
                atcoCode: "ATCO2",
                commonName: "Stop2",
                latitude: -1.234,
                longitude: 1.234,
            },
            {
                atcoCode: "ATCO3",
                commonName: "Stop3",
                latitude: -1.234,
                longitude: 1.234,
            },
        ],
        disruptionDelay: undefined,
        disruptionSeverity: Severity.normal,
        removeFromJourneyPlanners: "yes",
    },
];

describe("getAffectedModesList", () => {
    it("correctly concatenates all modes", () => {
        expect(getAffectedModesList(testConsequences)).toBe("bus;tram;rail;ferryService");
    });
});

describe("getAffectedOperatorsList", () => {
    it("correctly concatenates all operators", () => {
        expect(getAffectedOperatorsList(testConsequences)).toBe("NOC1;NOC2;NOC3");
    });
});

describe("getAffectedServicesCount", () => {
    it("correctly counts all services", () => {
        expect(getAffectedServicesCount(testConsequences)).toBe(2);
    });
});

describe("getAffectedStopsCount", () => {
    it("correctly counts all stops", () => {
        expect(getAffectedStopsCount(testConsequences)).toBe(3);
    });
});

describe("combineDateAndTime", () => {
    it("should combine date from timestamp with new time", () => {
        const timestamp = "2023-05-13T14:45:00Z";
        const newTime = "20:00:00";
        const expected = "2023-05-13T20:00:00.000Z";

        const result = combineDateAndTime(timestamp, newTime);

        expect(result).toBe(expected);
    });

    it("should handle midnight correctly", () => {
        const timestamp = "2023-05-13T14:45:00Z";
        const newTime = "00:00:00";
        const expected = "2023-05-13T00:00:00.000Z";

        const result = combineDateAndTime(timestamp, newTime);

        expect(result).toBe(expected);
    });

    it("should handle time near day boundary", () => {
        const timestamp = "2023-05-13T23:59:59Z";
        const newTime = "23:59:59";
        const expected = "2023-05-13T23:59:59.000Z";

        const result = combineDateAndTime(timestamp, newTime);

        expect(result).toBe(expected);
    });

    it("should throw an error for invalid timestamp", () => {
        const timestamp = "invalid-date";
        const newTime = "20:00:00";

        expect(() => {
            combineDateAndTime(timestamp, newTime);
        }).toThrow();
    });

    it("should throw an error for invalid time format", () => {
        const timestamp = "2023-05-13T14:45:00Z";
        const newTime = "invalid-time";

        expect(() => {
            combineDateAndTime(timestamp, newTime);
        }).toThrow();
    });
});
