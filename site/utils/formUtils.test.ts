import { describe, it, expect } from "vitest";
import { getDate } from "./dates";
import { filterServices, removeDuplicateServicesByKey } from "./formUtils";
import {
    mockBodsServicesNoDuplicates,
    mockBodsServicesWithDuplicates,
    mockTndsServicesNoDuplicates,
    mockTndsServicesWithDuplicates,
} from "../testData/mockData";

describe("filterServices", () => {
    it.each([[mockBodsServicesNoDuplicates], [mockBodsServicesWithDuplicates]])(
        "should return a sorted array of unique services if the data source is bods",
        (services) => {
            expect(filterServices(services)).toMatchSnapshot();
        },
    );
    it.each([[mockTndsServicesNoDuplicates], [mockTndsServicesWithDuplicates]])(
        "should return a sorted array of unique services if the data source is tnds",
        (services) => {
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
            const date = getDate("2023-08-08");
            expect(removeDuplicateServicesByKey(services, "lineId", date)).toMatchSnapshot();
        },
    );
    it.each([[mockTndsServicesNoDuplicates], [mockTndsServicesWithDuplicates]])(
        "should return an array of unique services filtered by ServiceCode if the data source is tnds",
        (services) => {
            const date = getDate("2023-08-08");
            expect(removeDuplicateServicesByKey(services, "serviceCode", date)).toMatchSnapshot();
        },
    );
});
