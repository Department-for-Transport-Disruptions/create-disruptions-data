/* eslint-disable @typescript-eslint/no-unsafe-argument  */
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import createSocialMediaPost from "./create-social-media-post.api";
import { REVIEW_DISRUPTION_PAGE_PATH } from "../../constants";
import * as dynamo from "../../data/dynamo";
import * as s3 from "../../data/s3";
import { DEFAULT_ORG_ID, DEFAULT_IMAGE_BUCKET_NAME, getMockRequestAndResponse } from "../../testData/mockData";
import * as file from "../../utils/apiUtils/fileUpload";
import { getFutureDateAsString } from "../../utils/dates";

const defaultPublishDate = getFutureDateAsString(1);

const defaultDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";

const previousCreateSocialMediaPostInformation = {
    disruptionId: defaultDisruptionId,
    publishDate: defaultPublishDate,
    publishTime: "1300",
    messageContent: "Test post 12345",
    socialAccount: "Twitter",
    hootsuiteProfile: "Twitter/1234",
    socialMediaPostIndex: "0",
};

describe("create-social-media-post API", () => {
    const env = process.env;
    process.env.IMAGE_BUCKET_NAME = DEFAULT_IMAGE_BUCKET_NAME;
    beforeEach(() => {
        vi.resetModules();
        process.env = { ...env };
    });

    afterEach(() => {
        process.env = env;
    });
    const writeHeadMock = vi.fn();
    vi.mock("../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
    }));

    const upsertSocialMediaPostSpy = vi.spyOn(dynamo, "upsertSocialMediaPost");
    vi.mock("../../data/dynamo", () => ({
        upsertSocialMediaPost: vi.fn(),
    }));

    const formParseSpy = vi.spyOn(file, "formParse");
    vi.mock("../../utils/apiUtils/formUpload", () => ({
        formParse: vi.fn(),
    }));

    const s3Spy = vi.spyOn(s3, "putItem");
    vi.mock("../../utils/apiUtils/formUpload", () => ({
        putItem: vi.fn(),
    }));

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should redirect to /review-disruption when all required inputs are passed", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: previousCreateSocialMediaPostInformation,
            mockWriteHeadFn: writeHeadMock,
        });

        formParseSpy.mockImplementation(() => ({
            fields: previousCreateSocialMediaPostInformation,
            files: {
                image: {
                    size: 0,
                    filepath: "/var/folders/85/5c4z0mfs49n56jgsyk737gf80000gp/T/b925f0ad5b82936c08d6a4200",
                    newFilename: "b925f0ad5b82936c08d6a4200",
                    mimetype: "application/octet-stream",
                    mtime: null,
                    originalFilename: "",
                },
            },
        }));

        await createSocialMediaPost(req, res);

        expect(s3Spy).not.toHaveBeenCalledTimes(1);
        expect(upsertSocialMediaPostSpy).toHaveBeenCalledTimes(1);
        expect(upsertSocialMediaPostSpy).toHaveBeenCalledWith(
            {
                ...previousCreateSocialMediaPostInformation,
                socialMediaPostIndex: 0,
            },
            DEFAULT_ORG_ID,
        );
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${REVIEW_DISRUPTION_PAGE_PATH}/${defaultDisruptionId}`,
        });
    });
});
