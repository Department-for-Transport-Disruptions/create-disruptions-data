/* eslint-disable @typescript-eslint/no-unsafe-assignment*/
import { describe, it, expect, afterEach, vi } from "vitest";
import { randomUUID } from "crypto";
import addConsequenceTemplate from "./type-of-consequence-template.api";
import { COOKIES_CONSEQUENCE_TYPE_ERRORS, TYPE_OF_CONSEQUENCE_TEMPLATE_PAGE_PATH } from "../../constants/index";
import { ErrorInfo } from "../../interfaces";
import { getMockRequestAndResponse } from "../../testData/mockData";
import { setCookieOnResponseObject } from "../../utils/apiUtils";

describe("addConsequenceTemplate", () => {
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

    it("should redirect to operator consequence page when 'Operator wide' selected", () => {
        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        addConsequenceTemplate(req, res);

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `/create-template-consequence-operator/${disruptionId}/0`,
        });
    });

    it("should redirect to operator consequence page when 'Network wide' selected", () => {
        const { req, res } = getMockRequestAndResponse({
            body: { ...disruptionData, consequenceType: "networkWide" },
            mockWriteHeadFn: writeHeadMock,
        });

        addConsequenceTemplate(req, res);

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `/create-template-consequence-network/${disruptionId}/0`,
        });
    });

    it("should redirect to stops consequence page when 'Stops' is selected", () => {
        const { req, res } = getMockRequestAndResponse({
            body: { ...disruptionData, consequenceType: "stops" },
            mockWriteHeadFn: writeHeadMock,
        });

        addConsequenceTemplate(req, res);

        expect(writeHeadMock).toBeCalledWith(302, { Location: `/create-template-consequence-stops/${disruptionId}/0` });
    });

    it("should redirect to services consequence page when 'Services' is selected", () => {
        const { req, res } = getMockRequestAndResponse({
            body: { ...disruptionData, consequenceType: "services" },
            mockWriteHeadFn: writeHeadMock,
        });

        addConsequenceTemplate(req, res);

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `/create-template-consequence-services/${disruptionId}/0`,
        });
    });

    it("should redirect back to add consequence page (/type-of-consequence-template) when no inputs are passed", () => {
        const errors: ErrorInfo[] = [{ errorMessage: "Select a consequence type", id: "consequenceType" }];

        const { req, res } = getMockRequestAndResponse({
            body: { ...disruptionData, consequenceType: "" },
            mockWriteHeadFn: writeHeadMock,
        });

        addConsequenceTemplate(req, res);

        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenNthCalledWith(
            1,
            COOKIES_CONSEQUENCE_TYPE_ERRORS,
            JSON.stringify({ inputs: req.body, errors }),
            res,
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${TYPE_OF_CONSEQUENCE_TEMPLATE_PAGE_PATH}/${disruptionId}/0`,
        });
    });

    it("should redirect back to add consequence page (/type-of-consequence-template) when incorrect values are passed", () => {
        const errors: ErrorInfo[] = [{ errorMessage: "Select a consequence type", id: "consequenceType" }];

        const { req, res } = getMockRequestAndResponse({
            body: { ...disruptionData, consequenceType: "incorrect type" },
            mockWriteHeadFn: writeHeadMock,
        });

        addConsequenceTemplate(req, res);

        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenNthCalledWith(
            1,
            COOKIES_CONSEQUENCE_TYPE_ERRORS,
            JSON.stringify({ inputs: req.body, errors }),
            res,
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${TYPE_OF_CONSEQUENCE_TEMPLATE_PAGE_PATH}/${disruptionId}/0`,
        });
    });
});
