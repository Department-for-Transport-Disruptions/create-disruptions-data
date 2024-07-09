import { UsernameExistsException } from "@aws-sdk/client-cognito-identity-provider";
import { UserGroups } from "@create-disruptions-data/shared-ts/enums";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ADD_USER_PAGE_PATH, COOKIES_ADD_USER_ERRORS, USER_MANAGEMENT_PAGE_PATH } from "../../../constants";
import * as cognito from "../../../data/cognito";
import { ErrorInfo } from "../../../interfaces";
import { DEFAULT_ORG_ID, getMockRequestAndResponse } from "../../../testData/mockData";
import {
    destroyCookieOnResponseObject,
    formatAddOrEditUserBody,
    setCookieOnResponseObject,
} from "../../../utils/apiUtils";
import addUser from "./add-user.api";

describe("addUser", () => {
    const writeHeadMock = vi.fn();
    vi.mock("../../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
    }));

    const createUserSpy = vi.spyOn(cognito, "createUser");

    vi.mock("../../../data/cognito", () => ({
        createUser: vi.fn(),
    }));

    afterEach(() => {
        vi.resetAllMocks();
    });

    const defaultInput = {
        givenName: "dummy",
        familyName: "user",
        email: "dummy.user@gmail.com",
        orgId: DEFAULT_ORG_ID,
        group: UserGroups.orgAdmins,
    };

    it("should redirect to /add-user page when no inputs are passed", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {},
            mockWriteHeadFn: writeHeadMock,
        });

        await addUser(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Enter a first name", id: "givenName" },
            { errorMessage: "Enter a last name", id: "familyName" },
            { errorMessage: "Enter a valid email address", id: "email" },
            { errorMessage: "Select which account is required", id: "group" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_ADD_USER_ERRORS,
            JSON.stringify({ inputs: formatAddOrEditUserBody(req.body as object), errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: ADD_USER_PAGE_PATH });
        expect(createUserSpy).not.toHaveBeenCalled();
    });

    it("should redirect to /add-user page with appropriate errors when invalid email is entered", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { ...defaultInput, email: "invalidemail" },
            mockWriteHeadFn: writeHeadMock,
        });

        await addUser(req, res);

        const errors: ErrorInfo[] = [{ errorMessage: "Enter a valid email address", id: "email" }];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_ADD_USER_ERRORS,
            JSON.stringify({ inputs: formatAddOrEditUserBody(req.body as object), errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: ADD_USER_PAGE_PATH });
        expect(createUserSpy).not.toHaveBeenCalled();
    });

    it("should redirect to /user-management page when valid inputs are passed", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: defaultInput,
            mockWriteHeadFn: writeHeadMock,
        });

        await addUser(req, res);

        expect(destroyCookieOnResponseObject).toHaveBeenCalledTimes(1);

        expect(writeHeadMock).toBeCalledWith(302, { Location: USER_MANAGEMENT_PAGE_PATH });
        expect(createUserSpy).toHaveBeenCalled();
    });

    it("should redirect to /user-management page when valid inputs are passed for an operator user", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                ...defaultInput,
                group: UserGroups.operators,
                operatorOrg:
                    '{"name":"Test Operator","nocCodes":["TEST","TEST"],"operatorOrgId":"61b6aff2-0f93-4f22-b814-94173b9f47e6", "orgId":"61b6aff2-0f93-4f22-b814-94173b9f47e6"}',
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await addUser(req, res);

        expect(destroyCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(createUserSpy).toHaveBeenCalledWith(formatAddOrEditUserBody(req.body as object), [
            {
                Name: "custom:operatorOrgId",
                Value: "61b6aff2-0f93-4f22-b814-94173b9f47e6",
            },
        ]);

        expect(writeHeadMock).toBeCalledWith(302, { Location: USER_MANAGEMENT_PAGE_PATH });
    });

    it("should redirect to /add-user page with appropriate errors when email id that is already registered is passed", async () => {
        createUserSpy.mockImplementation(() => {
            throw new UsernameExistsException({ message: "Username already exists", $metadata: {} });
        });

        const { req, res } = getMockRequestAndResponse({
            body: defaultInput,
            mockWriteHeadFn: writeHeadMock,
        });

        await addUser(req, res);

        const errors: ErrorInfo[] = [{ errorMessage: "This email address is already in use", id: "email" }];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_ADD_USER_ERRORS,
            JSON.stringify({ inputs: formatAddOrEditUserBody(req.body as object), errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: ADD_USER_PAGE_PATH });
    });

    it("should redirect to /add-user page with appropriate errors when creating an operator user and not selecting an operator sub org", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { ...defaultInput, group: UserGroups.operators },
            mockWriteHeadFn: writeHeadMock,
        });

        await addUser(req, res);

        const errors: ErrorInfo[] = [{ errorMessage: "Select an operator", id: "operatorOrg" }];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_ADD_USER_ERRORS,
            JSON.stringify({ inputs: formatAddOrEditUserBody(req.body as object), errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: ADD_USER_PAGE_PATH });
        expect(createUserSpy).not.toHaveBeenCalled();
    });
});
