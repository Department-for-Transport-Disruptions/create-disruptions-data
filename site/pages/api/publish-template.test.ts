import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import MockDate from "mockdate";
import { describe, it, expect, afterEach, vi, afterAll, beforeEach } from "vitest";
import publishTemplate from "./publish-template.api";
import { ERROR_PATH, REVIEW_TEMPLATE_PAGE_PATH, VIEW_ALL_TEMPLATES_PAGE_PATH } from "../../constants/index";
import * as dynamo from "../../data/dynamo";
import { FullDisruption } from "../../schemas/disruption.schema";
import { Organisation, defaultModes } from "../../schemas/organisation.schema";
import {
    disruptionWithConsequencesAndSocialMediaPosts,
    getMockRequestAndResponse,
    disruptionWithNoConsequences,
    DEFAULT_ORG_ID,
    disruptionWithConsequences,
} from "../../testData/mockData";
import * as apiUtils from "../../utils/apiUtils";

const defaultDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";

const orgInfo: Organisation = {
    name: "DepartmentForTransport",
    adminAreaCodes: ["001", "002"],
    mode: defaultModes,
};
describe("publish-template", () => {
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

    vi.mock("crypto", () => ({
        randomUUID: () => "id",
    }));

    MockDate.set("2023-03-03");

    const insertDisruptionSpy = vi.spyOn(dynamo, "insertPublishedDisruptionIntoDynamoAndUpdateDraft");
    const getDisruptionSpy = vi.spyOn(dynamo, "getDisruptionById");
    const publishSocialMediaSpy = vi.spyOn(apiUtils, "publishSocialMedia");
    const getOrganisationInfoByIdSpy = vi.spyOn(dynamo, "getOrganisationInfoById");

    beforeEach(() => {
        getOrganisationInfoByIdSpy.mockResolvedValue(orgInfo);
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

        await publishTemplate(req, res);

        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).toBeCalledTimes(1);
        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).toBeCalledWith(
            disruptionWithConsequences,
            DEFAULT_ORG_ID,
            PublishStatus.published,
            "test@example.com",
            undefined,
            true,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: VIEW_ALL_TEMPLATES_PAGE_PATH });
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

        await publishTemplate(req, res);

        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).toBeCalledTimes(1);
        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).toBeCalledWith(
            disruptionWithConsequencesAndSocialMediaPosts,
            DEFAULT_ORG_ID,
            PublishStatus.published,
            "test@example.com",
            undefined,
            true,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: VIEW_ALL_TEMPLATES_PAGE_PATH });
    });

    it("should redirect to error page if disruptionId not passed", async () => {
        getDisruptionSpy.mockResolvedValue(disruptionWithConsequencesAndSocialMediaPosts);
        const { req, res } = getMockRequestAndResponse({
            mockWriteHeadFn: writeHeadMock,
        });

        await publishTemplate(req, res);

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

        await publishTemplate(req, res);

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

        await publishTemplate(req, res);

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

        await publishTemplate(req, res);

        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).not.toBeCalled();
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${REVIEW_TEMPLATE_PAGE_PATH}/${defaultDisruptionId}`,
        });
    });
});
