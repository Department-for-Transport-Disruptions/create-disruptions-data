import { UserNotFoundException } from "@aws-sdk/client-cognito-identity-provider";
import { afterEach, describe, expect, it, vi } from "vitest";
import forgotPassword from "./forgot-password.api";
import {
    COOKIES_FORGOT_PASSWORD_ERRORS,
    FORGOT_PASSWORD_PAGE_PATH,
    RESET_PASSWORD_CONFIRMATION_PAGE_PATH,
} from "../../constants";
import * as cognito from "../../data/cognito";
import { ErrorInfo } from "../../interfaces";
import { getMockRequestAndResponse } from "../../testData/mockData";
import { destroyCookieOnResponseObject, setCookieOnResponseObject } from "../../utils/apiUtils";
describe("forgot-password", () => {
    const writeHeadMock = vi.fn();
    vi.mock("../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
    }));

    vi.mock("../../data/cognito", () => ({
        initiateResetPassword: vi.fn(),
    }));

    const initiateResetPasswordStub = vi.spyOn(cognito, "initiateResetPassword");

    afterEach(() => {
        vi.resetAllMocks();
    });
    it("should redirect reset password confirmation page if correct inputs are passed", async () => {
        const testEmail = "test@example.com";
        const { req, res } = getMockRequestAndResponse({
            body: {
                email: testEmail,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await forgotPassword(req, res);
        expect(destroyCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${RESET_PASSWORD_CONFIRMATION_PAGE_PATH}?email=${testEmail}`,
        });
    });

    it("should redirect to forgot password page if incorrect input is given", async () => {
        const testEmail = "test";
        const { req, res } = getMockRequestAndResponse({
            body: {
                email: testEmail,
            },
            mockWriteHeadFn: writeHeadMock,
        });
        await forgotPassword(req, res);
        const errors: ErrorInfo[] = [
            { errorMessage: "Enter an email address in the right format, name@example.com", id: "email" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_FORGOT_PASSWORD_ERRORS,
            JSON.stringify({ inputs: req.body as object, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${FORGOT_PASSWORD_PAGE_PATH}`,
        });
    });
    it("should redirect to reset password confirmation page even if a user enters an email that is not registered ", async () => {
        const testEmail = "test@example.com";
        initiateResetPasswordStub.mockRejectedValue(
            new UserNotFoundException({
                message: "User not found",
                $metadata: {},
            }),
        );
        const { req, res } = getMockRequestAndResponse({
            body: {
                email: testEmail,
            },
            mockWriteHeadFn: writeHeadMock,
        });
        await forgotPassword(req, res);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${RESET_PASSWORD_CONFIRMATION_PAGE_PATH}?email=${testEmail}`,
        });
    });
});
