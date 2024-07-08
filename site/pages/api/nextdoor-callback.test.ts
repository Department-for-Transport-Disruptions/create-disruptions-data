import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ERROR_PATH, SOCIAL_MEDIA_ACCOUNTS_PAGE_PATH } from "../../constants";
import { addNextdoorAccount } from "../../data/nextdoor";
import { getMockRequestAndResponse, mockSession } from "../../testData/mockData";
import * as session from "../../utils/apiUtils/auth";
import nextdoorCallback from "./nextdoor-callback.api";

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

    it("should add nextdoor account and redirect to social media page if everything valid", async () => {
        const { req, res } = getMockRequestAndResponse({
            query: {
                code: "123456",
            },
            cookieValues: {},
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
});
