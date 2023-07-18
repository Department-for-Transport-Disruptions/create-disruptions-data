import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import removeHootsuiteConnection from "./remove-hootsuite-connection.api";
import { ERROR_PATH, SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH } from "../../constants";
import * as ssm from "../../data/ssm";
import { getMockRequestAndResponse, mockSession } from "../../testData/mockData";
import * as session from "../../utils/apiUtils/auth";

describe("remove-hootsuite-connection", () => {
    const writeHeadMock = vi.fn();

    afterEach(() => {
        vi.resetAllMocks();
    });

    vi.mock("../../data/ssm", () => ({
        deleteParameter: vi.fn(),
    }));

    const getSessionSpy = vi.spyOn(session, "getSession");

    beforeEach(() => {
        getSessionSpy.mockImplementation(() => {
            return { ...mockSession, isOrgAdmin: true };
        });
    });

    const deleteParameterSpy = vi.spyOn(ssm, "deleteParameter");

    it("should redirect to the social media accounts page upon successful removal of hootsuite connection", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                profileId: "123",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        deleteParameterSpy.mockResolvedValueOnce({});
        deleteParameterSpy.mockResolvedValueOnce({});

        await removeHootsuiteConnection(req, res);
        expect(ssm.deleteParameter).toHaveBeenNthCalledWith(
            1,
            "/social/35bae327-4af0-4bbf-8bfa-2c085f214483/hootsuite/123-token",
        );
        expect(ssm.deleteParameter).toHaveBeenNthCalledWith(
            2,
            "/social/35bae327-4af0-4bbf-8bfa-2c085f214483/hootsuite/123-addedUser",
        );
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH,
        });
    });

    it("should redirect to the social media accounts page upon unsuccessful removal of hootsuite connection", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                profileId: "123",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        deleteParameterSpy.mockImplementation(() => {
            throw new Error();
        });

        await removeHootsuiteConnection(req, res);
        expect(ssm.deleteParameter).toHaveBeenNthCalledWith(
            1,
            "/social/35bae327-4af0-4bbf-8bfa-2c085f214483/hootsuite/123-token",
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: ERROR_PATH,
        });
    });
});
