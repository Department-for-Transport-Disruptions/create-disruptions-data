import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { randomUUID } from "crypto";
import deleteUser from "./delete-user.api";
import {
    ERROR_PATH,
    LOGIN_PAGE_PATH,
    SYSADMIN_ADD_USERS_PAGE_PATH,
    USER_MANAGEMENT_PAGE_PATH,
} from "../../../constants";
import * as cognito from "../../../data/cognito";
import {
    getMockRequestAndResponse,
    mockDeleteAdminUser,
    mockGetUserDetails,
    mockSession,
} from "../../../testData/mockData";
import { destroyCookieOnResponseObject } from "../../../utils/apiUtils";
import * as session from "../../../utils/apiUtils/auth";

describe("delete-user", () => {
    const writeHeadMock = vi.fn();

    const deleteAdminUserSpy = vi.spyOn(cognito, "deleteUser");

    const getUserDetailsSpy = vi.spyOn(cognito, "getUserDetails");

    const getSession = vi.spyOn(session, "getSession");

    vi.mock("../../../data/cognito", () => ({
        deleteUser: vi.fn(),
        getUserDetails: vi.fn(),
    }));

    vi.mock("../../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
    }));

    vi.mock("../../../utils/apiUtils/auth", async () => ({
        ...(await vi.importActual<object>("../../../utils/apiUtils/auth")),
        getSession: vi.fn(),
    }));

    afterEach(() => {
        vi.resetAllMocks();
    });

    beforeEach(() => {
        getSession.mockImplementation(() => mockSession);
    });

    it("should redirect to /admin/user-management if delete was a success", async () => {
        deleteAdminUserSpy.mockImplementation(() => mockDeleteAdminUser);
        getUserDetailsSpy.mockImplementation(() => mockGetUserDetails);

        const { req, res } = getMockRequestAndResponse({
            body: {
                username: "2f99b92e-a86f-4457-a2dc-923db4781c53",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await deleteUser(req, res);

        expect(writeHeadMock).toBeCalledWith(302, { Location: USER_MANAGEMENT_PAGE_PATH });
    });

    it("should redirect to /sysadmin/users if delete was a success and request received from add admin users page", async () => {
        deleteAdminUserSpy.mockImplementation(() => mockDeleteAdminUser);
        getUserDetailsSpy.mockImplementation(() => mockGetUserDetails);

        const randomId = randomUUID();
        const { req, res } = getMockRequestAndResponse({
            body: {
                username: "2f99b92e-a86f-4457-a2dc-923db4781c53",
                orgId: randomId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await deleteUser(req, res);

        expect(writeHeadMock).toBeCalledWith(302, { Location: `${SYSADMIN_ADD_USERS_PAGE_PATH}?orgId=${randomId}` });
    });

    it("should redirect to /500 if org admin is trying to delete and account and organisation ids do not match", async () => {
        getSession.mockImplementation(() => ({
            ...mockSession,
            isOrgAdmin: true,
            isSystemAdmin: false,
            orgId: "1234",
        }));
        getUserDetailsSpy.mockImplementation(() => mockGetUserDetails);

        const { req, res } = getMockRequestAndResponse({
            body: {
                username: "2f99b92e-a86f-4457-a2dc-923db4781c53",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await deleteUser(req, res);

        expect(deleteAdminUserSpy).not.toBeCalled();
        expect(writeHeadMock).toBeCalledWith(302, { Location: ERROR_PATH });
    });

    it("should redirect to /500 if a non-admin account is trying to delete an account", async () => {
        getSession.mockImplementation(() => ({
            ...mockSession,
            isOrgAdmin: false,
            isSystemAdmin: false,
            orgId: "1234",
        }));
        getUserDetailsSpy.mockImplementation(() => mockGetUserDetails);

        const { req, res } = getMockRequestAndResponse({
            body: {
                username: "2f99b92e-a86f-4457-a2dc-923db4781c53",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await deleteUser(req, res);

        expect(deleteAdminUserSpy).not.toBeCalled();
        expect(writeHeadMock).toBeCalledWith(302, { Location: ERROR_PATH });
    });

    it("should redirect to /500 if delete operation failed", async () => {
        deleteAdminUserSpy.mockImplementation(() => {
            throw new Error("invalid", {
                cause: "Invalid",
            });
        });

        getUserDetailsSpy.mockImplementation(() => mockGetUserDetails);

        const { req, res } = getMockRequestAndResponse({
            body: {},
            mockWriteHeadFn: writeHeadMock,
        });

        await deleteUser(req, res);

        expect(writeHeadMock).toBeCalledWith(302, { Location: ERROR_PATH });
    });

    it("should redirect to /login if delete was a success and the user deletes themselves", async () => {
        getSession.mockImplementation(() => ({ ...mockSession, username: "2f99b92e-a86f-4457-a2dc-923db4781c53" }));
        deleteAdminUserSpy.mockImplementation(() => mockDeleteAdminUser);
        getUserDetailsSpy.mockImplementation(() => mockGetUserDetails);

        const randomId = randomUUID();
        const { req, res } = getMockRequestAndResponse({
            body: {
                username: "2f99b92e-a86f-4457-a2dc-923db4781c53",
                orgId: randomId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await deleteUser(req, res);

        expect(destroyCookieOnResponseObject).toHaveBeenCalledTimes(2);

        expect(writeHeadMock).toBeCalledWith(302, { Location: LOGIN_PAGE_PATH });
    });
});
