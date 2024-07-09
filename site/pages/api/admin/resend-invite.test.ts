import { randomUUID } from "crypto";
import { UserGroups } from "@create-disruptions-data/shared-ts/enums";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ERROR_PATH, SYSADMIN_ADD_USERS_PAGE_PATH, USER_MANAGEMENT_PAGE_PATH } from "../../../constants";
import * as cognito from "../../../data/cognito";
import {
    getMockRequestAndResponse,
    mockDeleteAdminUser,
    mockGetUserDetails,
    mockSession,
} from "../../../testData/mockData";
import * as session from "../../../utils/apiUtils/auth";
import resendInvite from "./resend-invite.api";

describe("resend-invite", () => {
    const writeHeadMock = vi.fn();

    const deleteAdminUserSpy = vi.spyOn(cognito, "deleteUser");

    const getUserDetailsSpy = vi.spyOn(cognito, "getUserDetails");

    const createUserSpy = vi.spyOn(cognito, "createUser");

    const getSession = vi.spyOn(session, "getSession");

    vi.mock("../../../data/cognito", () => ({
        deleteUser: vi.fn(),
        getUserDetails: vi.fn(),
        createUser: vi.fn(),
    }));

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should redirect to /admin/user-management if resend was a success", async () => {
        deleteAdminUserSpy.mockImplementation(() => mockDeleteAdminUser);
        getUserDetailsSpy.mockImplementation(() => mockGetUserDetails);

        const { req, res } = getMockRequestAndResponse({
            body: {
                username: "2f99b92e-a86f-4457-a2dc-923db4781c52",
                group: UserGroups.systemAdmins,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await resendInvite(req, res);

        expect(createUserSpy).toBeCalled();
        expect(writeHeadMock).toBeCalledWith(302, { Location: USER_MANAGEMENT_PAGE_PATH });
    });

    it("should redirect to /sysadmin/users if resend was a success and request received from add admin users page", async () => {
        deleteAdminUserSpy.mockImplementation(() => mockDeleteAdminUser);
        getUserDetailsSpy.mockImplementation(() => mockGetUserDetails);

        const randomId = randomUUID();
        const { req, res } = getMockRequestAndResponse({
            body: {
                username: "2f99b92e-a86f-4457-a2dc-923db4781c52",
                group: UserGroups.systemAdmins,
                orgId: randomId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await resendInvite(req, res);

        expect(createUserSpy).toBeCalled();
        expect(writeHeadMock).toBeCalledWith(302, { Location: `${SYSADMIN_ADD_USERS_PAGE_PATH}?orgId=${randomId}` });
    });

    it("should redirect to /500 if org admin is trying to resend an invite and account and organisation ids do not match", async () => {
        getSession.mockImplementation(() => ({
            ...mockSession,
            isOrgAdmin: true,
            isSystemAdmin: false,
            orgId: "1234",
        }));
        getUserDetailsSpy.mockImplementation(() => mockGetUserDetails);

        const { req, res } = getMockRequestAndResponse({
            body: {
                username: "2f99b92e-a86f-4457-a2dc-923db4781c52",
                group: UserGroups.orgAdmins,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await resendInvite(req, res);

        expect(deleteAdminUserSpy).not.toBeCalled();
        expect(createUserSpy).not.toBeCalled();
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

        await resendInvite(req, res);

        expect(writeHeadMock).toBeCalledWith(302, { Location: ERROR_PATH });
    });
});
