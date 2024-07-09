import { describe, expect, it } from "vitest";
import { mockMarkerData } from "../../testData/mockMapData";
import { getAtcoCodesFromSelectedStops, getSelectedStopsFromMapMarkers } from "./ServicesMap";

describe("ServicesMap", () => {
    describe("getStopsFromMapMarkers", () => {
        it("should return an array of selected stops from map markers", () => {
            const stops = getSelectedStopsFromMapMarkers(mockMarkerData, "1800SB12581");
            expect(stops).toEqual([
                {
                    atcoCode: "1800SB12581",
                    commonName: "Cheapside",
                    indicator: "Stop CL",
                    longitude: -2.244551,
                    latitude: 53.48096,
                    bearing: "W",
                    stopType: "BCT",
                    busStopType: "MKD",
                },
            ]);
        });
    });
    describe("getAtcoCodesFromSelectedStops", () => {
        it("should return an array of atco codes for a given array of stops", () => {
            const stops = mockMarkerData;
            expect(getAtcoCodesFromSelectedStops(stops)).toEqual(["1800SB12581", "1800SB05801", "1800SB05751"]);
        });
        it("should return an empty array if no stops are provided", () => {
            expect(getAtcoCodesFromSelectedStops([])).toEqual([]);
        });
    });
});
