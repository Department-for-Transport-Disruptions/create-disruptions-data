import { NotAuthorizedException } from "@aws-sdk/client-cognito-identity-provider";
import { describe, it, expect, afterEach, vi } from "vitest";
import login from "./login.api";
import { COOKIES_LOGIN_ERRORS, DASHBOARD_PAGE_PATH, ERROR_PATH, LOGIN_PAGE_PATH } from "../../constants";
import * as cognito from "../../data/cognito";
import { ErrorInfo } from "../../interfaces";
import { getMockRequestAndResponse } from "../../testData/mockData";
import { destroyCookieOnResponseObject, setCookieOnResponseObject } from "../../utils/apiUtils";

describe("login", () => {
    const writeHeadMock = vi.fn();
    vi.mock("../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
    }));

    const initiateAuthSpy = vi.spyOn(cognito, "initiateAuth");

    vi.mock("../../data/cognito", () => ({
        initiateAuth: vi.fn(),
    }));

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should redirect to login page when incorrect inputs are passed", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {},
            mockWriteHeadFn: writeHeadMock,
        });

        await login(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Required", id: "email" },
            { errorMessage: "Enter a password", id: "password" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_LOGIN_ERRORS,
            JSON.stringify({ inputs: req.body as object, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: LOGIN_PAGE_PATH });
    });

    it("should redirect to /dashboard page when valid inputs are passed", async () => {
        initiateAuthSpy.mockImplementation(() =>
            Promise.resolve({
                $metadata: {},
                AuthenticationResult: {
                    IdToken: "test",
                    RefreshToken: "test",
                },
            }),
        );

        const { req, res } = getMockRequestAndResponse({
            body: {
                email: "dummyUser@gmail.com",
                password: "dummyPassword",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await login(req, res);

        expect(destroyCookieOnResponseObject).toHaveBeenCalledTimes(1);

        expect(writeHeadMock).toBeCalledWith(302, { Location: DASHBOARD_PAGE_PATH });
    });

    it("should redirect to error page when invalid auth response is received", async () => {
        initiateAuthSpy.mockImplementation(() => {
            throw new Error("invalid", {
                cause: "Invalid",
            });
        });

        const { req, res } = getMockRequestAndResponse({
            body: {
                email: "dummyUser@gmail.com",
                password: "dummyPassword",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await login(req, res);

        expect(writeHeadMock).toBeCalledWith(302, { Location: ERROR_PATH });
    });

    it("should redirect to error page when no id token returned", async () => {
        initiateAuthSpy.mockImplementation(() =>
            Promise.resolve({
                $metadata: {},
                AuthenticationResult: {
                    IdToken: "",
                    RefreshToken: "test",
                },
            }),
        );

        const { req, res } = getMockRequestAndResponse({
            body: {
                email: "dummyUser@gmail.com",
                password: "dummyPassword",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await login(req, res);

        expect(writeHeadMock).toBeCalledWith(302, { Location: ERROR_PATH });
    });

    it("should redirect to login page when incorrect password received", async () => {
        initiateAuthSpy.mockImplementation(() => {
            throw new NotAuthorizedException({
                message: "Not authorised",
                $metadata: {},
            });
        });

        const { req, res } = getMockRequestAndResponse({
            body: {
                email: "dummyUser@gmail.com",
                password: "dummyPassword",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await login(req, res);

        const errors: ErrorInfo[] = [{ errorMessage: "Incorrect username or password", id: "" }];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_LOGIN_ERRORS,
            JSON.stringify({ inputs: req.body as object, errors }),
            res,
        );

        expect(writeHeadMock).toBeCalledWith(302, { Location: LOGIN_PAGE_PATH });
    });
});
