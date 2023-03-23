import MockDate from "mockdate";
import { describe, it, expect, afterEach, vi, afterAll } from "vitest";
import publish from "./publish.api";
import { COOKIES_CONSEQUENCE_INFO, COOKIES_DISRUPTION_INFO, ERROR_PATH } from "../../constants/index";
import { insertPublishedDisruptionIntoDynamo } from "../../data/dynamo";
import * as dynamo from "../../data/dynamo";
import {
    consequenceInfoNetworkTestCookie,
    consequenceInfoOperatorTestCookie,
    disruptionInfoMultipleValidityTestCookie,
    disruptionInfoTestCookie,
    getMockRequestAndResponse,
} from "../../testData/mockData";

describe("publish", () => {
    const writeHeadMock = vi.fn();
    vi.mock("../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
        cleardownCookies: vi.fn(),
    }));

    vi.mock("../../data/dynamo", () => ({
        insertPublishedDisruptionIntoDynamo: vi.fn(),
    }));

    vi.mock("crypto", () => ({
        randomUUID: () => "id",
    }));

    MockDate.set("2023-03-03");

    const dynamoSpy = vi.spyOn(dynamo, "insertPublishedDisruptionIntoDynamo");

    afterEach(() => {
        vi.resetAllMocks();
    });

    afterAll(() => {
        MockDate.reset();
    });

    it("should retrieve valid data from cookies, write to dynamo and redirect", async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {
                [COOKIES_DISRUPTION_INFO]: JSON.stringify(disruptionInfoTestCookie),
                [COOKIES_CONSEQUENCE_INFO]: JSON.stringify(consequenceInfoNetworkTestCookie),
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await publish(req, res);

        expect(insertPublishedDisruptionIntoDynamo).toBeCalledTimes(1);
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/dashboard" });
    });

    it("should redirect to start page if disruption info cookie is invalid", async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {
                [COOKIES_DISRUPTION_INFO]: JSON.stringify({
                    ...disruptionInfoTestCookie,
                    disruptionReason: "invalid reason",
                }),
                [COOKIES_CONSEQUENCE_INFO]: JSON.stringify(consequenceInfoNetworkTestCookie),
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await publish(req, res);

        expect(insertPublishedDisruptionIntoDynamo).not.toBeCalled();
        expect(writeHeadMock).toBeCalledWith(302, { Location: ERROR_PATH });
    });

    it("should redirect to start page if consequence info cookie is invalid", async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {
                [COOKIES_DISRUPTION_INFO]: JSON.stringify(disruptionInfoTestCookie),
                [COOKIES_CONSEQUENCE_INFO]: JSON.stringify({
                    ...consequenceInfoOperatorTestCookie,
                    disruptionDirection: "invalidDirection",
                }),
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await publish(req, res);

        expect(insertPublishedDisruptionIntoDynamo).not.toBeCalled();
        expect(writeHeadMock).toBeCalledWith(302, { Location: ERROR_PATH });
    });

    it.each([
        [disruptionInfoTestCookie, consequenceInfoNetworkTestCookie],
        [disruptionInfoTestCookie, consequenceInfoOperatorTestCookie],
        [disruptionInfoMultipleValidityTestCookie, consequenceInfoNetworkTestCookie],
    ])("should write the correct disruptions data to dynamoDB", async (disruptionCookie, consequenceCookie) => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {
                [COOKIES_DISRUPTION_INFO]: JSON.stringify(disruptionCookie),
                [COOKIES_CONSEQUENCE_INFO]: JSON.stringify(consequenceCookie),
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await publish(req, res);

        expect(dynamoSpy.mock.calls[0][0]).toMatchSnapshot();
    });
});
