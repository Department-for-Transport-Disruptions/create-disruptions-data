import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
import { PublishStatus, SocialMediaPostStatus } from "@create-disruptions-data/shared-ts/enums";
import { mockClient } from "aws-sdk-client-mock";
import MockDate from "mockdate";
import { describe, it, expect, afterEach, vi, afterAll, beforeEach, beforeAll } from "vitest";
import publishEdit from "./publish-edit.api";
import { DASHBOARD_PAGE_PATH, ERROR_PATH, VIEW_ALL_TEMPLATES_PAGE_PATH } from "../../constants";
import * as cognito from "../../data/cognito";
import * as dynamo from "../../data/dynamo";
import { FullDisruption } from "../../schemas/disruption.schema";
import { Organisation, defaultModes } from "../../schemas/organisation.schema";
import {
    DEFAULT_ORG_ID,
    disruptionWithConsequencesAndSocialMediaPosts,
    disruptionWithNoConsequences,
    getMockRequestAndResponse,
    mockSession,
    disruptionWithConsequences,
    mockOrgAdmins,
} from "../../testData/mockData";
import * as apiUtils from "../../utils/apiUtils";
import * as session from "../../utils/apiUtils/auth";

const defaultDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";
const orgInfo: Organisation = {
    name: "DepartmentForTransport",
    adminAreaCodes: ["001", "002"],
    mode: defaultModes,
};

const sesMock = mockClient(SESClient);

