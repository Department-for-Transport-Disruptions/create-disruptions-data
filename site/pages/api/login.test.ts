import { describe, it, expect, afterEach, vi } from "vitest";
import login from "./login.api";
import { COOKIES_LOGIN_ERRORS, DASHBOARD_PAGE_PATH, LOGIN_PAGE_PATH } from "../../constants";
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

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should redirect to login page when incorrect inputs are passed", () => {
        const { req, res } = getMockRequestAndResponse({
            body: {},
            mockWriteHeadFn: writeHeadMock,
        });

        login(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Enter an email address", id: "email" },
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

    it("should redirect to /dashboard page when valid inputs are passed", () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                email: "dummyUser@gmail.com",
                password: "dummyPassword",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        login(req, res);

        expect(destroyCookieOnResponseObject).toHaveBeenCalledTimes(1);

        expect(writeHeadMock).toBeCalledWith(302, { Location: DASHBOARD_PAGE_PATH });
    });
});
