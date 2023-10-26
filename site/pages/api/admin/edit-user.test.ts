import { AttributeType } from "@aws-sdk/client-cognito-identity-provider";
import { describe, it, expect, afterEach, vi } from "vitest";
import editUser from "./edit-user.api";
import { COOKIES_EDIT_USER_ERRORS, EDIT_USER_PAGE_PATH, USER_MANAGEMENT_PAGE_PATH } from "../../../constants";
import * as cognito from "../../../data/cognito";
import { ErrorInfo } from "../../../interfaces";
import { getMockRequestAndResponse } from "../../../testData/mockData";
import { destroyCookieOnResponseObject, setCookieOnResponseObject } from "../../../utils/apiUtils";

const baseInput = { initialGroup: "org-staff", email: "test@test.com", username: "test-username", group: "org-staff" };
const mockInput = { ...baseInput, givenName: "test", familyName: "test", group: "org-admins" };

describe("editUser", () => {
    const writeHeadMock = vi.fn();
    vi.mock("../../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
    }));

    const updateUserAttributesSpy = vi.spyOn(cognito, "updateUserAttributes");
    const addUserToGroupSpy = vi.spyOn(cognito, "addUserToGroup");
    const removeUserFromGroupSpy = vi.spyOn(cognito, "removeUserFromGroup");

    vi.mock("../../../data/cognito", () => ({
        updateUserAttributes: vi.fn(),
        addUserToGroup: vi.fn(),
        removeUserFromGroup: vi.fn(),
    }));

    afterEach(() => {
        vi.resetAllMocks();
    });
    it("should redirect to /edit-user page when name fields are cleared", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: baseInput,
            mockWriteHeadFn: writeHeadMock,
        });

        await editUser(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Enter a first name", id: "givenName" },
            { errorMessage: "Enter a last name", id: "familyName" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_EDIT_USER_ERRORS,
            JSON.stringify({ inputs: req.body as object, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: `${EDIT_USER_PAGE_PATH}/test-username` });
    });

    it("should redirect to /user-management page and update user attributes when valid inputs passed", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { ...mockInput, group: "org-staff" },
            mockWriteHeadFn: writeHeadMock,
        });

        await editUser(req, res);

        expect(destroyCookieOnResponseObject).toHaveBeenCalledOnce();
        const expectedAttributeList: AttributeType[] = [
            {
                Name: "given_name",
                Value: "test",
            },
            {
                Name: "family_name",
                Value: "test",
            },
        ];

        expect(updateUserAttributesSpy).toHaveBeenCalledOnce();
        expect(updateUserAttributesSpy).toHaveBeenCalledWith("test-username", expectedAttributeList);
        expect(writeHeadMock).toBeCalledWith(302, { Location: USER_MANAGEMENT_PAGE_PATH });
    });
    it("should redirect to /user-management page and remove user group and add to new user group when group is changed", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { ...mockInput },
            mockWriteHeadFn: writeHeadMock,
        });

        await editUser(req, res);

        expect(removeUserFromGroupSpy).toHaveBeenCalledOnce();
        expect(removeUserFromGroupSpy).toHaveBeenCalledWith(mockInput.username, mockInput.initialGroup);

        expect(addUserToGroupSpy).toHaveBeenCalledOnce();
        expect(addUserToGroupSpy).toHaveBeenCalledWith(mockInput.username, mockInput.group);

        expect(destroyCookieOnResponseObject).toHaveBeenCalledOnce();
        expect(writeHeadMock).toBeCalledWith(302, { Location: USER_MANAGEMENT_PAGE_PATH });
    });
});
