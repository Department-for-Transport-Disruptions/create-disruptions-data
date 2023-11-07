import { AttributeType } from "@aws-sdk/client-cognito-identity-provider";
import { UserGroups } from "@create-disruptions-data/shared-ts/enums";
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import editUser from "./edit-user.api";
import {
    COOKIES_EDIT_USER_ERRORS,
    EDIT_USER_PAGE_PATH,
    LOGIN_PAGE_PATH,
    USER_MANAGEMENT_PAGE_PATH,
} from "../../../constants";
import * as cognito from "../../../data/cognito";
import { ErrorInfo } from "../../../interfaces";
import { getMockRequestAndResponse, mockSession } from "../../../testData/mockData";
import {
    destroyCookieOnResponseObject,
    formatAddOrEditUserBody,
    setCookieOnResponseObject,
} from "../../../utils/apiUtils";
import * as session from "../../../utils/apiUtils/auth";

const baseInput = { initialGroup: "org-staff", email: "test@test.com", username: "test-username", group: "org-staff" };
const mockInput = { ...baseInput, givenName: "test", familyName: "test", group: "org-admins" };

describe("editUser", () => {
    const writeHeadMock = vi.fn();
    vi.mock("../../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
    }));

    const getSessionSpy = vi.spyOn(session, "getSession");

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

    beforeEach(() => {
        getSessionSpy.mockImplementation(() => {
            return mockSession;
        });
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

    it("should redirect to /edit-user page when user is added to operator group without selecting an operator org", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { ...mockInput, group: "operators" },
            mockWriteHeadFn: writeHeadMock,
        });

        await editUser(req, res);

        const errors: ErrorInfo[] = [{ errorMessage: "Select at least one operator", id: "operatorOrg" }];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_EDIT_USER_ERRORS,
            JSON.stringify({ inputs: formatAddOrEditUserBody(req.body as object), errors }),
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
            {
                Name: "custom:operatorOrgId",
                Value: "",
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

    it("should redirect to /login page when an admin user changes their own group to something other than admin", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                ...mockInput,
                initialGroup: UserGroups.orgAdmins,
                group: UserGroups.orgStaff,
                username: mockSession.username,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await editUser(req, res);

        expect(removeUserFromGroupSpy).toHaveBeenCalledOnce();
        expect(removeUserFromGroupSpy).toHaveBeenCalledWith(mockSession.username, UserGroups.orgAdmins);

        expect(addUserToGroupSpy).toHaveBeenCalledOnce();
        expect(addUserToGroupSpy).toHaveBeenCalledWith(mockSession.username, UserGroups.orgStaff);

        expect(destroyCookieOnResponseObject).toHaveBeenCalledTimes(2);
        expect(writeHeadMock).toBeCalledWith(302, { Location: LOGIN_PAGE_PATH });
    });

    it("should redirect to /user-management page and add operator org ID to the attributesList when changing to operator user", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                ...mockInput,
                group: "operators",
                operatorOrg:
                    '{"name":"Test Operator","nocCodes":["TEST","TEST"],"operatorOrgId":"61b6aff2-0f93-4f22-b814-94173b9f47e6", "orgId":"61b6aff2-0f93-4f22-b814-94173b9f47e6"}',
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await editUser(req, res);

        const expectedAttributeList: AttributeType[] = [
            {
                Name: "given_name",
                Value: "test",
            },
            {
                Name: "family_name",
                Value: "test",
            },
            {
                Name: "custom:operatorOrgId",
                Value: "61b6aff2-0f93-4f22-b814-94173b9f47e6",
            },
        ];

        expect(removeUserFromGroupSpy).toHaveBeenCalledOnce();
        expect(removeUserFromGroupSpy).toHaveBeenCalledWith(mockInput.username, mockInput.initialGroup);

        expect(addUserToGroupSpy).toHaveBeenCalledOnce();
        expect(addUserToGroupSpy).toHaveBeenCalledWith(mockInput.username, "operators");

        expect(updateUserAttributesSpy).toHaveBeenCalledOnce();
        expect(updateUserAttributesSpy).toHaveBeenCalledWith("test-username", expectedAttributeList);
        expect(destroyCookieOnResponseObject).toHaveBeenCalledOnce();
        expect(writeHeadMock).toBeCalledWith(302, { Location: USER_MANAGEMENT_PAGE_PATH });
    });
});
