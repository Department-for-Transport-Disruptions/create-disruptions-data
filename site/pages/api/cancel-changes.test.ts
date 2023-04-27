import * as cookies from "nookies";
import { describe, it, expect, vi, afterEach } from "vitest";
import cancelChanges from "./cancel-changes.api";
import { COOKIES_DISRUPTION_DETAIL_REFERER, ERROR_PATH, VIEW_ALL_DISRUPTIONS_PAGE_PATH } from "../../constants";
import * as dynamo from "../../data/dynamo";
import { getMockRequestAndResponse } from "../../testData/mockData";
import { setCookieOnResponseObject } from "../../utils/apiUtils";

const defaultDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";

describe("cancelChanges", () => {
    const writeHeadMock = vi.fn();
    vi.mock("../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
        cleardownCookies: vi.fn(),
    }));

    vi.mock("../../data/dynamo", () => ({
        deleteDisruptionsInEdit: vi.fn(),
    }));

    // vi.mock("nookies", () => ({
    //     parseCookies: vi
    //         .fn()
    //         .mockImplementation(() => ({ "cdd-disruption-detail-referer": VIEW_ALL_DISRUPTIONS_PAGE_PATH })),
    // }));

    const parseCookies = vi.spyOn(cookies, "parseCookies");

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should redirect to /dashboard page after deleting disruptions", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                disruptionId: defaultDisruptionId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await cancelChanges(req, res);

        expect(dynamo.deleteDisruptionsInEdit).toBeCalledTimes(1);

        expect(writeHeadMock).toBeCalledWith(302, { Location: "/dashboard" });
    });

    it("should redirect to /view-all-disruptions page after deleting disruptions", async () => {
        parseCookies.mockImplementation(() => ({ "cdd-disruption-detail-referer": VIEW_ALL_DISRUPTIONS_PAGE_PATH }));
        const { req, res } = getMockRequestAndResponse({
            body: {
                disruptionId: defaultDisruptionId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        setCookieOnResponseObject(COOKIES_DISRUPTION_DETAIL_REFERER, VIEW_ALL_DISRUPTIONS_PAGE_PATH, res);

        await cancelChanges(req, res);

        expect(dynamo.deleteDisruptionsInEdit).toBeCalledTimes(1);

        expect(writeHeadMock).toBeCalledWith(302, { Location: VIEW_ALL_DISRUPTIONS_PAGE_PATH });
    });

    it("should redirect to error page if disruptionId not passed", async () => {
        const { req, res } = getMockRequestAndResponse({
            mockWriteHeadFn: writeHeadMock,
        });

        await cancelChanges(req, res);

        expect(dynamo.deleteDisruptionsInEdit).not.toBeCalled();
        expect(writeHeadMock).toBeCalledWith(302, { Location: ERROR_PATH });
    });
});
