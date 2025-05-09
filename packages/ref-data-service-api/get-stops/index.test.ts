import { APIGatewayEvent } from "aws-lambda";
import { describe, expect, it } from "vitest";
import { getQueryInput } from "./index";

describe("get-stops", () => {
    describe("input generation", () => {
        it("handles atcoCodes", () => {
            const event = {
                queryStringParameters: {
                    atcoCodes: "test123,test456",
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({ atcoCodes: ["test123", "test456"], page: 0 });
        });

        it("handles search input", () => {
            const event = {
                queryStringParameters: {
                    search: "test",
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({ searchInput: "test", page: 0 });
        });

        it("handles naptanCodes", () => {
            const event = {
                queryStringParameters: {
                    naptanCodes: "abcde,fghij",
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({ naptanCodes: ["abcde", "fghij"], page: 0 });
        });

        it("handles atcoCodes and naptanCodes", () => {
            const event = {
                queryStringParameters: {
                    atcoCodes: "test123,test456",
                    naptanCodes: "abcde,fghij",
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({
                atcoCodes: ["test123", "test456"],
                naptanCodes: ["abcde", "fghij"],
                page: 0,
            });
        });

        it("handles searchInput and atcoCodes and naptanCodes", () => {
            const event = {
                queryStringParameters: {
                    search: "test",
                    atcoCodes: "test123,test456",
                    naptanCodes: "abcde,fghij",
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({
                searchInput: "test",
                atcoCodes: ["test123", "test456"],
                naptanCodes: ["abcde", "fghij"],
                page: 0,
            });
        });

        it("handles adminAreaCode", () => {
            const event = {
                queryStringParameters: {
                    adminAreaCodes: "009,001",
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({ adminAreaCodes: ["009", "001"], page: 0 });
        });

        it("handles searchInput and adminAreaCode", () => {
            const event = {
                queryStringParameters: {
                    search: "test",
                    adminAreaCodes: "009",
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({ searchInput: "test", adminAreaCodes: ["009"], page: 0 });
        });

        it("handles polygons and adminAreaCode", () => {
            const event = {
                queryStringParameters: {
                    polygon:
                        "[[-1.4848897,53.3942186],[-1.3818929,53.3876669],[-1.4114186,53.4265529],[-1.4848897,53.3942186]]",
                    adminAreaCodes: "009",
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({
                adminAreaCodes: ["009"],
                polygon:
                    "POLYGON((-1.4848897 53.3942186,-1.3818929 53.3876669,-1.4114186 53.4265529,-1.4848897 53.3942186))",
                page: 0,
            });
        });

        it("handles atcoCodes and naptanCodes with trailing or leading spaces", () => {
            const event = {
                queryStringParameters: {
                    atcoCodes: " test123   ,  test456 ",
                    naptanCodes: "abcde , fghij",
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({
                atcoCodes: ["test123", "test456"],
                naptanCodes: ["abcde", "fghij"],
                page: 0,
            });
        });

        it("handles page numbers", () => {
            const event = {
                queryStringParameters: {
                    page: "5",
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({
                page: 4,
            });
        });

        it("handles stopTypes", () => {
            const event = {
                queryStringParameters: {
                    stopTypes: "BCT",
                },
            } as unknown as APIGatewayEvent;

            expect(getQueryInput(event)).toEqual({
                stopTypes: ["BCT"],
                page: 0,
            });
        });

        it("throws a ClientError for too many atcoCodes", () => {
            const event = {
                queryStringParameters: {
                    atcoCodes: "test123,test456,test789,test111,test222,test333",
                },
            } as unknown as APIGatewayEvent;

            expect(() => getQueryInput(event)).toThrowError("Only up to 5 ATCO codes can be provided");
        });

        it("throws a ClientError for too many naptanCodes", () => {
            const event = {
                queryStringParameters: {
                    naptanCodes: "abcde,fghij,klmno,pqrst,uvwxy,zabcd",
                },
            } as unknown as APIGatewayEvent;

            expect(() => getQueryInput(event)).toThrowError("Only up to 5 NaPTAN codes can be provided");
        });

        it("throws a ClientError for an invalid page number", () => {
            const event = {
                queryStringParameters: {
                    page: "abc",
                },
            } as unknown as APIGatewayEvent;

            expect(() => getQueryInput(event)).toThrowError("Provided page is not valid");
        });

        it("throws a ClientError if polygon provided without adminAreaCodes", () => {
            const event = {
                queryStringParameters: {
                    polygon:
                        "[[-1.4848897,53.3942186],[-1.3818929,53.3876669],[-1.4114186,53.4265529],[-1.4848897,53.3942186]]",
                },
            } as unknown as APIGatewayEvent;

            expect(() => getQueryInput(event)).toThrowError(
                "Admin area codes must be provided when providing a polygon",
            );
        });

        it("throws a ClientError if invalid polygon provided", () => {
            const event = {
                queryStringParameters: {
                    adminAreaCodes: "099",
                    polygon: "[[1, 2]]",
                },
            } as unknown as APIGatewayEvent;

            expect(() => getQueryInput(event)).toThrowError("Invalid polygon provided");
        });

        it("throws a ClientError if provided polygon is too large", () => {
            const event = {
                queryStringParameters: {
                    adminAreaCodes: "099",
                    polygon:
                        "[[-1.4848897,53.3942186],[-1.0818929,53.3876669],[-1.0114186,53.4265529],[-0.4848897,70.3942186]]",
                },
            } as unknown as APIGatewayEvent;

            expect(() => getQueryInput(event)).toThrowError("Area of polygon must be below 36km2");
        });
    });
});
