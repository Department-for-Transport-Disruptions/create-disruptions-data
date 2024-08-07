import { describe, expect, it } from "vitest";
import { CONSEQUENCE_TYPES, OPERATOR_USER_CONSEQUENCE_TYPES } from ".";

describe("Consequence Types", () => {
    it("should return an array with journeys when feature flag is set", () => {
        expect(CONSEQUENCE_TYPES(true)).toEqual([
            {
                value: "services",
                display: "Services",
            },
            {
                value: "networkWide",
                display: "Network wide",
            },
            {
                value: "operatorWide",
                display: "Operator wide",
            },
            {
                value: "stops",
                display: "Stops",
            },
            {
                value: "journeys",
                display: "Journeys",
            },
        ]);
    });
    it("should return an array without journeys when feature flag is not set", () => {
        expect(CONSEQUENCE_TYPES(false)).toEqual([
            {
                value: "services",
                display: "Services",
            },
            {
                value: "networkWide",
                display: "Network wide",
            },
            {
                value: "operatorWide",
                display: "Operator wide",
            },
            {
                value: "stops",
                display: "Stops",
            },
        ]);
    });
    it("should return an array with journeys when feature flag is set for operators", () => {
        expect(OPERATOR_USER_CONSEQUENCE_TYPES(true)).toEqual([
            {
                value: "services",
                display: "Services",
            },
            {
                value: "operatorWide",
                display: "Operator wide",
            },
            {
                value: "journeys",
                display: "Journeys",
            },
        ]);
    });
    it("should return an array without journeys when feature flag is not set for operators", () => {
        expect(OPERATOR_USER_CONSEQUENCE_TYPES(false)).toEqual([
            {
                value: "services",
                display: "Services",
            },
            {
                value: "operatorWide",
                display: "Operator wide",
            },
        ]);
    });
});
