import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import twitterCallback from "./twitter-callback.api";
import {
    COOKIES_TWITTER_CODE_VERIFIER,
    COOKIES_TWITTER_STATE,
    ERROR_PATH,
    SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH,
} from "../../constants";
import { addTwitterAccount } from "../../data/twitter";
import { getMockRequestAndResponse, mockSession } from "../../testData/mockData";
import * as session from "../../utils/apiUtils/auth";

describe("twitter-callback", () => {
    const writeHeadMock = vi.fn();

    const getSessionSpy = vi.spyOn(session, "getSession");

    vi.mock("../../data/twitter", () => ({
        addTwitterAccount: vi.fn(),
    }));

    beforeEach(() => {
        getSessionSpy.mockReturnValue({
            ...mockSession,
            isOrgAdmin: true,
        });
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should redirect to error if not an org admin", async () => {
        getSessionSpy.mockReturnValue(mockSession);

        const { req, res } = getMockRequestAndResponse({
            query: {
                code: "123456",
                state: "6ab8fd00-4b2d-42a7-beef-8558da21c82d",
            },
            cookieValues: {
                [COOKIES_TWITTER_STATE]: "6ab8fd00-4b2d-42a7-beef-8558da21c82d",
                [COOKIES_TWITTER_CODE_VERIFIER]: "verifier",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await twitterCallback(req, res);

        expect(addTwitterAccount).not.toHaveBeenCalled();

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: ERROR_PATH,
        });
    });

    it("should redirect to error if states do not match", async () => {
        const { req, res } = getMockRequestAndResponse({
            query: {
                code: "123456",
                state: "6ab8fd00-4b2d-42a7-beef-8558da21c82d",
            },
            cookieValues: {
                [COOKIES_TWITTER_STATE]: "invalid state",
                [COOKIES_TWITTER_CODE_VERIFIER]: "verifier",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await twitterCallback(req, res);

        expect(addTwitterAccount).not.toHaveBeenCalled();

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: ERROR_PATH,
        });
    });

    it("should redirect to error if verifier not set", async () => {
        const { req, res } = getMockRequestAndResponse({
            query: {
                code: "123456",
                state: "6ab8fd00-4b2d-42a7-beef-8558da21c82d",
            },
            cookieValues: {
                [COOKIES_TWITTER_STATE]: "invalid state",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await twitterCallback(req, res);

        expect(addTwitterAccount).not.toHaveBeenCalled();

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: ERROR_PATH,
        });
    });

    it("should add twitter account and redirect to social media page if everything valid", async () => {
        const { req, res } = getMockRequestAndResponse({
            query: {
                code: "123456",
                state: "6ab8fd00-4b2d-42a7-beef-8558da21c82d",
            },
            cookieValues: {
                [COOKIES_TWITTER_STATE]: "6ab8fd00-4b2d-42a7-beef-8558da21c82d",
                [COOKIES_TWITTER_CODE_VERIFIER]: "verifier",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await twitterCallback(req, res);

        expect(addTwitterAccount).toHaveBeenCalledWith(
            "123456",
            "verifier",
            "35bae327-4af0-4bbf-8bfa-2c085f214483",
            "Test User",
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH,
        });
    });
});
