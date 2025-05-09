import { Database } from "@create-disruptions-data/shared-ts/db/types";
import { Datasource } from "@create-disruptions-data/shared-ts/enums";
import { APIGatewayEvent } from "aws-lambda";
import { Kysely } from "kysely";
import { describe, expect, it, vi } from "vitest";
import {
    expectedFormattedServicesWithStops,
    expectedFormattedServicesWithStopsAndRoutes,
    serviceWithStopsData,
    stopsDbData,
} from "../testdata/sample_data";
import * as client from "../utils/db";
import { formatServicesWithStops, getQueryInput, getServicesByStopsQueryInput } from "./index";

describe("get-services", () => {
    describe("input generation", () => {
        it("handles modes", () => {
            const event = {
                queryStringParameters: {
                    modes: "bus,tram",
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({ modes: ["bus", "tram", ""], dataSource: "bods", page: 0 });
        });

        it("handles modes with trailing or leading spaces", () => {
            const event = {
                queryStringParameters: {
                    modes: " bus     , tram",
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({ modes: ["bus", "tram", ""], dataSource: "bods", page: 0 });
        });

        it("handles dataSource", () => {
            const event = {
                queryStringParameters: {
                    dataSource: "tnds",
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({ dataSource: "tnds", page: 0 });
        });

        it("handles page numbers", () => {
            const event = {
                queryStringParameters: {
                    page: "8",
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({
                dataSource: "bods",
                page: 7,
            });
        });

        it("handles adminAreaCode", () => {
            const event = {
                queryStringParameters: {
                    adminAreaCodes: "009,001",
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({ adminAreaCodes: ["009", "001"], dataSource: "bods", page: 0 });
        });

        it("handles nocCodes", () => {
            const event = {
                queryStringParameters: {
                    nocCodes: "TEST1,TEST2",
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({ nocCodes: ["TEST1", "TEST2"], dataSource: "bods", page: 0 });
        });

        it("throws a ClientError if invalid dataSource provided", () => {
            const event = {
                queryStringParameters: {
                    dataSource: "1234",
                },
            } as unknown as APIGatewayEvent;

            expect(() => getQueryInput(event)).toThrowError("Provided dataSource must be tnds or bods");
        });

        it("throws a ClientError for an invalid page number", () => {
            const event = {
                queryStringParameters: {
                    page: "abc",
                },
            } as unknown as APIGatewayEvent;

            expect(() => getQueryInput(event)).toThrowError("Provided page is not valid");
        });

        it("throws a ClientError for invalid mode", () => {
            const event = {
                queryStringParameters: {
                    modes: "bus,invalid",
                },
            } as unknown as APIGatewayEvent;

            expect(() => getQueryInput(event)).toThrowError("Invalid mode provided");
        });
    });

    describe("getServicesByStopsQueryInput input generation", () => {
        it("handles modes", () => {
            const event = {
                queryStringParameters: {
                    modes: "bus,tram",
                },
            } as unknown as APIGatewayEvent;

            expect(getServicesByStopsQueryInput(event)).toEqual({
                modes: ["bus", "tram", ""],
                includeRoutes: false,
                stops: [],
                dataSource: "bods",
                page: 0,
            });
        });

        it("handles dataSource", () => {
            const event = {
                queryStringParameters: {
                    dataSource: "tnds",
                },
            } as unknown as APIGatewayEvent;

            expect(getServicesByStopsQueryInput(event)).toEqual({
                dataSource: "tnds",
                page: 0,
                includeRoutes: false,
                stops: [],
            });
        });

        it("handles page numbers", () => {
            const event = {
                queryStringParameters: {
                    page: "8",
                },
            } as unknown as APIGatewayEvent;

            expect(getServicesByStopsQueryInput(event)).toEqual({
                dataSource: "bods",
                page: 7,
                includeRoutes: false,
                stops: [],
            });
        });

        it("handles adminAreaCode", () => {
            const event = {
                queryStringParameters: {
                    adminAreaCodes: "009,001",
                },
            } as unknown as APIGatewayEvent;

            expect(getServicesByStopsQueryInput(event)).toEqual({
                adminAreaCodes: ["009", "001"],
                dataSource: "bods",
                page: 0,
                includeRoutes: false,
                stops: [],
            });
        });

        it("handles nocCodes", () => {
            const event = {
                queryStringParameters: {
                    nocCodes: "TEST1,TEST2",
                },
            } as unknown as APIGatewayEvent;

            expect(getServicesByStopsQueryInput(event)).toEqual({
                nocCodes: ["TEST1", "TEST2"],
                dataSource: "bods",
                page: 0,
                includeRoutes: false,
                stops: [],
            });
        });

        it("handles atcoCodes", () => {
            const event = {
                queryStringParameters: {
                    atcoCodes: "370023891,370023899,370025036",
                },
            } as unknown as APIGatewayEvent;

            expect(getServicesByStopsQueryInput(event)).toEqual({
                stops: ["370023891", "370023899", "370025036"],
                includeRoutes: false,
                dataSource: "bods",
                page: 0,
            });
        });

        it("handles includeRoutes", () => {
            const event = {
                queryStringParameters: {
                    includeRoutes: "true",
                },
            } as unknown as APIGatewayEvent;

            expect(getServicesByStopsQueryInput(event)).toEqual({
                stops: [],
                includeRoutes: true,
                dataSource: "bods",
                page: 0,
            });
        });

        it("throws a ClientError if invalid dataSource provided", () => {
            const event = {
                queryStringParameters: {
                    dataSource: "1234",
                },
            } as unknown as APIGatewayEvent;

            expect(() => getServicesByStopsQueryInput(event)).toThrowError("Provided dataSource must be tnds or bods");
        });

        it("throws a ClientError for an invalid page number", () => {
            const event = {
                queryStringParameters: {
                    page: "abc",
                },
            } as unknown as APIGatewayEvent;

            expect(() => getServicesByStopsQueryInput(event)).toThrowError("Provided page is not valid");
        });

        it("throws a ClientError for invalid mode", () => {
            const event = {
                queryStringParameters: {
                    modes: "bus,invalid",
                },
            } as unknown as APIGatewayEvent;

            expect(() => getServicesByStopsQueryInput(event)).toThrowError("Invalid mode provided");
        });
    });

    describe("formatServicesWithStops", () => {
        it("handles without routes", async () => {
            const formattedServices = await formatServicesWithStops(
                serviceWithStopsData,
                {
                    dataSource: Datasource.bods,
                    page: 0,
                    stops: ["370023891", "370023899", "370025036"],
                    includeRoutes: false,
                },
                vi.fn() as unknown as Kysely<Database>,
            );

            expect(formattedServices).toEqual(expectedFormattedServicesWithStops);
        });

        it("handles with routes", async () => {
            const serviceStopsSpy = vi.spyOn(client, "getServiceStops");

            serviceStopsSpy.mockImplementationOnce(async () =>
                Promise.resolve(stopsDbData.map((s) => ({ ...s, serviceId: 1 }))),
            );
            serviceStopsSpy.mockImplementationOnce(async () =>
                Promise.resolve(stopsDbData.map((s) => ({ ...s, serviceId: 2 }))),
            );
            serviceStopsSpy.mockImplementationOnce(async () =>
                Promise.resolve(stopsDbData.map((s) => ({ ...s, serviceId: 3 }))),
            );

            const formattedServices = await formatServicesWithStops(
                serviceWithStopsData,
                {
                    dataSource: Datasource.bods,
                    page: 0,
                    stops: ["370023891", "370023899", "370025036"],
                    includeRoutes: true,
                },
                vi.fn() as unknown as Kysely<Database>,
            );

            expect(formattedServices).toEqual(expectedFormattedServicesWithStopsAndRoutes);
        });
    });
});
