import { describe, it, expect, afterEach, vi } from "vitest";
import changePassword from "./change-password.api";
import { CHANGE_PASSWORD_PAGE_PATH, COOKIES_CHANGE_PASSWORD_ERRORS } from "../../constants";
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

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should redirect to login page when incorrect inputs are passed", () => {
        const { req, res } = getMockRequestAndResponse({
            body: {},
            mockWriteHeadFn: writeHeadMock,
        });

        changePassword(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Enter your current password", id: "currentPassword" },
            { errorMessage: "Enter your new password", id: "newPassword" },
            { errorMessage: "Enter your new password again", id: "confirmPassword" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CHANGE_PASSWORD_ERRORS,
            JSON.stringify({ inputs: req.body as object, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: CHANGE_PASSWORD_PAGE_PATH });
    });

    it("should redirect to /dashboard page when valid inputs are passed", () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                currentPassword: "oldPassword",
                newPassword: "dummyPassword",
                confirmPassword: "dummyPassword",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        changePassword(req, res);

        expect(destroyCookieOnResponseObject).toHaveBeenCalledTimes(1);

        expect(writeHeadMock).toBeCalledWith(302, { Location: `${CHANGE_PASSWORD_PAGE_PATH}?success=true` });
    });
});
