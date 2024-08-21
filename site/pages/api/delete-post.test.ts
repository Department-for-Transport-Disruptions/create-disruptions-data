import MockDate from "mockdate";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { DISRUPTION_DETAIL_PAGE_PATH, ERROR_PATH, REVIEW_DISRUPTION_PAGE_PATH } from "../../constants/index";
import * as db from "../../data/db";
import { getMockRequestAndResponse } from "../../testData/mockData";
import deletePost from "./delete-post.api";

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

    const deletePostSpy = vi.spyOn(db, "removeSocialMediaPostFromDisruption");

    afterEach(() => {
        vi.resetAllMocks();
    });

    afterAll(() => {
        MockDate.reset();
    });

    it("should redirect to /review-disruption page after updating socialMediaPost when invoked from review disruption page", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                id: defaultSocialMediaPostId,
                disruptionId: defaultDisruptionId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await deletePost(req, res);

        expect(db.removeSocialMediaPostFromDisruption).toBeCalledTimes(1);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${REVIEW_DISRUPTION_PAGE_PATH}/${defaultDisruptionId}`,
        });
    });

    it("should redirect to /disruption-detail page after updating socialMediaPost when invoked from disruption details page", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                id: defaultSocialMediaPostId,
                disruptionId: defaultDisruptionId,
                inEdit: "true",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await deletePost(req, res);

        expect(db.upsertSocialMediaPost).toBeCalledTimes(1);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${DISRUPTION_DETAIL_PAGE_PATH}/${defaultDisruptionId}`,
        });
    });

    it("should redirect to error page if socialMediaPostId not passed", async () => {
        const { req, res } = getMockRequestAndResponse({
            mockWriteHeadFn: writeHeadMock,
        });

        await deletePost(req, res);

        expect(db.removeSocialMediaPostFromDisruption).not.toBeCalled();
        expect(writeHeadMock).toBeCalledWith(302, { Location: ERROR_PATH });
    });

    it("should delete post data in dynamoDB", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                id: defaultSocialMediaPostId,
                disruptionId: defaultDisruptionId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await deletePost(req, res);

        expect(deletePostSpy.mock.calls[0][0]).toMatchSnapshot();
    });
});
