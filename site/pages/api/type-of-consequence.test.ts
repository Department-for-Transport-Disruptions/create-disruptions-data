/* eslint-disable @typescript-eslint/no-unsafe-assignment*/
import { describe, it, expect, afterEach, vi } from "vitest";
import { randomUUID } from "crypto";
import addConsequence from "./type-of-consequence.api";
import { TYPE_OF_CONSEQUENCE_PAGE_PATH, COOKIES_CONSEQUENCE_TYPE_ERRORS } from "../../constants/index";
import { ErrorInfo } from "../../interfaces";
import { ConsequenceType } from "../../schemas/type-of-consequence.schema";
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
        const disruptionId = randomUUID();

        const disruptionData: ConsequenceType = {
            disruptionId: disruptionId,
            consequenceIndex: 0,
            consequenceType: "operatorWide",
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        addConsequence(req, res);

        expect(writeHeadMock).toBeCalledWith(302, { Location: `/create-consequence-operator/${disruptionId}/0` });
    });

    it("should redirect to operator consequence page when 'Network wide' selected", () => {
        const disruptionId = randomUUID();

        const disruptionData: ConsequenceType = {
            disruptionId: disruptionId,
            consequenceIndex: 0,
            consequenceType: "networkWide",
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        addConsequence(req, res);

        expect(writeHeadMock).toBeCalledWith(302, { Location: `/create-consequence-network/${disruptionId}/0` });
    });

    it("should redirect back to add consequence page (/type-of-consequence) when no inputs are passed", () => {
        const errors: ErrorInfo[] = [
            { errorMessage: "Required", id: "disruptionId" },
            { errorMessage: "Select a consequence type", id: "consequenceType" },
            { errorMessage: "Expected number, received nan", id: "consequenceIndex" },
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

        expect(writeHeadMock).toBeCalledWith(302, { Location: TYPE_OF_CONSEQUENCE_PAGE_PATH });
    });

    it("should redirect back to add consequence page (/type-of-consequence) when incorrect values are passed", () => {
        const disruptionData = {
            disruptionId: randomUUID(),
            consequenceIndex: 0,
            consequenceType: "incorrect type",
        };

        const errors: ErrorInfo[] = [{ errorMessage: "Select a consequence type", id: "consequenceType" }];

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        addConsequence(req, res);

        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenNthCalledWith(
            1,
            COOKIES_CONSEQUENCE_TYPE_ERRORS,
            JSON.stringify({ inputs: req.body, errors }),
            res,
        );

        expect(writeHeadMock).toBeCalledWith(302, { Location: TYPE_OF_CONSEQUENCE_PAGE_PATH });
    });
});
