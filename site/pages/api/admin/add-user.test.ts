import { UsernameExistsException } from "@aws-sdk/client-cognito-identity-provider";
import { UserGroups } from "@create-disruptions-data/shared-ts/enums";
import { describe, it, expect, afterEach, vi } from "vitest";
import { randomUUID } from "crypto";
import addUser from "./add-user.api";
import { ADD_USER_PAGE_PATH, COOKIES_ADD_USER_ERRORS, USER_MANAGEMENT_PAGE_PATH } from "../../../constants";
import * as cognito from "../../../data/cognito";
import { ErrorInfo } from "../../../interfaces";
import { AddUserSchema } from "../../../schemas/add-user.schema";
import { getMockRequestAndResponse } from "../../../testData/mockData";
import { destroyCookieOnResponseObject, setCookieOnResponseObject } from "../../../utils/apiUtils";

describe("addUser", () => {
    const writeHeadMock = vi.fn();
    vi.mock("../../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
    }));

    const createUserSpy = vi.spyOn(cognito, "createUser");
    const createUserWithCustomAttributeSpy = vi.spyOn(cognito, "createUserWithCustomAttribute");

    vi.mock("../../../data/cognito", () => ({
        createUser: vi.fn(),
        createUserWithCustomAttribute: vi.fn(),
    }));

    afterEach(() => {
        vi.resetAllMocks();
    });

    const defaultInput: Omit<AddUserSchema, "operatorNocInfo"> = {
        givenName: "dummy",
        familyName: "user",
        email: "dummy.user@gmail.com",
        orgId: randomUUID(),
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
            JSON.stringify({ inputs: req.body as object, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: ADD_USER_PAGE_PATH });
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
            JSON.stringify({ inputs: req.body as object, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: ADD_USER_PAGE_PATH });
    });

    it("should redirect to /add-user page with appropriate error when an operator user is created without NOC codes", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { ...defaultInput, group: UserGroups.operators },
            mockWriteHeadFn: writeHeadMock,
        });

        await addUser(req, res);

        const errors: ErrorInfo[] = [{ errorMessage: "Select at least one NOC", id: "operatorNocInfo" }];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_ADD_USER_ERRORS,
            JSON.stringify({ inputs: req.body as object, errors }),
            res,
        );

        expect(writeHeadMock).toBeCalledWith(302, { Location: ADD_USER_PAGE_PATH });
    });

    it("should redirect to /user-management page when valid inputs are passed", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: defaultInput,
            mockWriteHeadFn: writeHeadMock,
        });

        await addUser(req, res);

        expect(destroyCookieOnResponseObject).toHaveBeenCalledTimes(1);

        expect(writeHeadMock).toBeCalledWith(302, { Location: USER_MANAGEMENT_PAGE_PATH });
    });

    it("should redirect to /user-management page when valid operator user inputs are passed", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                ...defaultInput,
                group: UserGroups.operators,
                operatorNocInfo: '{"id":203,"nocCode":"TEST","operatorPublicName":"Test Operator"}',
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await addUser(req, res);

        expect(destroyCookieOnResponseObject).toHaveBeenCalledTimes(1);

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
            JSON.stringify({ inputs: req.body as object, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: ADD_USER_PAGE_PATH });
    });
    it("should redirect to /add-user page with appropriate errors when creating an operator user with an email id that is already registered", async () => {
        createUserWithCustomAttributeSpy.mockImplementation(() => {
            throw new UsernameExistsException({ message: "Username already exists", $metadata: {} });
        });

        const { req, res } = getMockRequestAndResponse({
            body: {
                ...defaultInput,
                group: UserGroups.operators,
                operatorNocInfo: '{"id":203,"nocCode":"TEST","operatorPublicName":"Test Operator"}',
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await addUser(req, res);

        const errors: ErrorInfo[] = [{ errorMessage: "This email address is already in use", id: "email" }];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_ADD_USER_ERRORS,
            JSON.stringify({ inputs: req.body as object, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: ADD_USER_PAGE_PATH });
    });
});
