import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import MockDate from "mockdate";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ERROR_PATH } from "../../constants";
import * as db from "../../data/db";
import * as dynamo from "../../data/dynamo";
import { FullDisruption } from "../../schemas/disruption.schema";
import { Organisation, defaultModes } from "../../schemas/organisation.schema";
import {
    DEFAULT_ORG_ID,
    disruptionWithConsequences,
    disruptionWithConsequencesAndSocialMediaPosts,
    disruptionWithNoConsequences,
    getMockRequestAndResponse,
    mockSession,
} from "../../testData/mockData";
import * as session from "../../utils/apiUtils/auth";
import reject from "./reject.api";

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

    vi.mock("../../data/db", () => ({
        publishDisruption: vi.fn(),
        getDisruptionById: vi.fn(),
        deleteEditedDisruption: vi.fn(),
        upsertSocialMediaPost: vi.fn(),
    }));

    vi.mock("../../data/dynamo", () => ({
        getOrganisationInfoById: vi.fn(),
    }));

    vi.mock("crypto", () => ({
        default: {
            randomUUID: () => "id",
        },
    }));

    MockDate.set("2023-03-03");

    const insertDisruptionSpy = vi.spyOn(db, "publishDisruption");
    const upsertSocialMediaPostSpy = vi.spyOn(db, "upsertSocialMediaPost");
    const getDisruptionSpy = vi.spyOn(db, "getDisruptionById");
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

        expect(db.publishDisruption).toBeCalledTimes(1);
        expect(db.publishDisruption).toBeCalledWith(
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

        expect(db.publishDisruption).toBeCalledTimes(1);
        expect(db.publishDisruption).toBeCalledWith(
            disruptionWithConsequencesAndSocialMediaPosts,
            DEFAULT_ORG_ID,
            PublishStatus.rejected,
            "Test User",
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/dashboard" });
    });

    it("should retrieve valid data from cookies, write to dynamo and redirect for records with EDIT_PENDING_APPROVAL status", async () => {
        getDisruptionSpy.mockResolvedValue({
            ...disruptionWithConsequences,
            publishStatus: PublishStatus.editPendingApproval,
        });

        const { req, res } = getMockRequestAndResponse({
            body: {
                disruptionId: defaultDisruptionId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await reject(req, res);

        expect(db.deleteEditedDisruption).toBeCalledTimes(1);
        expect(db.deleteEditedDisruption).toBeCalledWith(disruptionWithConsequences.id, DEFAULT_ORG_ID);

        expect(writeHeadMock).toBeCalledWith(302, { Location: "/dashboard" });
    });

    it("should redirect to error page if disruptionId not passed", async () => {
        getDisruptionSpy.mockResolvedValue(disruptionWithConsequences);

        const { req, res } = getMockRequestAndResponse({
            mockWriteHeadFn: writeHeadMock,
        });

        await reject(req, res);

        expect(db.publishDisruption).not.toBeCalled();
        expect(db.deleteEditedDisruption).not.toBeCalled();
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

        await reject(req, res);

        expect(db.publishDisruption).not.toBeCalled();
        expect(db.deleteEditedDisruption).not.toBeCalled();
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
                disruptionId: disruption.id,
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
