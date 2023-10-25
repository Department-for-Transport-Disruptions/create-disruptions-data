/* eslint-disable @typescript-eslint/no-unsafe-argument  */
import formidable from "formidable";
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import * as fs from "fs/promises";
import createSocialMediaPost from "./create-social-media-post.api";
import {
    COOKIES_SOCIAL_MEDIA_ERRORS,
    CREATE_SOCIAL_MEDIA_POST_PAGE_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
} from "../../constants";
import * as dynamo from "../../data/dynamo";
import * as s3 from "../../data/s3";
import { ErrorInfo } from "../../interfaces";
import {
    DEFAULT_ORG_ID,
    DEFAULT_IMAGE_BUCKET_NAME,
    getMockRequestAndResponse,
    disruptionWithConsequencesAndSocialMediaPosts,
} from "../../testData/mockData";
import { setCookieOnResponseObject } from "../../utils/apiUtils";
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
    status: "Pending",
    accountType: "Hootsuite",
    display: "Test Account",
};

describe("create-social-media-post API", () => {
    const env = process.env;
    process.env.IMAGE_BUCKET_NAME = DEFAULT_IMAGE_BUCKET_NAME;

    const upsertSocialMediaPostSpy = vi.spyOn(dynamo, "upsertSocialMediaPost");
    const getOrgSocialAccountSpy = vi.spyOn(dynamo, "getOrgSocialAccount");

    beforeEach(() => {
        vi.resetModules();
        process.env = { ...env };

        getOrgSocialAccountSpy.mockResolvedValue({
            accountType: "Hootsuite",
            addedBy: "Test User",
            display: "Test Account",
            id: "12345",
        });

        upsertSocialMediaPostSpy.mockResolvedValue(disruptionWithConsequencesAndSocialMediaPosts);
    });

    afterEach(() => {
        vi.resetAllMocks();
        process.env = env;
    });

    const writeHeadMock = vi.fn();

    vi.mock("../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
    }));

    vi.mock("../../data/dynamo", () => ({
        upsertSocialMediaPost: vi.fn(),
        getOrgSocialAccount: vi.fn(),
    }));

    const formParseSpy = vi.spyOn(file, "formParse");
    vi.mock("../../utils/apiUtils/formUpload", () => ({
        formParse: vi.fn(),
    }));

    const s3Spy = vi.spyOn(s3, "putItem");
    vi.mock("../../data/s3", () => ({
        putItem: vi.fn(),
    }));

    const readFileSpy = vi.spyOn(fs, "readFile");
    vi.mock("fs/promises", () => ({
        readFile: vi.fn(),
    }));

    it("should redirect to /review-disruption when all required inputs are passed", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { ...previousCreateSocialMediaPostInformation },
            mockWriteHeadFn: writeHeadMock,
        });

        formParseSpy.mockResolvedValue({
            fields: previousCreateSocialMediaPostInformation,
            files: [],
        });

        await createSocialMediaPost(req, res);

        expect(s3Spy).not.toHaveBeenCalledTimes(1);
        expect(upsertSocialMediaPostSpy).toHaveBeenCalledTimes(1);
        expect(upsertSocialMediaPostSpy).toHaveBeenCalledWith(
            {
                ...previousCreateSocialMediaPostInformation,
                socialMediaPostIndex: 0,
            },
            DEFAULT_ORG_ID,
            false,
            false,
        );
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${REVIEW_DISRUPTION_PAGE_PATH}/${defaultDisruptionId}`,
        });
    });

    it("should redirect to /review-disruption when all required inputs are passed and an image", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { ...previousCreateSocialMediaPostInformation },
            mockWriteHeadFn: writeHeadMock,
        });
        formParseSpy.mockResolvedValue({
            fields: previousCreateSocialMediaPostInformation,

            files: [
                {
                    size: 1000,
                    filepath: "/testPath",
                    newFilename: "testFile",
                    mimetype: "image/jpg",
                    mtime: null,
                    originalFilename: "blah.jpg",
                } as formidable.File,
            ],
        });
        const buffer = Buffer.from("testFile", "base64");
        await createSocialMediaPost(req, res);
        readFileSpy.mockResolvedValue(buffer);
        expect(s3Spy).toHaveBeenCalledTimes(1);
        s3Spy.mockResolvedValue();
        expect(upsertSocialMediaPostSpy).toHaveBeenCalledTimes(1);
        expect(upsertSocialMediaPostSpy).toHaveBeenCalledWith(
            {
                ...previousCreateSocialMediaPostInformation,
                socialMediaPostIndex: 0,
                image: {
                    filepath: "/testPath",
                    key: "35bae327-4af0-4bbf-8bfa-2c085f214483/acde070d-8c4c-4f0d-9d8a-162843c10333/0.jpg",
                    mimetype: "image/jpg",
                    originalFilename: "blah.jpg",
                    size: 1000,
                },
            },
            DEFAULT_ORG_ID,
            false,
            false,
        );
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${REVIEW_DISRUPTION_PAGE_PATH}/${defaultDisruptionId}`,
        });
    });

    it("should redirect to /review-disruption when all required inputs are passed and an image is size 0", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { ...previousCreateSocialMediaPostInformation },
            mockWriteHeadFn: writeHeadMock,
        });
        formParseSpy.mockResolvedValue({
            fields: previousCreateSocialMediaPostInformation,

            files: [
                {
                    size: 0,
                    filepath: "/testPath",
                    newFilename: "testFile",
                    mimetype: "application/octet-stream",
                    mtime: null,
                    originalFilename: "",
                } as formidable.File,
            ],
        });
        await createSocialMediaPost(req, res);

        expect(s3Spy).not.toHaveBeenCalledTimes(1);
        expect(upsertSocialMediaPostSpy).toHaveBeenCalledTimes(1);
        expect(upsertSocialMediaPostSpy).toHaveBeenCalledWith(
            {
                ...previousCreateSocialMediaPostInformation,
                socialMediaPostIndex: 0,
            },
            DEFAULT_ORG_ID,
            false,
            false,
        );
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${REVIEW_DISRUPTION_PAGE_PATH}/${defaultDisruptionId}`,
        });
    });

    it("should redirect to /create-social-media-post when the image size is over 5MB", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { ...previousCreateSocialMediaPostInformation },
            mockWriteHeadFn: writeHeadMock,
        });
        formParseSpy.mockResolvedValue({
            fields: previousCreateSocialMediaPostInformation,

            files: [
                {
                    size: 90000000,
                    filepath: "/testPath",
                    newFilename: "testFile",
                    mimetype: "image/jpg",
                    mtime: null,
                    originalFilename: "",
                } as formidable.File,
            ],
        });
        await createSocialMediaPost(req, res);

        expect(s3Spy).not.toHaveBeenCalledTimes(1);
        expect(upsertSocialMediaPostSpy).not.toHaveBeenCalledTimes(1);

        const errors: ErrorInfo[] = [
            { errorMessage: "Max image size is 5MB.", id: "image" },
            { errorMessage: "Re-upload the image", id: "image" },
        ];

        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);

        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_SOCIAL_MEDIA_ERRORS,
            JSON.stringify({ inputs: previousCreateSocialMediaPostInformation, errors }),
            res,
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${CREATE_SOCIAL_MEDIA_POST_PAGE_PATH}/${defaultDisruptionId}/0`,
        });
    });

    it("should redirect to /create-social-media-post when the image is the wrong type", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: previousCreateSocialMediaPostInformation,
            mockWriteHeadFn: writeHeadMock,
        });
        formParseSpy.mockResolvedValue({
            fields: previousCreateSocialMediaPostInformation,

            files: [
                {
                    size: 5000,
                    filepath: "/testPath",
                    newFilename: "testFile",
                    mimetype: "image/webapp",
                    mtime: null,
                    originalFilename: "",
                } as formidable.File,
            ],
        });
        await createSocialMediaPost(req, res);

        expect(s3Spy).not.toHaveBeenCalledTimes(1);
        expect(upsertSocialMediaPostSpy).not.toHaveBeenCalledTimes(1);

        const errors: ErrorInfo[] = [
            { errorMessage: "Only .jpg, .jpeg and .png formats are supported.", id: "image" },
            { errorMessage: "Re-upload the image", id: "image" },
        ];

        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);

        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_SOCIAL_MEDIA_ERRORS,
            JSON.stringify({ inputs: previousCreateSocialMediaPostInformation, errors }),
            res,
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${CREATE_SOCIAL_MEDIA_POST_PAGE_PATH}/${defaultDisruptionId}/0`,
        });
    });

    it("should redirect to /create-social-media-post when publish date is in the past", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { ...previousCreateSocialMediaPostInformation, publishDate: "11/02/2020" },
            mockWriteHeadFn: writeHeadMock,
        });

        formParseSpy.mockResolvedValue({
            fields: { ...previousCreateSocialMediaPostInformation, publishDate: "11/02/2020" },
            files: [],
        });

        await createSocialMediaPost(req, res);

        expect(s3Spy).not.toHaveBeenCalledTimes(1);
        expect(upsertSocialMediaPostSpy).not.toHaveBeenCalledTimes(1);

        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);

        const errors: ErrorInfo[] = [
            { errorMessage: "Publish date/time must be at least 5 minutes into the future.", id: "publishDate" },
        ];

        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_SOCIAL_MEDIA_ERRORS,
            JSON.stringify({
                inputs: { ...previousCreateSocialMediaPostInformation, publishDate: "11/02/2020" },
                errors,
            }),
            res,
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${CREATE_SOCIAL_MEDIA_POST_PAGE_PATH}/${defaultDisruptionId}/0`,
        });
    });
});
