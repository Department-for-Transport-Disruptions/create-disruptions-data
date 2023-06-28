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
import { Session } from "../../../schemas/session.schema";
import { DEFAULT_ORG_ID, getMockRequestAndResponse } from "../../../testData/mockData";
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

    const defaultSession: Session = {
        email: "test@example.com",
        isOrgAdmin: false,
        isOrgPublisher: false,
        isOrgStaff: false,
        isSystemAdmin: true,
        orgId: DEFAULT_ORG_ID,
        username: "2f99b92e-a86f-4457-a2dc-923db4781c52",
        name: "Test User",
    };

    beforeEach(() => {
        getSession.mockImplementation(() => defaultSession);
    });

    it("should redirect to /admin/user-management if delete was a success", async () => {
        deleteAdminUserSpy.mockImplementation(() =>
            Promise.resolve({
                body: {},
                $metadata: { httpStatusCode: 302 },
            }),
        );

        getUserDetailsSpy.mockImplementation(() =>
            Promise.resolve({
                body: {},
                $metadata: { httpStatusCode: 302 },
                Username: "2f99b92e-a86f-4457-a2dc-923db4781c53",
                UserAttributes: [
                    {
                        Name: "custom:orgId",
                        Value: DEFAULT_ORG_ID,
                    },
                ],
            }),
        );

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
        deleteAdminUserSpy.mockImplementation(() =>
            Promise.resolve({
                body: {},
                $metadata: { httpStatusCode: 302 },
            }),
        );

        getUserDetailsSpy.mockImplementation(() =>
            Promise.resolve({
                body: {},
                $metadata: { httpStatusCode: 302 },
                Username: "2f99b92e-a86f-4457-a2dc-923db4781c53",
                UserAttributes: [
                    {
                        Name: "custom:orgId",
                        Value: DEFAULT_ORG_ID,
                    },
                ],
            }),
        );

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

    it("should redirect to /500 if organisation ids do not match", async () => {
        getUserDetailsSpy.mockImplementation(() =>
            Promise.resolve({
                body: {},
                $metadata: { httpStatusCode: 302 },
                Username: "2f99b92e-a86f-4457-a2dc-923db4781c53",
                UserAttributes: [
                    {
                        Name: "custom:orgId",
                        Value: "1234",
                    },
                ],
            }),
        );

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

        getUserDetailsSpy.mockImplementation(() =>
            Promise.resolve({
                body: {},
                $metadata: { httpStatusCode: 400 },
                Username: "",
                UserAttributes: [],
            }),
        );

        const { req, res } = getMockRequestAndResponse({
            body: {},
            mockWriteHeadFn: writeHeadMock,
        });

        await deleteUser(req, res);

        expect(writeHeadMock).toBeCalledWith(302, { Location: ERROR_PATH });
    });

    it("should redirect to /login if delete was a success and the user deletes themselves", async () => {
        getSession.mockImplementation(() => ({ ...defaultSession, username: "2f99b92e-a86f-4457-a2dc-923db4781c53" }));
        deleteAdminUserSpy.mockImplementation(() =>
            Promise.resolve({
                body: {},
                $metadata: { httpStatusCode: 302 },
            }),
        );

        getUserDetailsSpy.mockImplementation(() =>
            Promise.resolve({
                body: {},
                $metadata: { httpStatusCode: 302 },
                Username: "2f99b92e-a86f-4457-a2dc-923db4781c53",
                UserAttributes: [
                    {
                        Name: "custom:orgId",
                        Value: DEFAULT_ORG_ID,
                    },
                ],
            }),
        );

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
