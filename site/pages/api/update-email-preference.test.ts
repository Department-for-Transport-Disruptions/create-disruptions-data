import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import updateOrg from "./admin/update-org.api";
import updateEmailPreference from "./update-email-preference.api";
import * as cognito from "../../data/cognito";
import { getMockRequestAndResponse, mockSession } from "../../testData/mockData";
import * as session from "../../utils/apiUtils/auth";

describe("update-email-preference", () => {
    const writeHeadMock = vi.fn();

    vi.mock("../../../data/cognito", () => ({
        updateUserCustomAttribute: vi.fn(),
    }));

    const updateUserCustomAttributeSpy = vi.spyOn(cognito, "updateUserCustomAttribute");
    const getSessionSpy = vi.spyOn(session, "getSession");

    beforeEach(() => {
        getSessionSpy.mockImplementation(() => ({ ...mockSession, isOrgAdmin: true, isSystemAdmin: false }));
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should return 200 when email preference successfully updated", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                username: mockSession.username,
                attributeName: "custom:disruptionEmailPref",
                attributeValue: "true",
            },
            mockWriteHeadFn: writeHeadMock,
        });
        await updateEmailPreference(req, res);
        expect(updateUserCustomAttributeSpy).toBeCalledWith("test@example.com", "custom:disruptionEmailPref", "true");
    });

    it("should return an error when invalid inputs are passed when email preference successfully updated", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {},
            mockWriteHeadFn: writeHeadMock,
        });

        await updateOrg(req, res);
        expect(updateUserCustomAttributeSpy).not.toBeCalled();
    });
});
