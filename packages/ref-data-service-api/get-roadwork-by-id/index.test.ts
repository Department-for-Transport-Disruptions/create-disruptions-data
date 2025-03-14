import { APIGatewayEvent } from "aws-lambda";
import { describe, expect, it } from "vitest";

import { getQueryInput } from "../get-roadwork-by-id";

describe("get-roadwork-by-id", () => {
    describe("input generation", () => {
        it("only returns page if its valid number", () => {
            const event = {
                queryStringParameters: {
                    page: "5",
                },
            } as unknown as APIGatewayEvent;
            expect(getQueryInput(event)).toEqual({ page: 4 });
        });

        it("throws a ClientError if page not a number", () => {
            const event = {
                queryStringParameters: {
                    page: "a",
                },
            } as unknown as APIGatewayEvent;

            expect(() => getQueryInput(event)).toThrowError("Provided page is not valid");
        });
    });
});
