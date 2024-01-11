import MockDate from "mockdate";
import { describe, it, expect, afterEach, beforeEach, vi, afterAll } from "vitest";
import getAllDisruptions from "./[organisationId].api";
import * as s3 from "../../../data/s3";
import { DEFAULT_ORG_ID, getMockRequestAndResponse, mockSession } from "../../../testData/mockData";
import * as session from "../../../utils/apiUtils/auth";

describe("getAllDisruptions", () => {
    const writeHeadMock = vi.fn();

    vi.mock("../../data/dynamo", () => ({
        getDisruptionsDataFromDynamo: vi.fn(),
    }));

    vi.mock("../../../data/s3");

    const getDisruptionsSpy = vi.spyOn(s3, "getObject");
    const getSessionSpy = vi.spyOn(session, "getSession");

    beforeEach(() => {
        getSessionSpy.mockImplementation(() => {
            return mockSession;
        });
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    afterAll(() => {
        MockDate.reset();
    });

    it("should be successful when session is set", async () => {
        getDisruptionsSpy.mockResolvedValue("");

        const { req, res } = getMockRequestAndResponse({
            query: {
                organisationId: DEFAULT_ORG_ID,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        res.status = vi.fn().mockImplementation(() => ({
            json: vi.fn(),
        }));

        await getAllDisruptions(req, res);

        expect(getDisruptionsSpy).toHaveBeenCalledOnce();

        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 403 when no session set", async () => {
        getSessionSpy.mockReturnValue(null);

        const { req, res } = getMockRequestAndResponse({
            body: {},
            mockWriteHeadFn: writeHeadMock,
        });

        res.status = vi.fn().mockImplementation(() => ({
            json: vi.fn(),
        }));

        await getAllDisruptions(req, res);

        expect(getDisruptionsSpy).not.toHaveBeenCalledOnce();

        expect(res.status).toHaveBeenCalledWith(403);
    });

    it("should return 403 if orgIds do not match", async () => {
        getDisruptionsSpy.mockResolvedValue("");

        const { req, res } = getMockRequestAndResponse({
            query: {
                organisationId: "123",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        res.status = vi.fn().mockImplementation(() => ({
            json: vi.fn(),
        }));

        await getAllDisruptions(req, res);

        expect(getDisruptionsSpy).not.toHaveBeenCalledOnce();

        expect(res.status).toHaveBeenCalledWith(403);
    });
});
