import * as utils from "@create-disruptions-data/shared-ts/utils";
import * as ssm from "@create-disruptions-data/shared-ts/utils/ssm";
import { describe, it, vi, beforeEach, beforeAll, afterEach, expect } from "vitest";
import { main } from ".";

describe("nextdoorTokenRefresher", () => {
    beforeAll(() => {
        process.env.DOMAIN_NAME = "http://localhost:3000";
        process.env.STAGE = "sandbox";
    });

    vi.mock("@create-disruptions-data/shared-ts/utils/ssm", () => ({
        putParameter: vi.fn(),
        getParametersByPath: vi.fn(),
    }));

    vi.mock("@create-disruptions-data/shared-ts/utils", () => ({
        getNextdoorAuthHeader: vi.fn(),
    }));

    const fetchSpy = vi.spyOn(global, "fetch");
    const putParameterSpy = vi.spyOn(ssm, "putParameter");
    const getParametersByPathSpy = vi.spyOn(ssm, "getParametersByPath");
    const getNextdoorAuthHeaderSpy = vi.spyOn(utils, "getNextdoorAuthHeader");

    beforeEach(() => {
        getParametersByPathSpy.mockResolvedValue({
            Parameters: [
                { Name: "/social/nextdoor/client_id", Value: "some-client-id" },
                { Name: "/social/nextdoor/client_secret", Value: "some-client-secret" },
                { Name: "/social/nextdoor/some-org/1234", Value: "232424rregweg" },
                { Name: "/social/nextdoor/another-org/1234", Value: "232424rregweg" },
            ],
        });
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should refresh token and upload new token to ssm if tokenRefreshResponse returns 200 status code", async () => {
        fetchSpy.mockResolvedValue({
            json: vi.fn().mockResolvedValue({
                token_type: "refresh_token",
                access_token: "jirfjiorjfe",
                id_token: "ufhiufhriuf",
                expires_in: 10000,
            }),
            status: 200,
            ok: true,
        } as unknown as Response);

        getNextdoorAuthHeaderSpy.mockResolvedValue(
            `Basic ${Buffer.from(`some-client-id:some-client-secret`).toString("base64")}`,
        );

        await main();

        expect(putParameterSpy).toBeCalledTimes(2);
    });

    it("should throw an error if nextdoor auth headers aren't found", async () => {
        getNextdoorAuthHeaderSpy.mockResolvedValue("");

        await expect(async () => await main()).rejects.toThrowError("Failed to get auth header for next door");
        expect(putParameterSpy).not.toBeCalled();
    });

    it("should not call putParameter for an individual token if tokenRefreshResponse doesn't return a 200 status code", async () => {
        getNextdoorAuthHeaderSpy.mockResolvedValue(
            `Basic ${Buffer.from(`some-client-id:some-client-secret`).toString("base64")}`,
        );

        fetchSpy.mockResolvedValue({
            json: vi.fn().mockResolvedValue({
                data: "",
            }),
            status: 400,
            ok: false,
        } as unknown as Response);

        await main();

        expect(putParameterSpy).not.toBeCalledTimes(2);
    });
});
