import { describe, it, expect } from "vitest";
import { getMarkerDataInAService } from "./ServicesMap";

const mockMarkerData = [
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
    {
        atcoCode: "1800SB05801",
        commonName: "Cheapside",
        indicator: "Stop CO",
        longitude: -2.243361,
        latitude: 53.48097,
        bearing: "E",
        stopType: "BCT",
        busStopType: "MKD",
    },
    {
        atcoCode: "1800SB05751",
        commonName: "Manchester Town Hall",
        indicator: "Stop SC",
        longitude: -2.244697,
        latitude: 53.480024,
        bearing: "SE",
        stopType: "BCT",
        busStopType: "MKD",
    },
];

const mockServicesStopsInPolygon = ["1800SB05801", "1800SB05751", "1800SB05801"];

const mockServicesInPolygon = [
    {
        id: 833,
        lineName: "1",
        operatorShortName: "Go North West",
        destination: "Piccadilly Rail Station",
        origin: "Piccadilly Rail Station",
        nocCode: "GONW",
        dataSource: "bods",
        stops: ["1800SB05801"],
        routes: {
            inbound: [],
            outbound: [
                {
                    longitude: -2.250992,
                    latitude: 53.47434,
                },
                {
                    longitude: -2.238434,
                    latitude: 53.47841,
                },
                {
                    longitude: -2.241588,
                    latitude: 53.47653,
                },
                {
                    longitude: -2.243106,
                    latitude: 53.47596,
                },
                {
                    longitude: -2.251658,
                    latitude: 53.47496,
                },
                {
                    longitude: -2.252128,
                    latitude: 53.475891,
                },
                {
                    longitude: -2.253934,
                    latitude: 53.47756,
                },
                {
                    longitude: -2.25358,
                    latitude: 53.47893,
                },
                {
                    longitude: -2.249449,
                    latitude: 53.48111,
                },
                {
                    longitude: -2.243361,
                    latitude: 53.48097,
                },
                {
                    longitude: -2.239983,
                    latitude: 53.48056,
                },
                {
                    longitude: -2.239061,
                    latitude: 53.48007,
                },
                {
                    longitude: -2.232454,
                    latitude: 53.47874,
                },
            ],
        },
    },
    {
        id: 10778,
        lineName: "191",
        operatorShortName: "Stagecoach",
        destination: "Hazel Grove",
        origin: "Manchester(Albert Sq)",
        nocCode: "SCMN",
        dataSource: "bods",
        stops: ["1800SB05751"],
        routes: {
            inbound: [
                {
                    longitude: -2.113081,
                    latitude: 53.37412,
                },
                {
                    longitude: -2.115177,
                    latitude: 53.37633,
                },
                {
                    longitude: -2.117797,
                    latitude: 53.37818,
                },
                {
                    longitude: -2.12004,
                    latitude: 53.37931,
                },
                {
                    longitude: -2.124784,
                    latitude: 53.38216,
                },
                {
                    longitude: -2.126065,
                    latitude: 53.38332,
                },
                {
                    longitude: -2.128355,
                    latitude: 53.38491,
                },
                {
                    longitude: -2.132421,
                    latitude: 53.38691,
                },
                {
                    longitude: -2.136561,
                    latitude: 53.388567,
                },
                {
                    longitude: -2.141226,
                    latitude: 53.39004,
                },
                {
                    longitude: -2.144781,
                    latitude: 53.39174,
                },
                {
                    longitude: -2.147042,
                    latitude: 53.39333,
                },
                {
                    longitude: -2.148762,
                    latitude: 53.39498,
                },
                {
                    longitude: -2.150436,
                    latitude: 53.39635,
                },
                {
                    longitude: -2.151944,
                    latitude: 53.39765,
                },
                {
                    longitude: -2.154056,
                    latitude: 53.39928,
                },
                {
                    longitude: -2.156667,
                    latitude: 53.40184,
                },
                {
                    longitude: -2.158089,
                    latitude: 53.40396,
                },
                {
                    longitude: -2.160373,
                    latitude: 53.40742,
                },
                {
                    longitude: -2.164402,
                    latitude: 53.410662,
                },
                {
                    longitude: -2.16689,
                    latitude: 53.41215,
                },
                {
                    longitude: -2.16869,
                    latitude: 53.41467,
                },
                {
                    longitude: -2.169856,
                    latitude: 53.41653,
                },
                {
                    longitude: -2.171537,
                    latitude: 53.419326,
                },
                {
                    longitude: -2.173459,
                    latitude: 53.42211,
                },
                {
                    longitude: -2.175367,
                    latitude: 53.424812,
                },
                {
                    longitude: -2.177501,
                    latitude: 53.427713,
                },
                {
                    longitude: -2.179255,
                    latitude: 53.42989,
                },
                {
                    longitude: -2.181659,
                    latitude: 53.43227,
                },
                {
                    longitude: -2.183353,
                    latitude: 53.434131,
                },
                {
                    longitude: -2.184943,
                    latitude: 53.43642,
                },
                {
                    longitude: -2.18738,
                    latitude: 53.4395,
                },
                {
                    longitude: -2.189149,
                    latitude: 53.44121,
                },
                {
                    longitude: -2.190948,
                    latitude: 53.442882,
                },
                {
                    longitude: -2.191637,
                    latitude: 53.44561,
                },
                {
                    longitude: -2.191798,
                    latitude: 53.44786,
                },
                {
                    longitude: -2.193134,
                    latitude: 53.45029,
                },
                {
                    longitude: -2.195783,
                    latitude: 53.45338,
                },
                {
                    longitude: -2.197551,
                    latitude: 53.45464,
                },
                {
                    longitude: -2.202111,
                    latitude: 53.458176,
                },
                {
                    longitude: -2.205632,
                    latitude: 53.4597,
                },
                {
                    longitude: -2.209053,
                    latitude: 53.46011,
                },
                {
                    longitude: -2.212296,
                    latitude: 53.4612,
                },
                {
                    longitude: -2.216882,
                    latitude: 53.46255,
                },
                {
                    longitude: -2.218964,
                    latitude: 53.46312,
                },
                {
                    longitude: -2.221618,
                    latitude: 53.46386,
                },
                {
                    longitude: -2.229327,
                    latitude: 53.463165,
                },
                {
                    longitude: -2.232166,
                    latitude: 53.464616,
                },
                {
                    longitude: -2.234924,
                    latitude: 53.467531,
                },
                {
                    longitude: -2.237606,
                    latitude: 53.47046,
                },
                {
                    longitude: -2.242171,
                    latitude: 53.475634,
                },
                {
                    longitude: -2.243216,
                    latitude: 53.47673,
                },
                {
                    longitude: -2.247336,
                    latitude: 53.47795,
                },
                {
                    longitude: -2.244697,
                    latitude: 53.480024,
                },
                {
                    longitude: -2.243881,
                    latitude: 53.479648,
                },
            ],
            outbound: [],
        },
    },
    {
        id: 1483,
        lineName: "X39",
        operatorShortName: "Diamond Bus (North West)",
        destination: "Little Hulton Precinct",
        origin: "MANCHESTER Picadilly",
        nocCode: "GTRI",
        dataSource: "bods",
        stops: ["1800SB05801"],
        routes: {
            inbound: [
                {
                    longitude: -2.394763,
                    latitude: 53.54844,
                },
                {
                    longitude: -2.398923,
                    latitude: 53.5479,
                },
                {
                    longitude: -2.402464,
                    latitude: 53.548843,
                },
                {
                    longitude: -2.406155,
                    latitude: 53.54817,
                },
                {
                    longitude: -2.410057,
                    latitude: 53.547469,
                },
                {
                    longitude: -2.411278,
                    latitude: 53.54578,
                },
                {
                    longitude: -2.412011,
                    latitude: 53.54351,
                },
                {
                    longitude: -2.413253,
                    latitude: 53.54093,
                },
                {
                    longitude: -2.410647,
                    latitude: 53.53983,
                },
                {
                    longitude: -2.415305,
                    latitude: 53.53629,
                },
                {
                    longitude: -2.418972,
                    latitude: 53.53482,
                },
                {
                    longitude: -2.420579,
                    latitude: 53.53407,
                },
                {
                    longitude: -2.422395,
                    latitude: 53.5346,
                },
                {
                    longitude: -2.42369,
                    latitude: 53.53587,
                },
                {
                    longitude: -2.42555,
                    latitude: 53.5378,
                },
                {
                    longitude: -2.428802,
                    latitude: 53.53853,
                },
                {
                    longitude: -2.430899,
                    latitude: 53.53704,
                },
                {
                    longitude: -2.431023,
                    latitude: 53.53585,
                },
                {
                    longitude: -2.431378,
                    latitude: 53.53371,
                },
                {
                    longitude: -2.427546,
                    latitude: 53.53222,
                },
                {
                    longitude: -2.424747,
                    latitude: 53.53147,
                },
                {
                    longitude: -2.421523,
                    latitude: 53.53037,
                },
                {
                    longitude: -2.418873,
                    latitude: 53.52937,
                },
                {
                    longitude: -2.417404,
                    latitude: 53.52882,
                },
                {
                    longitude: -2.411943,
                    latitude: 53.52718,
                },
                {
                    longitude: -2.408131,
                    latitude: 53.52613,
                },
                {
                    longitude: -2.40432,
                    latitude: 53.52514,
                },
                {
                    longitude: -2.40116,
                    latitude: 53.52431,
                },
                {
                    longitude: -2.397353,
                    latitude: 53.52365,
                },
                {
                    longitude: -2.393692,
                    latitude: 53.52251,
                },
                {
                    longitude: -2.391836,
                    latitude: 53.52242,
                },
                {
                    longitude: -2.384392,
                    latitude: 53.52317,
                },
                {
                    longitude: -2.381209,
                    latitude: 53.52321,
                },
                {
                    longitude: -2.375396,
                    latitude: 53.52252,
                },
                {
                    longitude: -2.36956,
                    latitude: 53.52097,
                },
                {
                    longitude: -2.363922,
                    latitude: 53.51947,
                },
                {
                    longitude: -2.359825,
                    latitude: 53.51838,
                },
                {
                    longitude: -2.357287,
                    latitude: 53.51786,
                },
                {
                    longitude: -2.352681,
                    latitude: 53.51712,
                },
                {
                    longitude: -2.34869,
                    latitude: 53.51597,
                },
                {
                    longitude: -2.345757,
                    latitude: 53.51506,
                },
                {
                    longitude: -2.341414,
                    latitude: 53.51318,
                },
                {
                    longitude: -2.339443,
                    latitude: 53.5119,
                },
                {
                    longitude: -2.334736,
                    latitude: 53.50962,
                },
                {
                    longitude: -2.331119,
                    latitude: 53.50797,
                },
                {
                    longitude: -2.325989,
                    latitude: 53.50747,
                },
                {
                    longitude: -2.323663,
                    latitude: 53.50699,
                },
                {
                    longitude: -2.319748,
                    latitude: 53.50572,
                },
                {
                    longitude: -2.313488,
                    latitude: 53.50324,
                },
                {
                    longitude: -2.279239,
                    latitude: 53.48784,
                },
                {
                    longitude: -2.275516,
                    latitude: 53.48549,
                },
                {
                    longitude: -2.272315,
                    latitude: 53.48444,
                },
                {
                    longitude: -2.265813,
                    latitude: 53.48336,
                },
                {
                    longitude: -2.260494,
                    latitude: 53.48342,
                },
                {
                    longitude: -2.254267,
                    latitude: 53.48285,
                },
                {
                    longitude: -2.249449,
                    latitude: 53.48111,
                },
                {
                    longitude: -2.243361,
                    latitude: 53.48097,
                },
                {
                    longitude: -2.239983,
                    latitude: 53.48056,
                },
                {
                    longitude: -2.236921,
                    latitude: 53.47994,
                },
            ],
            outbound: [],
        },
    },
];

const mockMarkerDataResult = [
    {
        atcoCode: "1800SB05801",
        commonName: "Cheapside",
        indicator: "Stop CO",
        longitude: -2.243361,
        latitude: 53.48097,
        bearing: "E",
        stopType: "BCT",
        busStopType: "MKD",
        serviceIds: [833, 1483],
    },
    {
        atcoCode: "1800SB05751",
        commonName: "Manchester Town Hall",
        indicator: "Stop SC",
        longitude: -2.244697,
        latitude: 53.480024,
        bearing: "SE",
        stopType: "BCT",
        busStopType: "MKD",
        serviceIds: [10778],
    },
];

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
});
