import { APIGatewayEvent } from "aws-lambda";
import { describe, expect, it } from "vitest";
import { getQueryInput } from "./index";

describe("get-roadwork-by-id", () => {
    describe("input generation", () => {
        it("only returns permitReferenceNumber if present", () => {
            const event = {
                pathParameters: {
                    permitReferenceNumber: "123",
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({ permitReferenceNumber: "123" });
        });

        it("throws a ClientError if permitReferenceNumber not provided", () => {
            const event = {
                pathParameters: {
                    permitReferenceNumber: "",
                },
            } as unknown as APIGatewayEvent;

            expect(() => getQueryInput(event)).toThrowError(
                "permitReferenceNumber is required to get a roadwork by Id",
            );
        });
    });
});
