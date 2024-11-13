import MockDate from "mockdate";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { ERROR_PATH, VIEW_ALL_TEMPLATES_PAGE_PATH } from "../../constants/index";
import * as db from "../../data/db";
import { FullDisruption } from "../../schemas/disruption.schema";
import {
    DEFAULT_ORG_ID,
    disruptionWithConsequencesAndSocialMediaPosts,
    disruptionWithNoConsequences,
    getMockRequestAndResponse,
} from "../../testData/mockData";
import deleteDisruption from "./delete-disruption.api";

const defaultDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";

describe("deleteDisruption", () => {
    const writeHeadMock = vi.fn();
    vi.mock("../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
        cleardownCookies: vi.fn(),
    }));

    vi.mock("../../data/db", () => ({
        deletePublishedDisruption: vi.fn(),
        getDisruptionById: vi.fn(),
    }));

    vi.mock("crypto", () => ({
        default: {
            randomUUID: () => "id",
        },
    }));

    MockDate.set("2023-03-03");

    const deleteDisruptionSpy = vi.spyOn(db, "deletePublishedDisruption");
    const getDisruptionSpy = vi.spyOn(db, "getDisruptionById");

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
                id: defaultDisruptionId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await deleteDisruption(req, res);

        expect(db.deletePublishedDisruption).toBeCalledTimes(1);
        expect(db.deletePublishedDisruption).toBeCalledWith(
            disruptionWithConsequencesAndSocialMediaPosts.id,
            DEFAULT_ORG_ID,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/dashboard" });
    });

    it("should retrieve valid data from cookies, write to dynamo and redirect to view all templates if deleting a template", async () => {
        getDisruptionSpy.mockResolvedValue(disruptionWithConsequencesAndSocialMediaPosts);
        const { req, res } = getMockRequestAndResponse({
            body: {
                id: defaultDisruptionId,
            },
            query: {
                template: "true",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await deleteDisruption(req, res);

        expect(db.deletePublishedDisruption).toBeCalledTimes(1);
        expect(db.deletePublishedDisruption).toBeCalledWith(
            disruptionWithConsequencesAndSocialMediaPosts.id,
            DEFAULT_ORG_ID,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: VIEW_ALL_TEMPLATES_PAGE_PATH });
    });

    it("should retrieve valid data from cookies, write to dynamo and redirect to template overview if deleting a disruption created from a template", async () => {
        getDisruptionSpy.mockResolvedValue(disruptionWithConsequencesAndSocialMediaPosts);
        const { req, res } = getMockRequestAndResponse({
            body: {
                id: defaultDisruptionId,
            },
            query: {
                return: `/disruption-detail/${defaultDisruptionId}?template=true&return=/view-all-templates`,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await deleteDisruption(req, res);

        expect(db.deletePublishedDisruption).toBeCalledTimes(1);
        expect(db.deletePublishedDisruption).toBeCalledWith(
            disruptionWithConsequencesAndSocialMediaPosts.id,
            DEFAULT_ORG_ID,
        );
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `/disruption-detail/${defaultDisruptionId}?template=true&return=/view-all-templates`,
        });
    });

    it("should redirect to error page if disruptionId not passed", async () => {
        getDisruptionSpy.mockResolvedValue(disruptionWithConsequencesAndSocialMediaPosts);
        const { req, res } = getMockRequestAndResponse({
            mockWriteHeadFn: writeHeadMock,
        });

        await deleteDisruption(req, res);

        expect(db.deletePublishedDisruption).not.toBeCalled();
        expect(writeHeadMock).toBeCalledWith(302, { Location: ERROR_PATH });
    });

    it("should redirect to error page if disruption is invalid", async () => {
        getDisruptionSpy.mockResolvedValue({} as FullDisruption);
        const { req, res } = getMockRequestAndResponse({
            body: {
                id: "",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await deleteDisruption(req, res);

        expect(db.deletePublishedDisruption).not.toBeCalled();
        expect(writeHeadMock).toBeCalledWith(302, { Location: ERROR_PATH });
    });

    it.each([[disruptionWithConsequencesAndSocialMediaPosts], [disruptionWithNoConsequences]])(
        "should write the correct disruptions data to dynamoDB",
        async (disruption) => {
            getDisruptionSpy.mockResolvedValue(disruption);
            const { req, res } = getMockRequestAndResponse({
                body: {
                    id: disruption.id,
                },
                mockWriteHeadFn: writeHeadMock,
            });

            await deleteDisruption(req, res);

            expect(deleteDisruptionSpy.mock.calls[0][0]).toMatchSnapshot();
        },
    );
});