describe("publishEdit", () => {
    const writeHeadMock = vi.fn();
    vi.mock("../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
        cleardownCookies: vi.fn(),
        publishToHootsuite: vi.fn(),
    }));

    vi.mock("../../data/dynamo", () => ({
        insertPublishedDisruptionIntoDynamoAndUpdateDraft: vi.fn(),
        getDisruptionById: vi.fn(),
        publishEditedConsequencesAndSocialMediaPosts: vi.fn(),
        deleteDisruptionsInEdit: vi.fn(),
        publishEditedConsequencesAndSocialMediaPostsIntoPending: vi.fn(),
        publishPendingConsequencesAndSocialMediaPosts: vi.fn(),
        deleteDisruptionsInPending: vi.fn(),
        updatePendingDisruptionStatus: vi.fn(),
        getOrganisationInfoById: vi.fn(),
    }));

    vi.mock("../../data/cognito", () => ({
        getAllUsersInGroup: vi.fn(),
    }));

    vi.mock("crypto", () => ({
        randomUUID: () => "id",
    }));

    MockDate.set("2023-03-03");

    const insertDisruptionSpy = vi.spyOn(dynamo, "insertPublishedDisruptionIntoDynamoAndUpdateDraft");
    const getDisruptionSpy = vi.spyOn(dynamo, "getDisruptionById");
    const publishSocialMediaSpy = vi.spyOn(apiUtils, "publishSocialMedia");
    const getOrganisationInfoByIdSpy = vi.spyOn(dynamo, "getOrganisationInfoById");
    const getAllUsersInGroupSpy = vi.spyOn(cognito, "getAllUsersInGroup");
    const getSessionSpy = vi.spyOn(session, "getSession");

    beforeAll(() => {
        process.env.ROOT_DOMAIN = "test.com";
    });

    beforeEach(() => {
        getSessionSpy.mockImplementation(() => {
            return mockSession;
        });
        getOrganisationInfoByIdSpy.mockResolvedValue(orgInfo);
        sesMock.reset();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    afterAll(() => {
        MockDate.reset();
    });

    it("should retrieve valid data from cookies, write to dynamo and redirect for admin user", async () => {
        getDisruptionSpy.mockResolvedValue(disruptionWithConsequences);

        const { req, res } = getMockRequestAndResponse({
            body: {
                disruptionId: defaultDisruptionId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await publishEdit(req, res);

        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).toBeCalledTimes(1);
        expect(dynamo.publishEditedConsequencesAndSocialMediaPosts).toBeCalledTimes(1);
        expect(dynamo.deleteDisruptionsInEdit).toBeCalledTimes(1);
        expect(dynamo.deleteDisruptionsInPending).toBeCalledTimes(1);
        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).toBeCalledWith(
            disruptionWithConsequences,
            DEFAULT_ORG_ID,
            PublishStatus.published,
            "Test User",
            undefined,
            false,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: DASHBOARD_PAGE_PATH });
    });

    it("should retrieve valid data from cookies, write to dynamo and redirect for admin user with social media", async () => {
        getDisruptionSpy.mockResolvedValue(disruptionWithConsequencesAndSocialMediaPosts);

        const { req, res } = getMockRequestAndResponse({
            body: {
                disruptionId: defaultDisruptionId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        publishSocialMediaSpy.mockResolvedValue();

        await publishEdit(req, res);

        expect(publishSocialMediaSpy).toHaveBeenCalledWith(
            disruptionWithConsequencesAndSocialMediaPosts.socialMediaPosts?.filter(
                (post) => post.status === SocialMediaPostStatus.pending,
            ),
            DEFAULT_ORG_ID,
            false,
            true,
        );
        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).toBeCalledTimes(1);
        expect(dynamo.publishEditedConsequencesAndSocialMediaPosts).toBeCalledTimes(1);
        expect(dynamo.deleteDisruptionsInEdit).toBeCalledTimes(1);
        expect(dynamo.deleteDisruptionsInPending).toBeCalledTimes(1);
        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).toBeCalledWith(
            disruptionWithConsequencesAndSocialMediaPosts,
            DEFAULT_ORG_ID,
            PublishStatus.published,
            "Test User",
            undefined,
            false,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/dashboard" });
    });

    it("should retrieve valid data from cookies, write to dynamo and redirect for staff user", async () => {
        getDisruptionSpy.mockResolvedValue(disruptionWithConsequencesAndSocialMediaPosts);
        getSessionSpy.mockImplementation(() => {
            return { ...mockSession, isOrgStaff: true, isSystemAdmin: false };
        });
        getAllUsersInGroupSpy.mockResolvedValue(mockOrgAdmins);
        const { req, res } = getMockRequestAndResponse({
            body: {
                disruptionId: defaultDisruptionId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await publishEdit(req, res);

        expect(publishSocialMediaSpy).not.toHaveBeenCalled();
        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).toBeCalledTimes(1);
        expect(dynamo.publishEditedConsequencesAndSocialMediaPosts).toBeCalledTimes(1);
        expect(dynamo.deleteDisruptionsInEdit).toBeCalledTimes(1);
        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).toBeCalledWith(
            disruptionWithConsequencesAndSocialMediaPosts,
            DEFAULT_ORG_ID,
            PublishStatus.pendingApproval,
            "Test User",
            undefined,
            false,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/dashboard" });
    });

    it("should retrieve valid data from cookies, write template to dynamo and redirect for staff user", async () => {
        getDisruptionSpy.mockResolvedValue({ ...disruptionWithConsequencesAndSocialMediaPosts, template: true });
        getSessionSpy.mockImplementation(() => {
            return { ...mockSession, isOrgStaff: true, isSystemAdmin: false };
        });
        const { req, res } = getMockRequestAndResponse({
            body: {
                disruptionId: defaultDisruptionId,
            },
            query: { template: "true" },
            mockWriteHeadFn: writeHeadMock,
        });

        await publishEdit(req, res);

        expect(publishSocialMediaSpy).not.toHaveBeenCalled();
        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).toBeCalledTimes(1);
        expect(dynamo.publishEditedConsequencesAndSocialMediaPosts).toBeCalledTimes(1);
        expect(dynamo.deleteDisruptionsInEdit).toBeCalledTimes(1);
        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).toBeCalledWith(
            { ...disruptionWithConsequencesAndSocialMediaPosts, template: true },
            DEFAULT_ORG_ID,
            PublishStatus.published,
            "Test User",
            undefined,
            true,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: VIEW_ALL_TEMPLATES_PAGE_PATH });
    });

    it("should retrieve valid data from cookies, write to dynamo and redirect for admin user with records in pending", async () => {
        getDisruptionSpy.mockResolvedValue(disruptionWithConsequences);

        const { req, res } = getMockRequestAndResponse({
            body: {
                disruptionId: defaultDisruptionId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await publishEdit(req, res);

        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).toBeCalledTimes(1);
        expect(dynamo.deleteDisruptionsInEdit).toBeCalledTimes(1);
        expect(dynamo.deleteDisruptionsInPending).toBeCalledTimes(1);
        expect(dynamo.updatePendingDisruptionStatus).not.toBeCalled();
        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).toBeCalledWith(
            disruptionWithConsequences,
            DEFAULT_ORG_ID,
            PublishStatus.published,
            "Test User",
            undefined,
            false,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/dashboard" });
    });

    it("should retrieve valid data from cookies, write to dynamo and redirect for staff user with records in pending", async () => {
        getDisruptionSpy.mockResolvedValue(disruptionWithConsequencesAndSocialMediaPosts);
        getSessionSpy.mockImplementation(() => {
            return { ...mockSession, isOrgStaff: true, isSystemAdmin: false };
        });
        getAllUsersInGroupSpy.mockResolvedValue(mockOrgAdmins);

        const { req, res } = getMockRequestAndResponse({
            body: {
                disruptionId: defaultDisruptionId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await publishEdit(req, res);

        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).toBeCalledTimes(1);
        expect(dynamo.deleteDisruptionsInEdit).toBeCalledTimes(1);
        expect(dynamo.deleteDisruptionsInPending).not.toBeCalled();
        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).toBeCalledWith(
            disruptionWithConsequencesAndSocialMediaPosts,
            DEFAULT_ORG_ID,
            PublishStatus.pendingApproval,
            "Test User",
            undefined,
            false,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/dashboard" });
    });

    it("should redirect to error page if disruptionId not passed", async () => {
        getDisruptionSpy.mockResolvedValue(disruptionWithConsequencesAndSocialMediaPosts);
        const { req, res } = getMockRequestAndResponse({
            mockWriteHeadFn: writeHeadMock,
        });

        await publishEdit(req, res);

        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).not.toBeCalled();
        expect(dynamo.publishEditedConsequencesAndSocialMediaPosts).not.toBeCalled();
        expect(dynamo.deleteDisruptionsInEdit).not.toBeCalled();
        expect(dynamo.deleteDisruptionsInPending).not.toBeCalled();
        expect(writeHeadMock).toBeCalledWith(302, { Location: ERROR_PATH });
    });

    it("should redirect to error page if disruption is invalid", async () => {
        getDisruptionSpy.mockResolvedValue({} as FullDisruption);
        const { req, res } = getMockRequestAndResponse({
            body: {
                disruptionId: defaultDisruptionId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await publishEdit(req, res);

        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).not.toBeCalled();
        expect(dynamo.publishEditedConsequencesAndSocialMediaPosts).not.toBeCalled();
        expect(dynamo.deleteDisruptionsInEdit).not.toBeCalled();
        expect(dynamo.deleteDisruptionsInPending).not.toBeCalled();
        expect(writeHeadMock).toBeCalledWith(302, { Location: ERROR_PATH });
    });

    it.each([[disruptionWithConsequencesAndSocialMediaPosts], [disruptionWithNoConsequences]])(
        "should write the correct disruptions data to dynamoDB",
        async (disruption) => {
            getDisruptionSpy.mockResolvedValue(disruption);
            const { req, res } = getMockRequestAndResponse({
                body: {
                    disruptionId: disruption.disruptionId,
                },
                mockWriteHeadFn: writeHeadMock,
            });

            await publishEdit(req, res);

            expect(insertDisruptionSpy.mock.calls[0]).toMatchSnapshot();
        },
    );

    it("should send an email to org admin if an org staff creates a disruption", async () => {
        getDisruptionSpy.mockResolvedValue(disruptionWithConsequences);
        getSessionSpy.mockImplementation(() => ({ ...mockSession, isOrgStaff: true, isSystemAdmin: false }));
        getAllUsersInGroupSpy.mockResolvedValue(mockOrgAdmins);
        const { req, res } = getMockRequestAndResponse({
            body: {
                disruptionId: defaultDisruptionId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await publishEdit(req, res);

        expect(sesMock.send.calledOnce).toBeTruthy();
        expect(sesMock.commandCalls(SendEmailCommand)[0].args[0].input.Destination).toEqual({
            ToAddresses: ["emailtoshow@test.com"],
        });
    });

    it("should redirect to dashboard and log an error if an org staff creates a disruption an no org admins exists for staff member's org", async () => {
        getDisruptionSpy.mockResolvedValue(disruptionWithConsequences);
        getSessionSpy.mockImplementation(() => ({ ...mockSession, isOrgStaff: true, isSystemAdmin: false }));
        getAllUsersInGroupSpy.mockResolvedValue([]);
        const { req, res } = getMockRequestAndResponse({
            body: {
                disruptionId: defaultDisruptionId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await publishEdit(req, res);

        expect(sesMock.send.calledOnce).toBeFalsy();
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: DASHBOARD_PAGE_PATH,
        });
    });
});
