import { afterEach, describe, expect, it, vi } from "vitest";
import { COOKIES_RESET_PASSWORD_ERRORS, RESET_PASSWORD_PAGE_PATH } from "../../constants";
import { ErrorInfo } from "../../interfaces";
import { getMockRequestAndResponse } from "../../testData/mockData";
import { destroyCookieOnResponseObject, setCookieOnResponseObject } from "../../utils/apiUtils";
import resetPassword from "./reset-password.api";

describe("reset-password", () => {
    const writeHeadMock = vi.fn();
    vi.mock("../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
    }));

    vi.mock("../../data/cognito", () => ({
        resetUserPassword: vi.fn(),
    }));
    afterEach(() => {
        vi.resetAllMocks();
    });
    it("should reset user password when valid inputs are provided", async () => {
        const testEmail = "test@example.com";
        const testKey = "123";
        const testNewPassword = "Password123!";
        const { req, res } = getMockRequestAndResponse({
            body: {
                email: testEmail,
                key: testKey,
                newPassword: testNewPassword,
                confirmPassword: testNewPassword,
            },
            mockWriteHeadFn: writeHeadMock,
        });
        await resetPassword(req, res);
        expect(destroyCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${RESET_PASSWORD_PAGE_PATH}?key=${testKey}&user_name=${testEmail}&success=true`,
        });
    });

    it("should redirect to reset password when invalid inputs are provided", async () => {
        const testEmail = "test@example.com";
        const testKey = "123";
        const testNewPassword = "Password123!";
        const testConfirmPassword = "differentPassword";
        const { req, res } = getMockRequestAndResponse({
            body: {
                email: testEmail,
                key: testKey,
                newPassword: testNewPassword,
                confirmPassword: testConfirmPassword,
            },
            mockWriteHeadFn: writeHeadMock,
        });
        await resetPassword(req, res);
        const errors: ErrorInfo[] = [
            { errorMessage: "You must type the same password each time", id: "confirmPassword" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_RESET_PASSWORD_ERRORS,
            JSON.stringify({ inputs: req.body as object, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${RESET_PASSWORD_PAGE_PATH}?key=${testKey}&user_name=${testEmail}`,
        });
    });

    it.each([
        [
            "pas",
            "Password must be a minimum of 8 characters, contain at least one uppercase letter, contain at least one number, and contain at least one special character.",
        ],
        [
            "password",
            "Password must contain at least one uppercase letter, contain at least one number, and contain at least one special character.",
        ],
        [
            "PASSWORD",
            "Password must contain at least one lowercase letter, contain at least one number, and contain at least one special character.",
        ],
        ["Password", "Password must contain at least one number and contain at least one special character."],
        ["Password1", "Password must contain at least one special character."],
    ])(
        "should redirect to reset password when password does not meet requirements: %o",
        async (password, errorMessage) => {
            const testEmail = "test@example.com";
            const testKey = "123";
            const { req, res } = getMockRequestAndResponse({
                body: {
                    email: testEmail,
                    key: testKey,
                    newPassword: password,
                    confirmPassword: password,
                },
                mockWriteHeadFn: writeHeadMock,
            });
            await resetPassword(req, res);
            const errors: ErrorInfo[] = [{ errorMessage: errorMessage, id: "newPassword" }];
            expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
            expect(setCookieOnResponseObject).toHaveBeenCalledWith(
                COOKIES_RESET_PASSWORD_ERRORS,
                JSON.stringify({ inputs: req.body as object, errors }),
                res,
            );
            expect(writeHeadMock).toBeCalledWith(302, {
                Location: `${RESET_PASSWORD_PAGE_PATH}?key=${testKey}&user_name=${testEmail}`,
            });
        },
    );
});
