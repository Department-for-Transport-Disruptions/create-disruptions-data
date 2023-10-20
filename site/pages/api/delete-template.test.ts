import MockDate from "mockdate";
import { describe, it, expect, afterEach, vi, afterAll } from "vitest";
import deleteTemplate from "./delete-template.api";
import { ERROR_PATH, VIEW_ALL_TEMPLATES_PAGE_PATH } from "../../constants/index";
import * as dynamo from "../../data/dynamo";
import { FullDisruption } from "../../schemas/disruption.schema";
import {
    disruptionWithConsequencesAndSocialMediaPosts,
    getMockRequestAndResponse,
    disruptionWithNoConsequences,
    DEFAULT_ORG_ID,
} from "../../testData/mockData";

const defaultDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";

describe("deleteTemplate", () => {
    const writeHeadMock = vi.fn();
    vi.mock("../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
        cleardownCookies: vi.fn(),
    }));

    vi.mock("../../data/dynamo", () => ({
        deletePublishedDisruption: vi.fn(),
        getDisruptionById: vi.fn(),
    }));

    vi.mock("crypto", () => ({
        randomUUID: () => "id",
    }));

    MockDate.set("2023-03-03");

    const deleteDisruptionSpy = vi.spyOn(dynamo, "deletePublishedDisruption");
    const getDisruptionSpy = vi.spyOn(dynamo, "getDisruptionById");

    afterEach(() => {
        vi.resetAllMocks();
    });

    afterAll(() => {
        MockDate.reset();
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

        await deleteTemplate(req, res);

        expect(dynamo.deletePublishedDisruption).toBeCalledTimes(1);
        expect(dynamo.deletePublishedDisruption).toBeCalledWith(
            disruptionWithConsequencesAndSocialMediaPosts,
            defaultDisruptionId,
            DEFAULT_ORG_ID,
            true,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: VIEW_ALL_TEMPLATES_PAGE_PATH });
    });

    it("should redirect to error page if disruptionId not passed", async () => {
        getDisruptionSpy.mockResolvedValue(disruptionWithConsequencesAndSocialMediaPosts);
        const { req, res } = getMockRequestAndResponse({
            mockWriteHeadFn: writeHeadMock,
        });

        await deleteTemplate(req, res);

        expect(dynamo.deletePublishedDisruption).not.toBeCalled();
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

        await deleteTemplate(req, res);

        expect(dynamo.deletePublishedDisruption).not.toBeCalled();
        expect(writeHeadMock).toBeCalledWith(302, { Location: ERROR_PATH });
    });

    it.each([[disruptionWithConsequencesAndSocialMediaPosts], [disruptionWithNoConsequences]])(
        "should write the correct disruptions data to dynamoDB",
        async (disruption) => {
            getDisruptionSpy.mockResolvedValue(disruption);
            const { req, res } = getMockRequestAndResponse({
                body: {
                    id: disruption.disruptionId,
                },
                mockWriteHeadFn: writeHeadMock,
            });

            await deleteTemplate(req, res);

            expect(deleteDisruptionSpy.mock.calls[0][0]).toMatchSnapshot();
        },
    );
});
