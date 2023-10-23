import { AttributeType } from "@aws-sdk/client-cognito-identity-provider";
import { describe, it, expect, afterEach, vi } from "vitest";
import editUser, { formatEditUserBody } from "./edit-user.api";
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
            JSON.stringify({ inputs: formatEditUserBody(req.body as object), errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: `${EDIT_USER_PAGE_PATH}/test-username` });
    });

    it("should redirect to /edit-user page when user is added to operator group without selecting any NOC codes", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { ...mockInput, group: "operators" },
            mockWriteHeadFn: writeHeadMock,
        });

        await editUser(req, res);

        const errors: ErrorInfo[] = [{ errorMessage: "Select at least one NOC", id: "operatorNocCodes" }];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_EDIT_USER_ERRORS,
            JSON.stringify({ inputs: formatEditUserBody(req.body as object), errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: `${EDIT_USER_PAGE_PATH}/test-username` });
    });

    it("should redirect to /edit-user page when user is added to operator group and more than 5 NOC codes are selected", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                ...mockInput,
                group: "operators",
                operatorNocCodes1: '{"id":203,"nocCode":"TEST","operatorPublicName":"Test Operator"}',
                operatorNocCodes2: '{"id":203,"nocCode":"TEST","operatorPublicName":"Test Operator"}',
                operatorNocCodes3: '{"id":203,"nocCode":"TEST","operatorPublicName":"Test Operator"}',
                operatorNocCodes4: '{"id":203,"nocCode":"TEST","operatorPublicName":"Test Operator"}',
                operatorNocCodes5: '{"id":203,"nocCode":"TEST","operatorPublicName":"Test Operator"}',
                operatorNocCodes6: '{"id":203,"nocCode":"TEST","operatorPublicName":"Test Operator"}',
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await editUser(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Maximum of 5 NOC codes permitted per operator user", id: "operatorNocCodes" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_EDIT_USER_ERRORS,
            JSON.stringify({ inputs: formatEditUserBody(req.body as object), errors }),
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
                Name: "custom:nocCodes",
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
    it("should redirect to /user-management page and add NOC codes to the attributesList when changing to operator user", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                ...mockInput,
                group: "operators",
                operatorNocCodes1: '{"id":203,"nocCode":"TEST","operatorPublicName":"Test Operator"}',
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await editUser(req, res);

        expect(removeUserFromGroupSpy).toHaveBeenCalledOnce();
        expect(removeUserFromGroupSpy).toHaveBeenCalledWith(mockInput.username, mockInput.initialGroup);

        expect(addUserToGroupSpy).toHaveBeenCalledOnce();
        expect(addUserToGroupSpy).toHaveBeenCalledWith(mockInput.username, "operators");

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
                Name: "custom:nocCodes",
                Value: "TEST",
            },
        ];

        expect(updateUserAttributesSpy).toHaveBeenCalledOnce();
        expect(updateUserAttributesSpy).toHaveBeenCalledWith("test-username", expectedAttributeList);
        expect(destroyCookieOnResponseObject).toHaveBeenCalledOnce();
        expect(writeHeadMock).toBeCalledWith(302, { Location: USER_MANAGEMENT_PAGE_PATH });
    });
});
