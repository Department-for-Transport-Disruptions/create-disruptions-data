import { APIGatewayEvent } from "aws-lambda";
import { describe, expect, it } from "vitest";

import { getQueryInput } from "./index";

describe("get-service-by-id", () => {
    describe("input generation", () => {
        it("handles nocCode and serviceId", () => {
            const event = {
                pathParameters: {
                    nocCode: "TEST",
                    serviceId: "234",
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({ nocCode: "TEST", serviceRef: "234", dataSource: "bods" });
        });

        it("handles nocCode and serviceId", () => {
            const event = {
                pathParameters: {
                    nocCode: "TEST",
                    serviceId: "234",
                },
                queryStringParameters: {
                    dataSource: "tnds",
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({ nocCode: "TEST", serviceRef: "234", dataSource: "tnds" });
        });

        it("throws a ClientError if no nocCode provided", () => {
            const event = {
                pathParameters: {
                    serviceId: "234",
                },
            } as unknown as APIGatewayEvent;

            expect(() => getQueryInput(event)).toThrowError("NOC must be provided");
        });

        it("throws a ClientError if no serviceId provided", () => {
            const event = {
                pathParameters: {
                    nocCode: "TEST",
                },
            } as unknown as APIGatewayEvent;

            expect(() => getQueryInput(event)).toThrowError("Service ref must be provided");
        });
    });
});
