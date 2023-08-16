import MockDate from "mockdate";
import { describe, it, expect, afterEach } from "vitest";
import { filterServices, removeDuplicateServicesByKey } from "./formUtils";
import {
    mockBodsServicesNoDuplicates,
    mockBodsServicesWithDuplicates,
    mockTndsServicesNoDuplicates,
    mockTndsServicesWithDuplicates,
} from "../testData/mockData";

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
});
