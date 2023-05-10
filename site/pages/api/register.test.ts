import { describe, it, expect, afterEach, vi } from "vitest";
import register from "./register.api";
import { COOKIES_REGISTER_ERRORS, DASHBOARD_PAGE_PATH, ERROR_PATH, REGISTER_PAGE_PATH } from "../../constants";
import * as cognito from "../../data/cognito";
import { ErrorInfo } from "../../interfaces";
import { getMockRequestAndResponse } from "../../testData/mockData";
import { destroyCookieOnResponseObject, setCookieOnResponseObject } from "../../utils/apiUtils";

describe("register", () => {
    const writeHeadMock = vi.fn();
    vi.mock("../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
    }));

    const initiateAuthSpy = vi.spyOn(cognito, "initiateAuth");

    vi.mock("../../data/cognito", () => ({
        initiateAuth: vi.fn(),
        respondToNewPasswordChallenge: vi.fn(),
        globalSignOut: vi.fn(),
    }));

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should redirect to register page when incorrect inputs are passed", async () => {
        const testEmail = "test@example.com";
        const testKey = "";

        const { req, res } = getMockRequestAndResponse({
            body: {
                email: testEmail,
                key: testKey,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await register(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Enter a password", id: "password" },
            { errorMessage: "Required", id: "confirmPassword" },
            { errorMessage: "Invalid register link", id: "key" },
        ];

        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_REGISTER_ERRORS,
            JSON.stringify({ inputs: req.body as object, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${REGISTER_PAGE_PATH}?email=${testEmail}&key=${testKey}`,
        });
    });

    it("should redirect to /dashboard page when valid inputs are passed", async () => {
        initiateAuthSpy.mockImplementation(() =>
            Promise.resolve({
                $metadata: {},
                ChallengeName: "NEW_PASSWORD_REQUIRED",
                ChallengeParameters: {
                    userAttributes: "test",
                },
                Session: "test",
            }),
        );

        const { req, res } = getMockRequestAndResponse({
            body: {
                email: "test@example.com",
                password: "dummyPassword",
                confirmPassword: "dummyPassword",
                key: "key123",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await register(req, res);

        expect(destroyCookieOnResponseObject).toHaveBeenCalledTimes(3);
        expect(cognito.globalSignOut).toHaveBeenCalledTimes(2);

        expect(writeHeadMock).toBeCalledWith(302, { Location: DASHBOARD_PAGE_PATH });
    });

    it("should redirect to error page when invalid challenge is received", async () => {
        initiateAuthSpy.mockImplementation(() =>
            Promise.resolve({
                $metadata: {},
                ChallengeName: "INVALID",
                ChallengeParameters: {
                    userAttributes: "test",
                },
                Session: "test",
            }),
        );

        const { req, res } = getMockRequestAndResponse({
            body: {
                email: "test@example.com",
                password: "dummyPassword",
                confirmPassword: "dummyPassword",
                key: "key123",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await register(req, res);

        expect(writeHeadMock).toBeCalledWith(302, { Location: ERROR_PATH });
    });
});
