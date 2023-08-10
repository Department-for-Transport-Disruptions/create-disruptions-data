import { describe, it, expect } from "vitest";
import { getAtcoCodesFromSelectedStops, getMarkerDataInAService, getSelectedStopsFromMapMarkers } from "./ServicesMap";
import {
    mockMarkerData,
    mockMarkerDataResult,
    mockServicesInPolygon,
    mockServicesStopsInPolygon,
} from "../../testData/mockMapData";

describe("ServicesMap", () => {
    describe("getMarkerDataInAService", () => {
        it("should return an empty array if markerData is an empty array", () => {
            const markerData = getMarkerDataInAService([], mockServicesStopsInPolygon, mockServicesInPolygon);
            expect(markerData).toEqual([]);
        });
        it("should return an empty array if no matching atcoCode is found within serviceStopsInPolygon", () => {
            const markerData = getMarkerDataInAService(mockMarkerData, [], []);
            expect(markerData).toEqual([]);
        });
        it("should return an array of markers with undefined serviceIds if a matching atcoCode is found in serviceStopsInPolygon but is not found in serviceInPolygon", () => {
            const markerData = getMarkerDataInAService(
                mockMarkerData,
                [mockServicesStopsInPolygon[1]],
                [mockServicesInPolygon[0]],
            );
            expect(markerData).toEqual([
                {
                    atcoCode: "1800SB05751",
                    commonName: "Manchester Town Hall",
                    indicator: "Stop SC",
                    longitude: -2.244697,
                    latitude: 53.480024,
                    bearing: "SE",
                    stopType: "BCT",
                    busStopType: "MKD",
                    serviceIds: undefined,
                },
            ]);
        });
        it("should return markerData within a given service if atcoCode is found in serviceStopsInPolygon and serviceInPolygon", () => {
            const markerData = getMarkerDataInAService(
                mockMarkerData,
                mockServicesStopsInPolygon,
                mockServicesInPolygon,
            );
            expect(markerData).toEqual(mockMarkerDataResult);
        });
    });
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
