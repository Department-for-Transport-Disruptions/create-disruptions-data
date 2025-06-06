import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DISRUPTION_DETAIL_PAGE_PATH, ERROR_PATH } from "../../constants";
import * as db from "../../data/db";
import { getMockRequestAndResponse, mockSession } from "../../testData/mockData";
import * as session from "../../utils/apiUtils/auth";
import cancelChanges from "./cancel-changes.api";

const defaultDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";

const getSessionSpy = vi.spyOn(session, "getSession");

describe("cancelChanges", () => {
    const writeHeadMock = vi.fn();

    vi.mock("../../data/db", () => ({
        deleteEditedDisruption: vi.fn(),
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

    const isDisruptionInEditSpy = vi.spyOn(db, "isDisruptionInEdit");

    it("should redirect to /disruption-detail page after cancelling disruptions for admin user", async () => {
        isDisruptionInEditSpy.mockResolvedValue(true);
        const { req, res } = getMockRequestAndResponse({
            body: {
                disruptionId: defaultDisruptionId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await cancelChanges(req, res);

        expect(db.deleteEditedDisruption).toBeCalledTimes(1);

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${DISRUPTION_DETAIL_PAGE_PATH}/${defaultDisruptionId}`,
        });
    });

    it("should redirect to /disruption-detail page after cancelling template disruptions for admin user", async () => {
        isDisruptionInEditSpy.mockResolvedValue(true);
        const { req, res } = getMockRequestAndResponse({
            body: {
                disruptionId: defaultDisruptionId,
            },
            query: { template: "true" },
            mockWriteHeadFn: writeHeadMock,
        });

        await cancelChanges(req, res);

        expect(db.deleteEditedDisruption).toBeCalledTimes(1);

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${DISRUPTION_DETAIL_PAGE_PATH}/${defaultDisruptionId}?template=true`,
        });
    });

    it("should redirect to /disruption-detail page after cancelling disruptions for staff user", async () => {
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

        await cancelChanges(req, res);

        expect(db.deleteEditedDisruption).not.toBeCalled();

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${DISRUPTION_DETAIL_PAGE_PATH}/${defaultDisruptionId}`,
        });
    });

    it("should redirect to error page if disruptionId not passed", async () => {
        isDisruptionInEditSpy.mockResolvedValue(true);
        const { req, res } = getMockRequestAndResponse({
            mockWriteHeadFn: writeHeadMock,
        });

        await cancelChanges(req, res);

        expect(db.deleteEditedDisruption).not.toBeCalled();
        expect(writeHeadMock).toBeCalledWith(302, { Location: ERROR_PATH });
    });
});
