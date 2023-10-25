import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import MockDate from "mockdate";
import { describe, it, expect, afterEach, vi, afterAll, beforeEach } from "vitest";
import publishEditTemplate from "./publish-edit-template.api";
import { VIEW_ALL_TEMPLATES_PAGE_PATH } from "../../constants";
import * as dynamo from "../../data/dynamo";
import { Organisation, defaultModes } from "../../schemas/organisation.schema";
import {
    DEFAULT_ORG_ID,
    disruptionWithConsequences,
    disruptionWithConsequencesAndSocialMediaPosts,
    getMockRequestAndResponse,
    mockSession,
} from "../../testData/mockData";
import * as apiUtils from "../../utils/apiUtils";
import * as session from "../../utils/apiUtils/auth";

const defaultDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";
const orgInfo: Organisation = {
    name: "DepartmentForTransport",
    adminAreaCodes: ["001", "002"],
    mode: defaultModes,
};

describe("publishEditTemplate", () => {
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

    vi.mock("crypto", () => ({
        randomUUID: () => "id",
    }));

    MockDate.set("2023-03-03");

    const getDisruptionSpy = vi.spyOn(dynamo, "getDisruptionById");
    const publishSocialMediaSpy = vi.spyOn(apiUtils, "publishSocialMedia");
    const getOrganisationInfoByIdSpy = vi.spyOn(dynamo, "getOrganisationInfoById");

    afterEach(() => {
        vi.resetAllMocks();
    });

    afterAll(() => {
        MockDate.reset();
    });

    const getSessionSpy = vi.spyOn(session, "getSession");

    beforeEach(() => {
        getSessionSpy.mockImplementation(() => {
            return mockSession;
        });
        getOrganisationInfoByIdSpy.mockResolvedValue(orgInfo);
    });

    it("should retrieve valid data from cookies, write template to dynamo and redirect for staff user", async () => {
        getDisruptionSpy.mockResolvedValue({ ...disruptionWithConsequencesAndSocialMediaPosts });
        getSessionSpy.mockImplementation(() => {
            return { ...mockSession, isOrgStaff: true, isSystemAdmin: false };
        });
        const { req, res } = getMockRequestAndResponse({
            body: {
                disruptionId: defaultDisruptionId,
            },

            mockWriteHeadFn: writeHeadMock,
        });

        await publishEditTemplate(req, res);

        expect(publishSocialMediaSpy).not.toHaveBeenCalled();
        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).toBeCalledTimes(1);
        expect(dynamo.publishEditedConsequencesAndSocialMediaPosts).toBeCalledTimes(1);
        expect(dynamo.deleteDisruptionsInEdit).toBeCalledTimes(1);
        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).toBeCalledWith(
            { ...disruptionWithConsequencesAndSocialMediaPosts },
            DEFAULT_ORG_ID,
            PublishStatus.pendingApproval,
            "Test User",
            undefined,
            true,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: VIEW_ALL_TEMPLATES_PAGE_PATH });
    });

    it("should retrieve valid data from cookies, write to dynamo and redirect for admin user", async () => {
        getDisruptionSpy.mockResolvedValue(disruptionWithConsequences);

        const { req, res } = getMockRequestAndResponse({
            body: {
                disruptionId: defaultDisruptionId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await publishEditTemplate(req, res);

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
            true,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: VIEW_ALL_TEMPLATES_PAGE_PATH });
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

        await publishEditTemplate(req, res);

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
            true,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: VIEW_ALL_TEMPLATES_PAGE_PATH });
    });
});
