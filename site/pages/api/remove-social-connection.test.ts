import * as ssm from "@create-disruptions-data/shared-ts/utils/ssm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ERROR_PATH, SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH } from "../../constants";
import * as dynamo from "../../data/dynamo";
import { getMockRequestAndResponse, mockSession } from "../../testData/mockData";
import * as session from "../../utils/apiUtils/auth";
import logger from "../../utils/logger";
import removeSocialConnection from "./remove-social-connection.api";

describe("remove-social-connection", () => {
    const writeHeadMock = vi.fn();

    afterEach(() => {
        vi.resetAllMocks();
    });

    vi.mock("@create-disruptions-data/shared-ts/utils/ssm", () => ({
        deleteParameter: vi.fn(),
    }));

    vi.mock("../../data/dynamo", () => ({
        removeSocialAccountFromOrg: vi.fn(),
    }));

    const getSessionSpy = vi.spyOn(session, "getSession");

    beforeEach(() => {
        getSessionSpy.mockReturnValue({ ...mockSession, isOrgAdmin: true });
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
            "/social/35bae327-4af0-4bbf-8bfa-2c085f214483/twitter/123/access_secret",
            logger,
        );
        expect(deleteParameterSpy).toHaveBeenCalledWith(
            "/social/35bae327-4af0-4bbf-8bfa-2c085f214483/twitter/123/access_token",
            logger,
        );
        expect(removeSocialAccountFromOrgSpy).toHaveBeenCalledWith("35bae327-4af0-4bbf-8bfa-2c085f214483", "123");
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH,
        });
    });

    it("should redirect to the social media accounts page and allow operators to remove a social media connection", async () => {
        getSessionSpy.mockReturnValue({ ...mockSession, isOperatorUser: true, isSystemAdmin: false });
        const { req, res } = getMockRequestAndResponse({
            body: {
                profileId: "123",
                type: "Twitter",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await removeSocialConnection(req, res);

        expect(deleteParameterSpy).toHaveBeenCalledWith(
            "/social/35bae327-4af0-4bbf-8bfa-2c085f214483/twitter/123/access_secret",
            logger,
        );
        expect(deleteParameterSpy).toHaveBeenCalledWith(
            "/social/35bae327-4af0-4bbf-8bfa-2c085f214483/twitter/123/access_token",
            logger,
        );
        expect(removeSocialAccountFromOrgSpy).toHaveBeenCalledWith("35bae327-4af0-4bbf-8bfa-2c085f214483", "123");
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH,
        });
    });
});
