import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import nextdoorCallback from "./nextdoor-callback.api";
import { COOKIES_HOOTSUITE_STATE, ERROR_PATH, SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH } from "../../constants";
import { addNextdoorAccount } from "../../data/nextdoor";
import { DEFAULT_OPERATOR_ORG_ID, getMockRequestAndResponse, mockSession } from "../../testData/mockData";
import * as session from "../../utils/apiUtils/auth";

describe("nextdoor-callback", () => {
    const writeHeadMock = vi.fn();

    const getSessionSpy = vi.spyOn(session, "getSession");

    vi.mock("../../data/nextdoor", () => ({
        addNextdoorAccount: vi.fn(),
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
            },

            mockWriteHeadFn: writeHeadMock,
        });

        await nextdoorCallback(req, res);

        expect(addNextdoorAccount).not.toHaveBeenCalled();

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: ERROR_PATH,
        });
    });

    it("should redirect to social media accounts page if code not returned", async () => {
        const { req, res } = getMockRequestAndResponse({
            query: {},
            mockWriteHeadFn: writeHeadMock,
        });

        await nextdoorCallback(req, res);

        expect(addNextdoorAccount).not.toHaveBeenCalled();

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH,
        });
    });

    it("should add hootsuite account and redirect to social media page if everything valid", async () => {
        const { req, res } = getMockRequestAndResponse({
            query: {
                code: "123456",
                state: "6ab8fd00-4b2d-42a7-beef-8558da21c82d",
            },
            cookieValues: {
                [COOKIES_HOOTSUITE_STATE]: "6ab8fd00-4b2d-42a7-beef-8558da21c82d",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await nextdoorCallback(req, res);

        expect(addNextdoorAccount).toHaveBeenCalledWith(
            "123456",
            "35bae327-4af0-4bbf-8bfa-2c085f214483",
            "Test User",
            null,
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH,
        });
    });

    it("should add nexdoor account and redirect to social media page if everything valid for operator", async () => {
        getSessionSpy.mockReturnValue({
            ...mockSession,
            operatorOrgId: DEFAULT_OPERATOR_ORG_ID,
            isOperatorUser: true,
            isSystemAdmin: false,
        });
        const { req, res } = getMockRequestAndResponse({
            query: {
                code: "123456",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await nextdoorCallback(req, res);

        expect(addNextdoorAccount).toHaveBeenCalledWith(
            "123456",
            "35bae327-4af0-4bbf-8bfa-2c085f214483",
            "Test User",
            DEFAULT_OPERATOR_ORG_ID,
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH,
        });
    });
});