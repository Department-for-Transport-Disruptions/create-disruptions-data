import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import MockDate from "mockdate";
import { describe, it, expect, afterEach, vi, afterAll, beforeEach } from "vitest";
import reject from "./reject.api";
import { ERROR_PATH } from "../../constants";
import * as dynamo from "../../data/dynamo";
import { Disruption } from "../../schemas/disruption.schema";
import { Organisation, defaultModes } from "../../schemas/organisation.schema";
import {
    DEFAULT_ORG_ID,
    disruptionWithConsequences,
    disruptionWithNoConsequences,
    getMockRequestAndResponse,
    ptSituationElementWithMultipleConsequences,
    mockSession,
    disruptionWithConsequencesAndSocialMediaPosts,
} from "../../testData/mockData";
import * as session from "../../utils/apiUtils/auth";

const orgInfo: Organisation = {
    name: "DepartmentForTransport",
    adminAreaCodes: ["001", "002"],
    mode: defaultModes,
};
const defaultDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";

describe("reject", () => {
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
        deleteDisruptionsInEdit: vi.fn(),
        deleteDisruptionsInPending: vi.fn(),
        upsertSocialMediaPost: vi.fn(),
        getOrganisationInfoById: vi.fn(),
    }));

    vi.mock("crypto", () => ({
        randomUUID: () => "id",
    }));

    MockDate.set("2023-03-03");

    const insertDisruptionSpy = vi.spyOn(dynamo, "insertPublishedDisruptionIntoDynamoAndUpdateDraft");
    const upsertSocialMediaPostSpy = vi.spyOn(dynamo, "upsertSocialMediaPost");
    const getDisruptionSpy = vi.spyOn(dynamo, "getDisruptionById");
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
            return { ...mockSession, isOrgAdmin: true, isSystemAdmin: false };
        });
        getOrganisationInfoByIdSpy.mockResolvedValue(orgInfo);
    });

    it("should retrieve valid data from cookies, write to dynamo and redirect", async () => {
        getDisruptionSpy.mockResolvedValue(disruptionWithConsequences);

        const { req, res } = getMockRequestAndResponse({
            body: {
                disruptionId: defaultDisruptionId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await reject(req, res);

        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).toBeCalledTimes(1);
        expect(dynamo.deleteDisruptionsInEdit).toBeCalledTimes(1);
        expect(dynamo.deleteDisruptionsInPending).toBeCalledTimes(1);
        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).toBeCalledWith(
            ptSituationElementWithMultipleConsequences,
            disruptionWithConsequences,
            DEFAULT_ORG_ID,
            PublishStatus.rejected,
            "Test User",
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/dashboard" });
    });

    it("should retrieve valid data from cookies, write to dynamo and redirect with social media posts", async () => {
        getDisruptionSpy.mockResolvedValue(disruptionWithConsequencesAndSocialMediaPosts);

        const { req, res } = getMockRequestAndResponse({
            body: {
                disruptionId: defaultDisruptionId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await reject(req, res);

        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).toBeCalledTimes(1);
        expect(dynamo.deleteDisruptionsInEdit).toBeCalledTimes(1);
        expect(dynamo.deleteDisruptionsInPending).toBeCalledTimes(1);
        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).toBeCalledWith(
            ptSituationElementWithMultipleConsequences,
            disruptionWithConsequencesAndSocialMediaPosts,
            DEFAULT_ORG_ID,
            PublishStatus.rejected,
            "Test User",
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/dashboard" });
    });

    it("should retrieve valid data from cookies, write to dynamo and redirect for records with EDIT_PENDING_APPROVAL status", async () => {
        getDisruptionSpy.mockResolvedValue(disruptionWithConsequences);

        const { req, res } = getMockRequestAndResponse({
            body: {
                disruptionId: defaultDisruptionId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await reject(req, res);

        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).toBeCalledTimes(1);
        expect(dynamo.deleteDisruptionsInEdit).toBeCalledTimes(1);
        expect(dynamo.deleteDisruptionsInPending).toBeCalledTimes(1);
        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).toBeCalledWith(
            ptSituationElementWithMultipleConsequences,
            disruptionWithConsequences,
            DEFAULT_ORG_ID,
            PublishStatus.rejected,
            "Test User",
        );

        expect(writeHeadMock).toBeCalledWith(302, { Location: "/dashboard" });
    });

    it("should redirect to error page if disruptionId not passed", async () => {
        getDisruptionSpy.mockResolvedValue(disruptionWithConsequences);

        const { req, res } = getMockRequestAndResponse({
            mockWriteHeadFn: writeHeadMock,
        });

        await reject(req, res);

        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).not.toBeCalled();
        expect(dynamo.deleteDisruptionsInEdit).not.toBeCalled();
        expect(dynamo.deleteDisruptionsInPending).not.toBeCalled();
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

        await reject(req, res);

        expect(dynamo.insertPublishedDisruptionIntoDynamoAndUpdateDraft).not.toBeCalled();
        expect(dynamo.deleteDisruptionsInEdit).not.toBeCalled();
        expect(dynamo.deleteDisruptionsInPending).not.toBeCalled();
        expect(writeHeadMock).toBeCalledWith(302, { Location: ERROR_PATH });
    });

    it.each([
        [disruptionWithConsequences],
        [disruptionWithNoConsequences],
        [disruptionWithConsequencesAndSocialMediaPosts],
    ])("should write the correct disruptions data to dynamoDB", async (disruption) => {
        getDisruptionSpy.mockResolvedValue(disruption);
        const { req, res } = getMockRequestAndResponse({
            body: {
                disruptionId: disruption.disruptionId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        if (disruption.socialMediaPosts) {
            upsertSocialMediaPostSpy.mockResolvedValue();
        }
        await reject(req, res);

        expect(insertDisruptionSpy.mock.calls[0]).toMatchSnapshot();
    });
});
