import { APIGatewayEvent } from "aws-lambda";
import { describe, expect, it } from "vitest";
import { RefVehicleMode } from "../utils/enums";
import { getQueryInput } from "./index";

describe("get-operators", () => {
    describe("input generation", () => {
        it("only returns nocCode if present", () => {
            const event = {
                pathParameters: {
                    nocCode: "TEST",
                },
                queryStringParameters: {
                    nocCodes: "TEST1,TEST2",
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({ nocCode: "TEST" });
        });

        it("handles batch nocCodes", () => {
            const event = {
                queryStringParameters: {
                    nocCodes: "TEST1,TEST2",
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({ batchNocCodes: ["TEST1", "TEST2"], page: 0 });
        });

        it("handles nocCodes with trailing or leading spaces", () => {
            const event = {
                queryStringParameters: {
                    nocCodes: " TEST1     , TEST2",
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({ batchNocCodes: ["TEST1", "TEST2"], page: 0 });
        });

        it("handles page numbers", () => {
            const event = {
                queryStringParameters: {
                    page: "8",
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({
                page: 7,
            });
        });

        it("handles admin area codes", () => {
            const event = {
                queryStringParameters: {
                    adminAreaCodes: "099,080",
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({
                adminAreaCodes: ["099", "080"],
                page: 0,
            });
        });

        it("handles modes", () => {
            const event = {
                queryStringParameters: {
                    modes: "bus,tram",
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({
                modes: [RefVehicleMode.bus, RefVehicleMode.tram, RefVehicleMode.blank],
                page: 0,
            });
        });

        it("throws a ClientError for too many nocCodes", () => {
            const event = {
                queryStringParameters: {
                    nocCodes: "TEST1,TEST2,TEST3,TEST4,TEST5,TEST6",
                },
            } as unknown as APIGatewayEvent;

            expect(() => getQueryInput(event)).toThrowError("Only up to 5 NOC codes can be provided");
        });

        it("throws a ClientError for an invalid page number", () => {
            const event = {
                queryStringParameters: {
                    page: "abc",
                },
            } as unknown as APIGatewayEvent;

            expect(() => getQueryInput(event)).toThrowError("Provided page is not valid");
        });

        it("throws a ClientError for too many admin area codes", () => {
            const event = {
                queryStringParameters: {
                    adminAreaCodes: "099,080,001,002,003,004",
                },
            } as unknown as APIGatewayEvent;

            expect(() => getQueryInput(event)).toThrowError("Only up to 5 administrative area codes can be provided");
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
});
