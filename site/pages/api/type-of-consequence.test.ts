/* eslint-disable @typescript-eslint/no-unsafe-assignment*/
import { describe, it, expect, afterEach, vi } from "vitest";
import { randomUUID } from "crypto";
import addConsequence from "./type-of-consequence.api";
import {
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
    COOKIES_CONSEQUENCE_TYPE_ERRORS,
    CREATE_DISRUPTION_PAGE_PATH,
    DISRUPTION_DETAIL_PAGE_PATH,
    VIEW_ALL_TEMPLATES_PAGE_PATH,
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

    const disruptionId = randomUUID();

    const disruptionData = {
        disruptionId: disruptionId,
        consequenceIndex: "0",
        consequenceType: "operatorWide",
    };

    const refererPath = `${CREATE_DISRUPTION_PAGE_PATH}/${disruptionId}?${encodeURIComponent(
        `${DISRUPTION_DETAIL_PAGE_PATH}/${disruptionId}?template=true`,
    )}`;

    it("should redirect to operator consequence page when 'Operator wide' selected", () => {
        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        addConsequence(req, res);

        expect(writeHeadMock).toBeCalledWith(302, { Location: `/create-consequence-operator/${disruptionId}/0` });
    });

    it("should redirect to operator consequence page when 'Network wide' selected", () => {
        const { req, res } = getMockRequestAndResponse({
            body: { ...disruptionData, consequenceType: "networkWide" },
            mockWriteHeadFn: writeHeadMock,
        });

        addConsequence(req, res);

        expect(writeHeadMock).toBeCalledWith(302, { Location: `/create-consequence-network/${disruptionId}/0` });
    });

    it("should redirect to stops consequence page when 'Stops' is selected", () => {
        const { req, res } = getMockRequestAndResponse({
            body: { ...disruptionData, consequenceType: "stops" },
            mockWriteHeadFn: writeHeadMock,
        });

        addConsequence(req, res);

        expect(writeHeadMock).toBeCalledWith(302, { Location: `/create-consequence-stops/${disruptionId}/0` });
    });

    it("should redirect to services consequence page when 'Services' is selected", () => {
        const { req, res } = getMockRequestAndResponse({
            body: { ...disruptionData, consequenceType: "services" },
            mockWriteHeadFn: writeHeadMock,
        });

        addConsequence(req, res);

        expect(writeHeadMock).toBeCalledWith(302, { Location: `/create-consequence-services/${disruptionId}/0` });
    });

    it("should redirect back to add consequence page (/type-of-consequence) when no inputs are passed", () => {
        const errors: ErrorInfo[] = [{ errorMessage: "Select a consequence type", id: "consequenceType" }];

        const { req, res } = getMockRequestAndResponse({
            body: { ...disruptionData, consequenceType: "" },
            mockWriteHeadFn: writeHeadMock,
        });

        addConsequence(req, res);

        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenNthCalledWith(
            1,
            COOKIES_CONSEQUENCE_TYPE_ERRORS,
            JSON.stringify({ inputs: req.body, errors }),
            res,
        );

        expect(writeHeadMock).toBeCalledWith(302, { Location: `${TYPE_OF_CONSEQUENCE_PAGE_PATH}/${disruptionId}/0` });
    });

    it("should redirect back to add consequence page (/type-of-consequence) when incorrect values are passed", () => {
        const errors: ErrorInfo[] = [{ errorMessage: "Select a consequence type", id: "consequenceType" }];

        const { req, res } = getMockRequestAndResponse({
            body: { ...disruptionData, consequenceType: "incorrect type" },
            mockWriteHeadFn: writeHeadMock,
        });

        addConsequence(req, res);

        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenNthCalledWith(
            1,
            COOKIES_CONSEQUENCE_TYPE_ERRORS,
            JSON.stringify({ inputs: req.body, errors }),
            res,
        );

        expect(writeHeadMock).toBeCalledWith(302, { Location: `${TYPE_OF_CONSEQUENCE_PAGE_PATH}/${disruptionId}/0` });
    });

    it("should redirect to operator consequence page when 'Operator wide' selected and with appropriate query params when a new disruption is created from template", () => {
        const { req, res } = getMockRequestAndResponse({
            body: disruptionData,
            requestHeaders: {
                referer: refererPath,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        addConsequence(req, res);

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `/create-consequence-operator/${disruptionId}/0`,
        });
    });

    it("should redirect to operator consequence page when 'Network wide' selected and with appropriate query params when a new disruption is created from template", () => {
        const { req, res } = getMockRequestAndResponse({
            body: { ...disruptionData, consequenceType: "networkWide" },
            requestHeaders: {
                referer: refererPath,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        addConsequence(req, res);

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `/create-consequence-network/${disruptionId}/0`,
        });
    });

    it("should redirect to stops consequence page when 'Stops' is selected and with appropriate query params when a new disruption is created from template", () => {
        const { req, res } = getMockRequestAndResponse({
            body: { ...disruptionData, consequenceType: "stops" },
            requestHeaders: {
                referer: refererPath,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        addConsequence(req, res);

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `/create-consequence-stops/${disruptionId}/0`,
        });
    });

    it("should redirect to services consequence page when 'Services' is selected and with appropriate query params when a new disruption is created from template", () => {
        const { req, res } = getMockRequestAndResponse({
            body: { ...disruptionData, consequenceType: "services" },
            requestHeaders: {
                referer: refererPath,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        addConsequence(req, res);

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `/create-consequence-services/${disruptionId}/0`,
        });
    });

    it("should redirect back to add consequence page (/type-of-consequence) when no inputs are passed with the appropriate query params", () => {
        const errors: ErrorInfo[] = [{ errorMessage: "Select a consequence type", id: "consequenceType" }];

        const { req, res } = getMockRequestAndResponse({
            body: { ...disruptionData, consequenceType: "" },
            requestHeaders: {
                referer: refererPath,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        addConsequence(req, res);

        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenNthCalledWith(
            1,
            COOKIES_CONSEQUENCE_TYPE_ERRORS,
            JSON.stringify({ inputs: req.body, errors }),
            res,
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${TYPE_OF_CONSEQUENCE_PAGE_PATH}/${disruptionId}/0`,
        });
    });
});
