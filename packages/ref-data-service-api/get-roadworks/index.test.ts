import { APIGatewayEvent } from "aws-lambda";
import { describe, expect, it } from "vitest";

import { getQueryInput } from "../get-roadworks";

describe("get-roadworks", () => {
    describe("input generation", () => {
        it("only returns adminAreaCodes if present", () => {
            const event = {
                queryStringParameters: {
                    adminAreaCodes: "099",
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({ adminAreaCodes: ["099"], page: 0 });
        });

        it("only returns adminAreaCodes if present", () => {
            const event = {
                queryStringParameters: {
                    adminAreaCodes: "099,089",
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({ adminAreaCodes: ["099", "089"], page: 0 });
        });

        it("handles adminAreaCodes with trailing or leading spaces", () => {
            const event = {
                queryStringParameters: {
                    adminAreaCodes: " 099     , 089",
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({ adminAreaCodes: ["099", "089"], page: 0 });
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
    });
});
