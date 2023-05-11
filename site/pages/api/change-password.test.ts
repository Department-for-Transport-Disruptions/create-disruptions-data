import { NotAuthorizedException } from "@aws-sdk/client-cognito-identity-provider";
import { describe, it, expect, afterEach, vi } from "vitest";
import changePassword from "./change-password.api";
import { CHANGE_PASSWORD_PAGE_PATH, COOKIES_CHANGE_PASSWORD_ERRORS, ERROR_PATH } from "../../constants";
import * as cognito from "../../data/cognito";
import { ErrorInfo } from "../../interfaces";
import { getMockRequestAndResponse } from "../../testData/mockData";
import { destroyCookieOnResponseObject, setCookieOnResponseObject } from "../../utils/apiUtils";

describe("changePassword", () => {
    const writeHeadMock = vi.fn();
    vi.mock("../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
    }));

    const initiateAuthSpy = vi.spyOn(cognito, "initiateAuth");

    vi.mock("../../data/cognito", () => ({
        initiateAuth: vi.fn(),
        updateUserPassword: vi.fn(),
    }));

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should redirect to login page when no inputs are passed", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {},
            mockWriteHeadFn: writeHeadMock,
        });

        await changePassword(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Enter your current password", id: "currentPassword" },
            { errorMessage: "Enter a new password", id: "newPassword" },
            { errorMessage: "Required", id: "confirmPassword" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CHANGE_PASSWORD_ERRORS,
            JSON.stringify({ inputs: req.body as object, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: CHANGE_PASSWORD_PAGE_PATH });
    });

    it("should redirect to login page with appropriate errors when character length is not matched", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { currentPassword: "oldPassword", newPassword: "pas", confirmPassword: "pas" },
            mockWriteHeadFn: writeHeadMock,
        });

        await changePassword(req, res);

        const errors: ErrorInfo[] = [{ errorMessage: "Enter a minimum of 8 characters", id: "newPassword" }];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CHANGE_PASSWORD_ERRORS,
            JSON.stringify({ inputs: req.body as object, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: CHANGE_PASSWORD_PAGE_PATH });
    });

    it("should redirect to login page with appropriate errors when new and confirm password don't match", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { currentPassword: "oldPassword", newPassword: "newPassword", confirmPassword: "oldPassword" },
            mockWriteHeadFn: writeHeadMock,
        });

        await changePassword(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "You must type the same password each time", id: "confirmPassword" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CHANGE_PASSWORD_ERRORS,
            JSON.stringify({ inputs: req.body as object, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: CHANGE_PASSWORD_PAGE_PATH });
    });

    it("should redirect to /dashboard page when valid inputs are passed", async () => {
        initiateAuthSpy.mockImplementation(() =>
            Promise.resolve({
                $metadata: {},
                AuthenticationResult: {},
            }),
        );

        const { req, res } = getMockRequestAndResponse({
            body: {
                currentPassword: "oldPassword",
                newPassword: "dummyPassword",
                confirmPassword: "dummyPassword",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await changePassword(req, res);

        expect(destroyCookieOnResponseObject).toHaveBeenCalledTimes(1);

        expect(writeHeadMock).toBeCalledWith(302, { Location: `${CHANGE_PASSWORD_PAGE_PATH}?success=true` });
    });

    it("should redirect to error page when invalid auth response is received", async () => {
        initiateAuthSpy.mockImplementation(() => {
            throw new Error("invalid", {
                cause: "Invalid",
            });
        });

        const { req, res } = getMockRequestAndResponse({
            body: {
                currentPassword: "oldPassword",
                newPassword: "dummyPassword",
                confirmPassword: "dummyPassword",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await changePassword(req, res);

        expect(writeHeadMock).toBeCalledWith(302, { Location: ERROR_PATH });
    });

    it("should redirect to login page when incorrect password received", async () => {
        initiateAuthSpy.mockImplementation(() => {
            throw new NotAuthorizedException({
                message: "Not authrorised",
                $metadata: {},
            });
        });

        const { req, res } = getMockRequestAndResponse({
            body: {
                currentPassword: "oldPassword",
                newPassword: "dummyPassword",
                confirmPassword: "dummyPassword",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await changePassword(req, res);

        const errors: ErrorInfo[] = [{ errorMessage: "Incorrect current password", id: "" }];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CHANGE_PASSWORD_ERRORS,
            JSON.stringify({ inputs: req.body as object, errors }),
            res,
        );

        expect(writeHeadMock).toBeCalledWith(302, { Location: CHANGE_PASSWORD_PAGE_PATH });
    });
});
