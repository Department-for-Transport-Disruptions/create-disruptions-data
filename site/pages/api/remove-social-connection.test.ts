import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import removeSocialConnection from "./remove-social-connection.api";
import { ERROR_PATH, SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH } from "../../constants";
import * as dynamo from "../../data/dynamo";
import * as ssm from "../../data/ssm";
import { getMockRequestAndResponse, mockSession } from "../../testData/mockData";
import * as session from "../../utils/apiUtils/auth";

describe("remove-social-connection", () => {
    const writeHeadMock = vi.fn();

    afterEach(() => {
        vi.resetAllMocks();
    });

    vi.mock("../../data/ssm", () => ({
        deleteParameter: vi.fn(),
    }));

    vi.mock("../../data/dynamo", () => ({
        removeSocialAccountFromOrg: vi.fn(),
    }));

    const getSessionSpy = vi.spyOn(session, "getSession");

    beforeEach(() => {
        getSessionSpy.mockReturnValue({ ...mockSession, isOrgAdmin: true, isSystemAdmin: false });
    });

    const deleteParameterSpy = vi.spyOn(ssm, "deleteParameter");
    const removeSocialAccountFromOrgSpy = vi.spyOn(dynamo, "removeSocialAccountFromOrg");

    it("should redirect to error if not an org admin", async () => {
        getSessionSpy.mockReturnValue(mockSession);

        const { req, res } = getMockRequestAndResponse({
            body: {
                profileId: "123",
                type: "Twitter",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await removeSocialConnection(req, res);

        expect(deleteParameterSpy).not.toHaveBeenCalled();
        expect(removeSocialAccountFromOrgSpy).not.toHaveBeenCalled();

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: ERROR_PATH,
        });
    });

    it("should redirect to error if type not provided", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                profileId: "123",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await removeSocialConnection(req, res);

        expect(deleteParameterSpy).not.toHaveBeenCalled();
        expect(removeSocialAccountFromOrgSpy).not.toHaveBeenCalled();

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: ERROR_PATH,
        });
    });

    it("should redirect to error if profileId not provided", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                type: "Twitter",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await removeSocialConnection(req, res);

        expect(deleteParameterSpy).not.toHaveBeenCalled();
        expect(removeSocialAccountFromOrgSpy).not.toHaveBeenCalled();

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: ERROR_PATH,
        });
    });

    it("should redirect to error if invalid type provided", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                profileId: "123",
                type: "Invalid",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await removeSocialConnection(req, res);

        expect(deleteParameterSpy).not.toHaveBeenCalled();
        expect(removeSocialAccountFromOrgSpy).not.toHaveBeenCalled();

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: ERROR_PATH,
        });
    });

    it("should redirect to the social media accounts page upon successful removal of twitter connection", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                profileId: "123",
                type: "Twitter",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await removeSocialConnection(req, res);

        expect(deleteParameterSpy).toHaveBeenCalledWith(
            "/social/35bae327-4af0-4bbf-8bfa-2c085f214483/twitter/123/refresh_token",
        );
        expect(removeSocialAccountFromOrgSpy).toHaveBeenCalledWith("35bae327-4af0-4bbf-8bfa-2c085f214483", "123");
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH,
        });
    });
});
