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
    const date = getDate("2023-08-08");
    it.each([[mockBodsServicesNoDuplicates], [mockBodsServicesWithDuplicates]])(
        "should return a sorted array of unique services if the data source is bods",
        (services) => {
            expect(filterServices(date, services)).toMatchSnapshot();
        },
    );
    it.each([[mockTndsServicesNoDuplicates], [mockTndsServicesWithDuplicates]])(
        "should return a sorted array of unique services if the data source is tnds",
        (services) => {
            expect(filterServices(date, services)).toMatchSnapshot();
        },
    );
    it("should return an empty array if no data is passed", () => {
        expect(filterServices(date, [])).toEqual([]);
    });
});

describe("removeDuplicateServices", () => {
    const date = getDate("2023-08-08");
    it.each([[mockBodsServicesNoDuplicates], [mockBodsServicesWithDuplicates]])(
        "should return an array of unique services filtered by lineId if the data source is bods",
        (services) => {
            expect(removeDuplicateServicesByKey(services, "lineId", date)).toMatchSnapshot();
        },
    );
    it.each([[mockTndsServicesNoDuplicates], [mockTndsServicesWithDuplicates]])(
        "should return an array of unique services filtered by ServiceCode if the data source is tnds",
        (services) => {
            expect(removeDuplicateServicesByKey(services, "serviceCode", date)).toMatchSnapshot();
        },
    );
});
