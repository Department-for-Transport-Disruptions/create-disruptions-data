import { describe, it, expect, afterEach, vi } from "vitest";
import addConsequence from "./add-consequence";
import { COOKIES_ADD_CONSEQUENCE_INFO, COOKIES_ADD_CONSEQUENCE_ERRORS } from "../../constants/index";
import { ErrorInfo } from "../../interfaces";
import { getMockRequestAndResponse } from "../../testData/mockData";
import * as apiUtils from "../../utils/apiUtils";
import { AddConsequenceProps, ConsequenceType, TransportMode } from "../add-consequence";

const tenSeconds = 10000;

describe("addConsequence", () => {
    const writeHeadMock = vi.fn();
    const setCookieSpy = vi.spyOn(apiUtils, "setCookieOnResponseObject");
    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should redirect back to next page when all required inputs are passed", () => {
        const disruptionData: AddConsequenceProps = {
            modeOfTransport: TransportMode.bus,
            consequenceType: ConsequenceType.operatorWide,
        };

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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

    it("should redirect back to add consequence page (/add-consequence) when no inputs are passed", () => {
        const errors: ErrorInfo[] = [
            { id: "consequence-type-services", errorMessage: "Select a consequence type" },
            { id: "transport-mode-bus", errorMessage: "Select a mode of transport" },
        ];

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { req, res } = getMockRequestAndResponse({ body: {}, mockWriteHeadFn: writeHeadMock });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        addConsequence(req, res);

        expect(setCookieSpy).toHaveBeenCalledTimes(1);
        expect(setCookieSpy).toHaveBeenCalledWith(
            COOKIES_ADD_CONSEQUENCE_ERRORS,
            JSON.stringify(errors),
            res,
            tenSeconds,
            false,
        );

        expect(writeHeadMock).toBeCalledWith(302, { Location: "/add-consequence" });
    });

    it("should redirect back to add consequence page (/add-consequence) when incorrect values are passed", () => {
        const disruptionData = {
            modeOfTransport: "incorrect mode",
            consequenceType: "incorrect type",
        };

        const errors: ErrorInfo[] = [
            {
                id: "consequence-type-services",
                errorMessage: "Incorrect consequence type selected. Choose a valid value",
            },
            { id: "transport-mode-bus", errorMessage: "Incorrect mode of transport selected. Choose a valid value" },
        ];

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        addConsequence(req, res);

        expect(setCookieSpy).toHaveBeenCalledTimes(1);
        expect(setCookieSpy).toHaveBeenCalledWith(
            COOKIES_ADD_CONSEQUENCE_ERRORS,
            JSON.stringify(errors),
            res,
            tenSeconds,
            false,
        );

        expect(writeHeadMock).toBeCalledWith(302, { Location: "/add-consequence" });
    });
});
