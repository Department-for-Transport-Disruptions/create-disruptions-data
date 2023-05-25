import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import MockDate from "mockdate";
import { describe, it, expect, afterEach, vi, afterAll } from "vitest";
import publish from "./publish.api";
import { DASHBOARD_PAGE_PATH, ERROR_PATH, REVIEW_DISRUPTION_PAGE_PATH } from "../../constants/index";
import * as dynamo from "../../data/dynamo";
import { Disruption } from "../../schemas/disruption.schema";
import {
    disruptionWithConsequencesAndSocialMediaPosts,
    ptSituationElementWithMultipleConsequences,
    getMockRequestAndResponse,
    disruptionWithNoConsequences,
    DEFAULT_ORG_ID,
} from "../../testData/mockData";

const defaultDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";

describe("publish", () => {
    const writeHeadMock = vi.fn();
    vi.mock("../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
        cleardownCookies: vi.fn(),
    }));

    vi.mock("../../data/dynamo", () => ({
        insertPublishedDisruptionIntoDynamoAndUpdateDraft: vi.fn(),
        getDisruptionById: vi.fn(),
    }));

    vi.mock("crypto", () => ({
        randomUUID: () => "id",
    }));

    MockDate.set("2023-03-03");

    const insertDisruptionSpy = vi.spyOn(dynamo, "insertPublishedDisruptionIntoDynamoAndUpdateDraft");
    const getDisruptionSpy = vi.spyOn(dynamo, "getDisruptionById");

    afterEach(() => {
        vi.resetAllMocks();
    });

    afterAll(() => {
        MockDate.reset();
    });

    it("should retrieve valid data from cookies, write to dynamo and redirect", async () => {
        getDisruptionSpy.mockResolvedValue(disruptionWithConsequencesAndSocialMediaPosts);
        const { req, res } = getMockRequestAndResponse({
            body: {
                disruptionId: defaultDisruptionId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await publish(req, res);

        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).toBeCalledTimes(1);
        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).toBeCalledWith(
            ptSituationElementWithMultipleConsequences,
            disruptionWithConsequencesAndSocialMediaPosts,
            DEFAULT_ORG_ID,
            PublishStatus.published,
            "test@example.com",
            "Disruption created and published",
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
        getDisruptionSpy.mockResolvedValue({} as Disruption);
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
});
