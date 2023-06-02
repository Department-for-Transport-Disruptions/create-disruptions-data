import MockDate from "mockdate";
import { describe, it, expect, afterEach, vi, afterAll } from "vitest";
import deleteSocialMediaPost from "./delete-post.api";
import { DISRUPTION_DETAIL_PAGE_PATH, ERROR_PATH, REVIEW_DISRUPTION_PAGE_PATH } from "../../constants/index";
import * as dynamo from "../../data/dynamo";
import { getMockRequestAndResponse } from "../../testData/mockData";

const defaultDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";
const defaultSocialMediaPostId = "1";

describe("deletePost", () => {
    const writeHeadMock = vi.fn();
    vi.mock("../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
        cleardownCookies: vi.fn(),
    }));

    vi.mock("../../data/dynamo", () => ({
        removeSocialMediaPostFromDisruption: vi.fn(),
        upsertSocialMediaPost: vi.fn(),
    }));

    vi.mock("crypto", () => ({
        randomUUID: () => "id",
    }));

    MockDate.set("2023-03-03");

    const deleteConsequenceSpy = vi.spyOn(dynamo, "removeSocialMediaPostFromDisruption");

    afterEach(() => {
        vi.resetAllMocks();
    });

    afterAll(() => {
        MockDate.reset();
    });

    it("should retrieve valid data from cookies, write to dynamo and redirect", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                id: defaultSocialMediaPostId,
                disruptionId: defaultDisruptionId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await deleteSocialMediaPost(req, res);

        expect(dynamo.removeSocialMediaPostFromDisruption).toBeCalledTimes(1);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${REVIEW_DISRUPTION_PAGE_PATH}/${defaultDisruptionId}`,
        });
    });

    it("should redirect to /dashboard page after updating consequence when invoked from disruption details page", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                id: defaultSocialMediaPostId,
                disruptionId: defaultDisruptionId,
                inEdit: "true",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await deleteSocialMediaPost(req, res);

        expect(dynamo.upsertSocialMediaPost).toBeCalledTimes(1);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${DISRUPTION_DETAIL_PAGE_PATH}/${defaultDisruptionId}`,
        });
    });

    it("should redirect to error page if consequenceId not passed", async () => {
        const { req, res } = getMockRequestAndResponse({
            mockWriteHeadFn: writeHeadMock,
        });

        await deleteSocialMediaPost(req, res);

        expect(dynamo.removeSocialMediaPostFromDisruption).not.toBeCalled();
        expect(writeHeadMock).toBeCalledWith(302, { Location: ERROR_PATH });
    });

    it("should delete consequence data in dynamoDB"),
        async () => {
            const { req, res } = getMockRequestAndResponse({
                body: {
                    id: defaultSocialMediaPostId,
                    disruptionId: defaultDisruptionId,
                },
                mockWriteHeadFn: writeHeadMock,
            });

            await deleteSocialMediaPost(req, res);

            expect(deleteConsequenceSpy.mock.calls[0][0]).toMatchSnapshot();
        };
});
