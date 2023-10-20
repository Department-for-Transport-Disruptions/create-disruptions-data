import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import cancelTemplateChanges from "./cancel-template-changes.api";
import { DISRUPTION_DETAIL_PAGE_PATH, ERROR_PATH, TEMPLATE_OVERVIEW_PAGE_PATH } from "../../constants";
import * as dynamo from "../../data/dynamo";
import { getMockRequestAndResponse, mockSession } from "../../testData/mockData";
import * as session from "../../utils/apiUtils/auth";

const defaultDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";

const getSessionSpy = vi.spyOn(session, "getSession");

describe("cancelTemplateChanges", () => {
    const writeHeadMock = vi.fn();

    vi.mock("../../data/dynamo", () => ({
        deleteDisruptionsInEdit: vi.fn(),
        deleteDisruptionsInPending: vi.fn(),
        isDisruptionInEdit: vi.fn(),
    }));

    afterEach(() => {
        vi.resetAllMocks();
    });

    vi.mock("../../utils/apiUtils/auth", async () => ({
        ...(await vi.importActual<object>("../../utils/apiUtils/auth")),
        getSession: vi.fn(),
    }));

    beforeEach(() => {
        getSessionSpy.mockImplementation(() => {
            return mockSession;
        });
    });

    const isDisruptionInEditSpy = vi.spyOn(dynamo, "isDisruptionInEdit");

    it("should redirect to /template-overview page after cancelling disruptions for admin user", async () => {
        isDisruptionInEditSpy.mockResolvedValue(true);
        const { req, res } = getMockRequestAndResponse({
            body: {
                disruptionId: defaultDisruptionId,
            },
            query: { template: "true" },
            mockWriteHeadFn: writeHeadMock,
        });

        await cancelTemplateChanges(req, res);

        expect(dynamo.deleteDisruptionsInEdit).toBeCalledTimes(1);

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${TEMPLATE_OVERVIEW_PAGE_PATH}/${defaultDisruptionId}`,
        });
    });

    it("should redirect to /template-overview page after cancelling disruptions for staff user", async () => {
        isDisruptionInEditSpy.mockResolvedValue(false);
        const { req, res } = getMockRequestAndResponse({
            body: {
                disruptionId: defaultDisruptionId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        getSessionSpy.mockImplementation(() => {
            return { ...mockSession, isOrgStaff: true, isSystemAdmin: false };
        });

        await cancelTemplateChanges(req, res);

        expect(dynamo.deleteDisruptionsInEdit).toBeCalledTimes(1);
        expect(dynamo.deleteDisruptionsInPending).toBeCalledTimes(1);

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${DISRUPTION_DETAIL_PAGE_PATH}/${defaultDisruptionId}`,
        });
    });

    it("should redirect to error page if disruptionId not passed", async () => {
        isDisruptionInEditSpy.mockResolvedValue(true);
        const { req, res } = getMockRequestAndResponse({
            mockWriteHeadFn: writeHeadMock,
        });

        await cancelTemplateChanges(req, res);

        expect(dynamo.deleteDisruptionsInEdit).not.toBeCalled();
        expect(writeHeadMock).toBeCalledWith(302, { Location: ERROR_PATH });
    });
});
