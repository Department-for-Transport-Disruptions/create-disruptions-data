import { describe, it, expect, afterEach, vi } from "vitest";
import login from "./login.api";
import { COOKIES_LOGIN_ERRORS, LOGIN_PAGE_PATH } from "../../constants";
import { ErrorInfo } from "../../interfaces";
import { getMockRequestAndResponse } from "../../testData/mockData";
import { setCookieOnResponseObject } from "../../utils/apiUtils";

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
});
