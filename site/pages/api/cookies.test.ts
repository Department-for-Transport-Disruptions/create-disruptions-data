import { afterEach, describe, expect, it, vi } from "vitest";
import { COOKIES_POLICY_COOKIE, COOKIE_PREFERENCES_COOKIE, oneYearInSeconds } from "../../constants";
import { CookiePolicy } from "../../interfaces";
import { getMockRequestAndResponse } from "../../testData/mockData";
import * as apiUtils from "../../utils/apiUtils";
import cookies from "./cookies.api";

describe("cookies", () => {
    const writeHeadMock = vi.fn();
    const setCookieSpy = vi.spyOn(apiUtils, "setCookieOnResponseObject");

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should redirect back to itself (i.e. /cookies) when no tracking selection is sent to the API", () => {
        const { req, res } = getMockRequestAndResponse({ body: {}, mockWriteHeadFn: writeHeadMock });
        cookies(req, res);
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/cookies" });
    });

    it("should update all cookies, with the cookie policy 'usage' as false when the user disables tracking", () => {
        const mockCookiePolicy: CookiePolicy = { essential: true, usage: false };
        const { req, res } = getMockRequestAndResponse({
            body: {
                tracking: "off",
            },
            mockWriteHeadFn: writeHeadMock,
        });
        cookies(req, res);
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            1,
            COOKIE_PREFERENCES_COOKIE,
            "true",
            res,
            oneYearInSeconds,
            false,
        );
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            2,
            COOKIES_POLICY_COOKIE,
            JSON.stringify(mockCookiePolicy),
            res,
            oneYearInSeconds,
            false,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/cookies?settingsSaved=true" });
    });

    it("should update all cookies, with the cookie policy 'usage' as true when the user enables tracking", () => {
        const mockCookiePolicy: CookiePolicy = { essential: true, usage: true };
        const { req, res } = getMockRequestAndResponse({
            body: {
                tracking: "on",
            },
            mockWriteHeadFn: writeHeadMock,
        });
        cookies(req, res);
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            1,
            COOKIE_PREFERENCES_COOKIE,
            "true",
            res,
            oneYearInSeconds,
            false,
        );
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            2,
            COOKIES_POLICY_COOKIE,
            JSON.stringify(mockCookiePolicy),
            res,
            oneYearInSeconds,
            false,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/cookies?settingsSaved=true" });
    });
});
