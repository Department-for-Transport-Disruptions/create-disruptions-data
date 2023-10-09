import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
import { PublishStatus, SocialMediaPostStatus } from "@create-disruptions-data/shared-ts/enums";
import { mockClient } from "aws-sdk-client-mock";
import MockDate from "mockdate";
import { describe, it, expect, afterEach, vi, afterAll, beforeEach, beforeAll } from "vitest";
import publish from "./publish.api";
import { DASHBOARD_PAGE_PATH, ERROR_PATH, REVIEW_DISRUPTION_PAGE_PATH } from "../../constants/index";
import * as cognito from "../../data/cognito";
import * as dynamo from "../../data/dynamo";
import { FullDisruption } from "../../schemas/disruption.schema";
import { Organisation, defaultModes } from "../../schemas/organisation.schema";
import {
    disruptionWithConsequencesAndSocialMediaPosts,
    getMockRequestAndResponse,
    disruptionWithNoConsequences,
    DEFAULT_ORG_ID,
    disruptionWithConsequences,
    mockSession,
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

describe("publish", () => {
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
        getOrganisationInfoByIdSpy.mockResolvedValue(orgInfo);
        sesMock.reset();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    afterAll(() => {
        MockDate.reset();
    });

    it("should retrieve valid data from cookies, write to dynamo and redirect", async () => {
        getDisruptionSpy.mockResolvedValue(disruptionWithConsequences);
        const { req, res } = getMockRequestAndResponse({
            body: {
                disruptionId: defaultDisruptionId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await publish(req, res);

        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).toBeCalledTimes(1);
        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).toBeCalledWith(
            disruptionWithConsequences,
            DEFAULT_ORG_ID,
            PublishStatus.published,
            "test@example.com",
            "Disruption created and published",
            false,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: DASHBOARD_PAGE_PATH });
    });

    it("should retrieve valid data from cookies, write to dynamo and redirect with social media", async () => {
        getDisruptionSpy.mockResolvedValue(disruptionWithConsequencesAndSocialMediaPosts);
        const { req, res } = getMockRequestAndResponse({
            body: {
                disruptionId: defaultDisruptionId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        publishSocialMediaSpy.mockResolvedValue();

        await publish(req, res);

        expect(publishSocialMediaSpy).toHaveBeenCalledWith(
            disruptionWithConsequencesAndSocialMediaPosts.socialMediaPosts?.filter(
                (post) => post.status === SocialMediaPostStatus.pending,
            ),
            DEFAULT_ORG_ID,
            false,
            true,
        );
        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).toBeCalledTimes(1);
        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).toBeCalledWith(
            disruptionWithConsequencesAndSocialMediaPosts,
            DEFAULT_ORG_ID,
            PublishStatus.published,
            "test@example.com",
            "Disruption created and published",
            false,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: DASHBOARD_PAGE_PATH });
    });

    it("should redirect to error page if disruptionId not passed", async () => {
        getDisruptionSpy.mockResolvedValue(disruptionWithConsequencesAndSocialMediaPosts);
        const { req, res } = getMockRequestAndResponse({
            mockWriteHeadFn: writeHeadMock,
        });

        await publish(req, res);

        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).not.toBeCalled();
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

        await publish(req, res);

        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).not.toBeCalled();
        expect(writeHeadMock).toBeCalledWith(302, { Location: ERROR_PATH });
    });

    it("should write the correct disruptions data to dynamoDB", async () => {
        getDisruptionSpy.mockResolvedValue(disruptionWithConsequencesAndSocialMediaPosts);
        const { req, res } = getMockRequestAndResponse({
            body: {
                disruptionId: disruptionWithConsequencesAndSocialMediaPosts.disruptionId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await publish(req, res);

        expect(insertDisruptionSpy.mock.calls[0]).toMatchSnapshot();
    });

    it("should redirect to review page if no consequences", async () => {
        getDisruptionSpy.mockResolvedValue(disruptionWithNoConsequences);
        const { req, res } = getMockRequestAndResponse({
            body: {
                disruptionId: defaultDisruptionId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await publish(req, res);

        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).not.toBeCalled();
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${REVIEW_DISRUPTION_PAGE_PATH}/${defaultDisruptionId}`,
        });
    });

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

        await publish(req, res);

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

        await publish(req, res);

        expect(sesMock.send.calledOnce).toBeFalsy();
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: DASHBOARD_PAGE_PATH,
        });
    });
});
