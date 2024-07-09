import { afterEach, describe, expect, it, vi } from "vitest";
import { LOGIN_PAGE_PATH } from "../../constants";
import { globalSignOut } from "../../data/cognito";
import { getMockRequestAndResponse } from "../../testData/mockData";
import { destroyCookieOnResponseObject } from "../../utils/apiUtils";
import signOut from "./sign-out.api";

describe("sign out", () => {
    const writeHeadMock = vi.fn();
    vi.mock("../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
    }));

    vi.mock("../../data/cognito", () => ({
        globalSignOut: vi.fn(),
    }));

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should perform sign out, delete cookies and redirect to login page if session", async () => {
        const { req, res } = getMockRequestAndResponse({
            mockWriteHeadFn: writeHeadMock,
        });

        await signOut(req, res);

        expect(globalSignOut).toHaveBeenCalledTimes(1);
        expect(destroyCookieOnResponseObject).toHaveBeenCalledTimes(2);

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: LOGIN_PAGE_PATH,
        });
    });
});
