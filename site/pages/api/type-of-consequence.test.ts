/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment*/
/* eslint-disable @typescript-eslint/no-unsafe-argument*/
import { VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { describe, it, expect, afterEach, vi } from "vitest";
import addConsequence from "./type-of-consequence.api";
import {
    ADD_CONSEQUENCE_PAGE_PATH,
    COOKIES_CONSEQUENCE_TYPE_ERRORS,
    COOKIES_CONSEQUENCE_TYPE_INFO,
} from "../../constants/index";
import { ErrorInfo } from "../../interfaces";
import { getMockRequestAndResponse } from "../../testData/mockData";
import { setCookieOnResponseObject } from "../../utils/apiUtils";

describe("addConsequence", () => {
    const writeHeadMock = vi.fn();
    vi.mock("../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
    }));

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should redirect to operator consequence page when 'Operator wide' selected", () => {
        const disruptionData = {
            modeOfTransport: VehicleMode.rail,
            consequenceType: "operatorWide",
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        addConsequence(req, res);

        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(COOKIES_CONSEQUENCE_TYPE_INFO, expect.any(String), res);

        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-consequence-operator" });
    });

    it("should redirect to operator consequence page when 'Network wide' selected", () => {
        const disruptionData = {
            modeOfTransport: VehicleMode.bus,
            consequenceType: "networkWide",
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        addConsequence(req, res);

        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenNthCalledWith(
            1,
            COOKIES_CONSEQUENCE_TYPE_INFO,
            expect.any(String),
            res,
        );

        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-consequence-network" });
    });

    it("should redirect back to add consequence page (/type-of-consequence) when no inputs are passed", () => {
        const errors: ErrorInfo[] = [
            { errorMessage: "Select a mode of transport", id: "consequenceType" },
            { errorMessage: "Select a mode of transport", id: "modeOfTransport" },
        ];

        const { req, res } = getMockRequestAndResponse({ body: {}, mockWriteHeadFn: writeHeadMock });

        addConsequence(req, res);

        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenNthCalledWith(
            1,
            COOKIES_CONSEQUENCE_TYPE_ERRORS,
            JSON.stringify({ inputs: req.body, errors }),
            res,
        );

        expect(writeHeadMock).toBeCalledWith(302, { Location: ADD_CONSEQUENCE_PAGE_PATH });
    });

    it("should redirect back to add consequence page (/type-of-consequence) when incorrect values are passed", () => {
        const disruptionData = {
            modeOfTransport: "incorrect mode",
            consequenceType: "incorrect type",
        };

        const errors: ErrorInfo[] = [
            { errorMessage: "Select a mode of transport", id: "consequenceType" },
            { errorMessage: "Select a mode of transport", id: "modeOfTransport" },
        ];

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        addConsequence(req, res);

        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenNthCalledWith(
            1,
            COOKIES_CONSEQUENCE_TYPE_ERRORS,
            JSON.stringify({ inputs: req.body, errors }),
            res,
        );

        expect(writeHeadMock).toBeCalledWith(302, { Location: ADD_CONSEQUENCE_PAGE_PATH });
    });
});
