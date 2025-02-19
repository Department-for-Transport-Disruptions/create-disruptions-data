import { APIGatewayEvent } from "aws-lambda";
import { describe, expect, it } from "vitest";

import { Datasource } from "@create-disruptions-data/shared-ts/enums";

import { stopsDbData } from "../testdata/sample_data";
import { ServiceStop, ServiceTracks } from "../utils/db";
import { RefVehicleMode } from "../utils/enums";
import { formatStopsRoutes, getQueryInput } from "./index";

describe("get-service-routes", () => {
    describe("input generation", () => {
        it("handles serviceId", () => {
            const event = {
                pathParameters: {
                    serviceId: "234",
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({ serviceRef: "234", useTracks: true, dataSource: Datasource.bods });
        });

        it("handles serviceCode or lineId with datasource", () => {
            const event = {
                pathParameters: {
                    serviceId: "abc",
                },
                queryStringParameters: {
                    dataSource: "bods",
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({ dataSource: "bods", serviceRef: "abc", useTracks: true });
        });

        it("defaults to bods if no datasource provided", () => {
            const event = {
                pathParameters: {
                    serviceId: "234",
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({
                serviceRef: "234",
                dataSource: Datasource.bods,
                useTracks: true,
            });
        });

        it("throws a ClientError if no serviceId provided", () => {
            const event = {
                pathParameters: {},
            } as unknown as APIGatewayEvent;

            expect(() => getQueryInput(event)).toThrowError("Service Ref must be provided");
        });

        it("handles serviceId and modes", () => {
            const event = {
                pathParameters: {
                    serviceId: "234",
                },
                queryStringParameters: {
                    modes: RefVehicleMode.bus,
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({
                serviceRef: "234",
                modes: [RefVehicleMode.bus, RefVehicleMode.blank],
                useTracks: true,
                dataSource: Datasource.bods,
            });
        });
    });

    describe("format service", () => {
        it("correctly formats db response", async () => {
            const formattedService: { outbound: ServiceStop[] | ServiceTracks; inbound: ServiceStop[] } =
                await formatStopsRoutes(stopsDbData);

            expect(formattedService).toMatchSnapshot();
        });
    });
});
