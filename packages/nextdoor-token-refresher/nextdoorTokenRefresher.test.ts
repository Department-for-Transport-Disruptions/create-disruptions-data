import { SSMClient, GetParametersByPathCommand, PutParameterCommand } from "@aws-sdk/client-ssm";
import * as utils from "@create-disruptions-data/shared-ts/utils";
import * as ssm from "@create-disruptions-data/shared-ts/utils/ssm";
import { NextdoorToken, nextdoorTokenSchema } from "@create-disruptions-data/shared-ts/utils/zod";
import { mockClient } from "aws-sdk-client-mock";
import * as logger from "lambda-log";
import { describe, it, vi, beforeAll, beforeEach, afterEach, expect } from "vitest";
import { main } from ".";
import * as nextdoor from ".";

// const ssmMock = mockClient(SSMClient);

vi.mock("@create-disruptions-data/shared-ts/utils/ssm", () => ({
    putParameter: vi.fn(),
    getParametersByPath: vi.fn(),
}));

vi.mock("./", async () => ({
    ...(await vi.importActual<object>("./")),
    refreshToken: vi.fn(),
}));

const putParameterSpy = vi.spyOn(ssm, "putParameter");
const getParametersByPathSpy = vi.spyOn(ssm, "getParametersByPath");
const getNextdoorAuthHeaderSpy = vi.spyOn(utils, "getNextdoorAuthHeader");
const refreshTokenSpy = vi.spyOn(nextdoor, "refreshToken");
const schemaSpy = vi.spyOn(nextdoorTokenSchema, "parse");

vi.mock("@create-disruptions-data/shared-ts/utils", () => ({
    getNextdoorAuthHeader: vi.fn(),
}));

describe("nextdoorTokenRefresher", () => {
    beforeAll(() => {
        process.env.DOMAIN_NAME = "http://localhost:3000";
        process.env.STAGE = "sandbox";
    });

    // beforeEach(() => {
    //     ssmMock.reset();
    // });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should refresh token and upload new token to ssm if tokenRefreshResponse returns 200 status code", async () => {
        getParametersByPathSpy.mockResolvedValue({
            Parameters: [
                { Name: "/social/nextdoor/client_id", Value: "some-client-id" },
                { Name: "/social/nextdoor/client_secret", Value: "some-client-secret" },
                { Name: "/social/nextdoor/some-org/1234", Value: "232424rregweg" },
                { Name: "/social/nextdoor/some-other-org/1254", Value: "232424dgfdgegweg" },
            ],
        });

        getNextdoorAuthHeaderSpy.mockResolvedValue(
            `Basic ${Buffer.from(`some-client-id:some-client-secret`).toString("base64")}`,
        );

        schemaSpy.mockResolvedValue({
            tokenType: "refresh_token",
            accessToken: "jirfjiorjfe",
            idToken: "ufhiufhriuf",
            expiresIn: 10000,
        } as unknown as NextdoorToken);

        schemaSpy.mockResolvedValue({
            tokenType: "refresh_token",
            accessToken: "jiffdgsgfe",
            idToken: "ufhivrtbtrbhriuf",
            expiresIn: 10000,
        } as unknown as NextdoorToken);

        refreshTokenSpy.mockResolvedValueOnce({
            result: {
                tokenType: "refresh_token",
                accessToken: "jirfjiorjfe",
                idToken: "ufhiufhriuf",
                expiresIn: 10000,
            } as unknown as NextdoorToken,
            status: 200,
        });

        refreshTokenSpy.mockResolvedValueOnce({
            result: {
                tokenType: "refresh_token",
                accessToken: "jiffdgsgfe",
                idToken: "ufhivrtbtrbhriuf",
                expiresIn: 10000,
            } as unknown as NextdoorToken,
            status: 200,
        });

        await main();

        expect(getParametersByPathSpy).toBeCalledWith("/social/nextdoor", logger, true);
        expect(putParameterSpy).toBeCalledTimes(2);
    });

    it("should throw an error if nextdoor auth headers aren't found", async () => {
        getParametersByPathSpy.mockResolvedValue({
            Parameters: [
                { Name: "/social/nextdoor/client_id", Value: "some-client-id" },
                { Name: "/social/nextdoor/client_secret", Value: "some-client-secret" },
                { Name: "/social/nextdoor/some-org/1234", Value: "232424rregweg" },
                { Name: "/social/nextdoor/some-other-org/1254", Value: "232424dgfdgegweg" },
            ],
        });

        getNextdoorAuthHeaderSpy.mockResolvedValue("");

        await main();

        expect(refreshTokenSpy).not.toBeCalled();
        expect(getParametersByPathSpy).toBeCalledWith("/social/nextdoor", logger, true);
        expect(putParameterSpy).not.toBeCalledTimes(2);
    });

    it(" should not call putParameter for an individual token if tokenRefreshResponse doesn't return a 200 status code", async () => {
        getParametersByPathSpy.mockResolvedValue({
            Parameters: [
                { Name: "/social/nextdoor/client_id", Value: "some-client-id" },
                { Name: "/social/nextdoor/client_secret", Value: "some-client-secret" },
                { Name: "/social/nextdoor/some-org/1234", Value: "232424rregweg" },
                { Name: "/social/nextdoor/some-other-org/1254", Value: "232424dgfdgegweg" },
            ],
        });

        getNextdoorAuthHeaderSpy.mockResolvedValue(
            `Basic ${Buffer.from(`some-client-id:some-client-secret`).toString("base64")}`,
        );

        schemaSpy.mockResolvedValue({
            tokenType: "refresh_token",
            accessToken: "jirfjiorjfe",
            idToken: "ufhiufhriuf",
            expiresIn: 10000,
        } as unknown as NextdoorToken);

        schemaSpy.mockResolvedValue({
            tokenType: "refresh_token",
            accessToken: "jiffdgsgfe",
            idToken: "ufhivrtbtrbhriuf",
            expiresIn: 10000,
        } as unknown as NextdoorToken);

        refreshTokenSpy.mockResolvedValueOnce({
            result: {
                tokenType: "refresh_token",
                accessToken: "jirfjiorjfe",
                idToken: "ufhiufhriuf",
                expiresIn: 10000,
            } as unknown as NextdoorToken,
            status: 200,
        });

        refreshTokenSpy.mockResolvedValueOnce({
            result: {
                tokenType: "refresh_token",
                accessToken: "jiffdgsgfe",
                idToken: "ufhivrtbtrbhriuf",
                expiresIn: 10000,
            } as unknown as NextdoorToken,
            status: 500,
        });

        await main();

        // expect(ssmMock.commandCalls(GetParametersByPathCommand)[0].args[0].input).toEqual({
        //     Path: "/social/nextdoor",
        //     WithDecryption: true,
        //     Recursive: true,
        // });
    });
});
