import { APIGatewayEvent } from "aws-lambda";
import { describe, expect, it } from "vitest";

import { Datasource } from "@create-disruptions-data/shared-ts/enums";

import { stopsDbData } from "../testdata/sample_data";
import { RefVehicleMode } from "../utils/enums";
import { formatStops, getQueryInput } from "./index";

describe("get-service-stops", () => {
    describe("input generation", () => {
        it("handles serviceId", () => {
            const event = {
                pathParameters: {
                    serviceId: "234",
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({ serviceRef: "234", dataSource: Datasource.bods });
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

            expect(getQueryInput(event)).toEqual({ dataSource: "bods", serviceRef: "abc" });
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
                dataSource: Datasource.bods,
            });
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
            });
        });

        it("throws a ClientError if no serviceId provided", () => {
            const event = {
                pathParameters: {},
            } as unknown as APIGatewayEvent;

            expect(() => getQueryInput(event)).toThrowError("Service Ref must be provided");
        });
    });

    describe("format service", () => {
        it("correctly formats db response", async () => {
            const formattedService = await formatStops(stopsDbData);

            expect(formattedService).toMatchSnapshot();
        });
    });
});
