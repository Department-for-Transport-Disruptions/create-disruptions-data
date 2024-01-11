import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import MockDate from "mockdate";
import { describe, it, expect, afterEach, beforeEach, vi, afterAll } from "vitest";
import getAllDisruptions, { getDisruptionsForTable } from "./[organisationId].api";
import * as s3 from "../../../data/s3";
import {
    DEFAULT_ORG_ID,
    disruptionArray,
    disruptionWithConsequencesAndSocialMediaPosts,
    getMockRequestAndResponse,
    mockSession,
} from "../../../testData/mockData";
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

    describe("getDashboardDisruptions", () => {
        it("should correctly parse disruptions", async () => {
            getDisruptionsSpy.mockResolvedValue(JSON.stringify(disruptionArray));

            const disruptions = await getDisruptionsForTable(DEFAULT_ORG_ID, false);

            expect(getDisruptionsSpy).toHaveBeenCalledOnce();

            expect(disruptions).toMatchSnapshot();
        });

        it("should filter out duplicate disruptions", async () => {
            const disruptionsToStringify = [
                ...disruptionArray,
                {
                    ...disruptionWithConsequencesAndSocialMediaPosts,
                    disruptionId: "ca090776-57c6-46a1-a03a-6e0236ee17c8",
                },
            ];
            disruptionsToStringify[2].publishStatus = PublishStatus.pendingAndEditing;

            getDisruptionsSpy.mockResolvedValue(JSON.stringify(disruptionsToStringify));

            const disruptions = await getDisruptionsForTable(DEFAULT_ORG_ID, false);

            expect(getDisruptionsSpy).toHaveBeenCalledOnce();

            expect(disruptions.length).toBe(3);
        });
    });
});
