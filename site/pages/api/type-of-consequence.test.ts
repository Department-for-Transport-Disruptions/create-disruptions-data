/* eslint-disable @typescript-eslint/no-unsafe-assignment*/
/* eslint-disable @typescript-eslint/no-unsafe-argument*/
import { describe, it, expect, afterEach, vi } from "vitest";
import addConsequence from "./type-of-consequence.api";
import {
    COOKIES_ADD_CONSEQUENCE_INFO,
    COOKIES_ADD_CONSEQUENCE_ERRORS,
    ADD_CONSEQUENCE_PAGE_PATH,
} from "../../constants/index";
import { ErrorInfo } from "../../interfaces";
import { getMockRequestAndResponse } from "../../testData/mockData";
import * as apiUtils from "../../utils/apiUtils";

const tenSeconds = 10000;

describe("addConsequence", () => {
    const writeHeadMock = vi.fn();
    const setCookieSpy = vi.spyOn(apiUtils, "setCookieOnResponseObject");
    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should redirect back to next page when all required inputs are passed", () => {
        const disruptionData = {
            modeOfTransport: "bus",
            consequenceType: "operatorWide",
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        addConsequence(req, res);

        expect(setCookieSpy).toHaveBeenCalledTimes(1);
        expect(setCookieSpy).toHaveBeenCalledWith(
            COOKIES_ADD_CONSEQUENCE_INFO,
            expect.any(String),
            res,
            tenSeconds,
            false,
        );

        expect(writeHeadMock).toBeCalledWith(302, { Location: "/" });
    });

    it("should redirect back to add consequence page (/type-of-consequence) when no inputs are passed", () => {
        const errors: ErrorInfo[] = [
            { id: "consequenceType", errorMessage: "Select a consequence type" },
            { id: "modeOfTransport", errorMessage: "Select a mode of transport" },
        ];

        const { req, res } = getMockRequestAndResponse({ body: {}, mockWriteHeadFn: writeHeadMock });

        addConsequence(req, res);

        expect(setCookieSpy).toHaveBeenCalledTimes(2);
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            2,
            COOKIES_ADD_CONSEQUENCE_ERRORS,
            JSON.stringify(errors),
            res,
            tenSeconds,
            false,
        );

        expect(writeHeadMock).toBeCalledWith(302, { Location: ADD_CONSEQUENCE_PAGE_PATH });
    });

    it("should redirect back to add consequence page (/type-of-consequence) when incorrect values are passed", () => {
        const disruptionData = {
            modeOfTransport: "incorrect mode",
            consequenceType: "incorrect type",
        };

        const errors: ErrorInfo[] = [
            {
                id: "consequenceType",
                errorMessage: "Incorrect consequence type selected. Choose a valid value",
            },
            { id: "modeOfTransport", errorMessage: "Incorrect mode of transport selected. Choose a valid value" },
        ];

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        addConsequence(req, res);

        expect(setCookieSpy).toHaveBeenCalledTimes(2);
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            2,
            COOKIES_ADD_CONSEQUENCE_ERRORS,
            JSON.stringify(errors),
            res,
            tenSeconds,
            false,
        );

        expect(writeHeadMock).toBeCalledWith(302, { Location: ADD_CONSEQUENCE_PAGE_PATH });
    });
});
