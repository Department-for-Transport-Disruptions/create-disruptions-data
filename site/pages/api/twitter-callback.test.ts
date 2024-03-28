import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import twitterCallback from "./twitter-callback.api";
import {
    COOKIES_TWITTER_OAUTH_SECRET,
    COOKIES_TWITTER_OAUTH_TOKEN,
    ERROR_PATH,
    SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH,
} from "../../constants";
import * as dynamo from "../../data/dynamo";
import { DEFAULT_OPERATOR_ORG_ID, getMockRequestAndResponse, mockSession } from "../../testData/mockData";
import * as session from "../../utils/apiUtils/auth";

describe("twitter-callback", () => {
    const writeHeadMock = vi.fn();

    const getSessionSpy = vi.spyOn(session, "getSession");
    const addSocialAccountToOrgSpy = vi.spyOn(dynamo, "addSocialAccountToOrg");

    vi.mock("../../data/twitter", () => ({
        addTwitterAccount: vi.fn(),
        getTwitterSsmAccessTokenKey: vi.fn(),
        getTwitterSsmAccessSecretKey: vi.fn(),
        getTwitterClient: () => ({
            login: () => ({
                client: {
                    v2: {
                        me: () => ({
                            data: {
                                id: "Test ID",
                                name: "Test Name",
                            },
                        }),
                    },
                },
                accessToken: "",
                accessSecret: "",
            }),
        }),
    }));

    vi.mock("../../data/dynamo", () => ({
        addSocialAccountToOrg: vi.fn(),
    }));

    vi.mock("@create-disruptions-data/shared-ts/utils/ssm", () => ({
        putParameter: vi.fn(),
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
                oauth_token: "token",
                oauth_verifier: "verifier",
            },
            cookieValues: {
                [COOKIES_TWITTER_OAUTH_TOKEN]: "token",
                [COOKIES_TWITTER_OAUTH_SECRET]: "secret",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await twitterCallback(req, res);

        expect(addSocialAccountToOrgSpy).not.toHaveBeenCalled();

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: ERROR_PATH,
        });
    });

    it("should redirect to error if oauth secret not set", async () => {
        const { req, res } = getMockRequestAndResponse({
            query: {
                oauth_token: "token",
                oauth_verifier: "verifier",
            },
            cookieValues: {
                [COOKIES_TWITTER_OAUTH_TOKEN]: "token",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await twitterCallback(req, res);

        expect(addSocialAccountToOrgSpy).not.toHaveBeenCalled();

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: ERROR_PATH,
        });
    });

    it("should add twitter account and redirect to social media page if everything valid", async () => {
        const { req, res } = getMockRequestAndResponse({
            query: {
                oauth_token: "token",
                oauth_verifier: "verifier",
            },
            cookieValues: {
                [COOKIES_TWITTER_OAUTH_TOKEN]: "token",
                [COOKIES_TWITTER_OAUTH_SECRET]: "secret",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await twitterCallback(req, res);

        expect(addSocialAccountToOrgSpy).toHaveBeenCalledWith(
            "35bae327-4af0-4bbf-8bfa-2c085f214483",
            "Test ID",
            "Test Name",
            "Test User",
            "Twitter",
            null,
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH,
        });
    });

    it("should add twitter account and redirect to social media page if everything valid for operator", async () => {
        getSessionSpy.mockReturnValue({
            ...mockSession,
            operatorOrgId: DEFAULT_OPERATOR_ORG_ID,
            isOperatorUser: true,
            isSystemAdmin: false,
        });
        const { req, res } = getMockRequestAndResponse({
            query: {
                oauth_token: "token",
                oauth_verifier: "verifier",
            },
            cookieValues: {
                [COOKIES_TWITTER_OAUTH_TOKEN]: "token",
                [COOKIES_TWITTER_OAUTH_SECRET]: "secret",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await twitterCallback(req, res);

        expect(addSocialAccountToOrgSpy).toHaveBeenCalledWith(
            "35bae327-4af0-4bbf-8bfa-2c085f214483",
            "Test ID",
            "Test Name",
            "Test User",
            "Twitter",
            DEFAULT_OPERATOR_ORG_ID,
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH,
        });
    });
});
