import { Stop } from "@create-disruptions-data/shared-ts/disruptionTypes";
import MockDate from "mockdate";
import { afterEach, describe, expect, it } from "vitest";
import {
    mockBodsServicesNoDuplicates,
    mockBodsServicesWithDuplicates,
    mockTndsServicesNoDuplicates,
    mockTndsServicesWithDuplicates,
} from "../testData/mockData";
import { filterServices, getStopType, removeDuplicateServicesByKey, sortAndFilterStops } from "./formUtils";

describe("formUtils", () => {
    afterEach(() => {
        MockDate.reset();
    });

    describe("filterServices", () => {
        it.each([[mockBodsServicesNoDuplicates], [mockBodsServicesWithDuplicates]])(
            "should return a sorted array of unique services if the data source is bods",
            (services) => {
                MockDate.set("2023-08-08");
                expect(filterServices(services)).toMatchSnapshot();
            },
        );
        it.each([[mockTndsServicesNoDuplicates], [mockTndsServicesWithDuplicates]])(
            "should return a sorted array of unique services if the data source is tnds",
            (services) => {
                MockDate.set("2023-08-08");
                expect(filterServices(services)).toMatchSnapshot();
            },
        );
        it("should return an empty array if no data is passed", () => {
            expect(filterServices([])).toEqual([]);
        });
    });

    describe("removeDuplicateServices", () => {
        it.each([[mockBodsServicesNoDuplicates], [mockBodsServicesWithDuplicates]])(
            "should return an array of unique services filtered by lineId if the data source is bods",
            (services) => {
                MockDate.set("2023-08-08");
                expect(removeDuplicateServicesByKey(services, "lineId")).toMatchSnapshot();
            },
        );
        it.each([[mockTndsServicesNoDuplicates], [mockTndsServicesWithDuplicates]])(
            "should return an array of unique services filtered by ServiceCode if the data source is tnds",
            (services) => {
                MockDate.set("2023-08-08");
                expect(removeDuplicateServicesByKey(services, "serviceCode")).toMatchSnapshot();
            },
        );
    });

    describe("sortFilterStops", () => {
        const unsortedDuplicatedStops: Stop[] = [
            {
                atcoCode: "370020440",
                commonName: "Prospect Road/St Quentin Drive",
                indicator: "adj",
                bearing: "E",
                longitude: -1.512933989,
                latitude: 53.317638172,
                stopType: "BCT",
                busStopType: "MKD",
                direction: "inbound",
                sequenceNumber: "2",
            },
            {
                atcoCode: "370025332",
                commonName: "Spa Lane/Tannery Street",
                indicator: "adj",
                bearing: "S",
                longitude: -1.368099159,
                latitude: 53.357876345,
                stopType: "BCT",
                busStopType: "MKD",
                direction: "outbound",
                sequenceNumber: "2",
            },
            {
                atcoCode: "370020349",
                commonName: "Cross Street/Tannery Street",
                indicator: "at",
                bearing: "S",
                longitude: -1.370176766,
                latitude: 53.358615412,
                stopType: "BCT",
                busStopType: "MKD",
                direction: "outbound",
                sequenceNumber: "1",
            },
            {
                atcoCode: "370025442",
                commonName: "Prospect Road/Everard Avenue",
                indicator: "adj",
                bearing: "SE",
                longitude: -1.516408243,
                latitude: 53.318371398,
                stopType: "BCT",
                busStopType: "MKD",
                direction: "inbound",
                sequenceNumber: "1",
            },
            {
                atcoCode: "370025334",
                commonName: "Spa Lane/Spa Lane Croft",
                indicator: "at",
                bearing: "SW",
                longitude: -1.368838473,
                latitude: 53.35563306,
                stopType: "BCT",
                busStopType: "MKD",
                direction: "outbound",
                sequenceNumber: "3",
            },
            {
                atcoCode: "370025334",
                commonName: "Spa Lane/Spa Lane Croft",
                indicator: "at",
                bearing: "SW",
                longitude: -1.368838473,
                latitude: 53.35563306,
                stopType: "BCT",
                busStopType: "MKD",
                direction: "outbound",
                sequenceNumber: "3",
            },
        ];

        it("should return a list of sorted stops", () => {
            expect(sortAndFilterStops(unsortedDuplicatedStops)).toMatchSnapshot();
        });
        it("should an empty array when there are no stops passed in", () => {
            expect(sortAndFilterStops([])).toEqual([]);
        });
    });

    describe("getStopType", () => {
        it.each([
            ["BCT", "Bus stop"],
            ["BCS", "Bus stop"],
            ["BCQ", "Bus stop"],
            ["MET", "Tram stop"],
            ["PLT", "Tram stop"],
            ["FER", "Ferry terminal"],
            ["FBT", "Ferry terminal"],
            [undefined, "Stop"],
        ])("should return the correct name for a given stop type", (stopType, stopName) => {
            expect(getStopType(stopType)).toEqual(stopName);
        });
    });
});
