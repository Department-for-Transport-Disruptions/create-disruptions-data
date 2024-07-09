import { PublishStatus, SocialMediaPostStatus } from "@create-disruptions-data/shared-ts/enums";
import MockDate from "mockdate";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DASHBOARD_PAGE_PATH, ERROR_PATH, VIEW_ALL_TEMPLATES_PAGE_PATH } from "../../constants";
import * as dynamo from "../../data/dynamo";
import { FullDisruption } from "../../schemas/disruption.schema";
import { Organisation, defaultModes } from "../../schemas/organisation.schema";
import {
    DEFAULT_OPERATOR_ORG_ID,
    DEFAULT_ORG_ID,
    disruptionWithConsequences,
    disruptionWithConsequencesAndSocialMediaPosts,
    disruptionWithNoConsequences,
    getMockRequestAndResponse,
    mockSession,
} from "../../testData/mockData";
import * as apiUtils from "../../utils/apiUtils";
import * as session from "../../utils/apiUtils/auth";
import * as disruptionApprovalEmailer from "../../utils/apiUtils/disruptionApprovalEmailer";
import publishEdit from "./publish-edit.api";

const defaultDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";
const orgInfo: Organisation = {
    name: "DepartmentForTransport",
    adminAreaCodes: ["001", "002"],
    mode: defaultModes,
};

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

    vi.mock("../../utils/apiUtils/disruptionApprovalEmailer", () => ({
        sendDisruptionApprovalEmail: vi.fn(),
    }));

    vi.mock("crypto", () => ({
        randomUUID: () => "id",
    }));

    MockDate.set("2023-03-03");

    const insertDisruptionSpy = vi.spyOn(dynamo, "insertPublishedDisruptionIntoDynamoAndUpdateDraft");
    const getDisruptionSpy = vi.spyOn(dynamo, "getDisruptionById");
    const publishSocialMediaSpy = vi.spyOn(apiUtils, "publishSocialMedia");
    const getOrganisationInfoByIdSpy = vi.spyOn(dynamo, "getOrganisationInfoById");
    const getSessionSpy = vi.spyOn(session, "getSession");
    const sendDisruptionApprovalEmailSpy = vi.spyOn(disruptionApprovalEmailer, "sendDisruptionApprovalEmail");

    beforeEach(() => {
        getSessionSpy.mockImplementation(() => {
            return mockSession;
        });
        getOrganisationInfoByIdSpy.mockResolvedValue(orgInfo);
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

    it("should call sendDisruptionApprovalEmail method when an org staff creates a disruption", async () => {
        getDisruptionSpy.mockResolvedValue(disruptionWithConsequences);
        getSessionSpy.mockImplementation(() => ({ ...mockSession, isOrgStaff: true, isSystemAdmin: false }));
        const { req, res } = getMockRequestAndResponse({
            body: {
                disruptionId: defaultDisruptionId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await publishEdit(req, res);

        expect(sendDisruptionApprovalEmailSpy).toBeCalledWith(
            mockSession.orgId,
            disruptionWithConsequences.summary,
            disruptionWithConsequences.description,
            mockSession.name,
            disruptionWithConsequences.disruptionId,
        );
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: DASHBOARD_PAGE_PATH,
        });
    });

    it("should redirect to error page if user is operator the the disruption does not match their operatorOrgId", async () => {
        getSessionSpy.mockImplementation(() => ({
            ...mockSession,
            isOperatorUser: true,
            isSystemAdmin: false,
            operatorOrgId: DEFAULT_OPERATOR_ORG_ID,
        }));
        getDisruptionSpy.mockResolvedValue({
            ...disruptionWithConsequencesAndSocialMediaPosts,
            createdByOperatorOrgId: "35bae327-4af0-4bbf-8bfa-2c085f214482",
        });
        const { req, res } = getMockRequestAndResponse({
            mockWriteHeadFn: writeHeadMock,
            body: {
                disruptionId: defaultDisruptionId,
            },
        });

        await publishEdit(req, res);

        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).not.toBeCalled();
        expect(dynamo.publishEditedConsequencesAndSocialMediaPosts).not.toBeCalled();
        expect(dynamo.deleteDisruptionsInEdit).not.toBeCalled();
        expect(dynamo.deleteDisruptionsInPending).not.toBeCalled();
        expect(writeHeadMock).toBeCalledWith(302, { Location: ERROR_PATH });
    });

    it("should retrieve valid data from cookies, write to dynamo and redirect for operator user", async () => {
        getSessionSpy.mockImplementation(() => ({
            ...mockSession,
            isOperatorUser: true,
            isSystemAdmin: false,
            operatorOrgId: DEFAULT_OPERATOR_ORG_ID,
        }));
        getDisruptionSpy.mockResolvedValue({
            ...disruptionWithConsequences,
            createdByOperatorOrgId: DEFAULT_OPERATOR_ORG_ID,
        });

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
            {
                ...disruptionWithConsequences,
                createdByOperatorOrgId: DEFAULT_OPERATOR_ORG_ID,
            },
            DEFAULT_ORG_ID,
            PublishStatus.published,
            "Test User",
            undefined,
            false,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: DASHBOARD_PAGE_PATH });
    });
});
