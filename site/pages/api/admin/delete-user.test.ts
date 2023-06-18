import { describe, it, expect, afterEach, vi } from "vitest";
import deleteUser from "./delete-user.api";
import { ERROR_PATH, SYSADMIN_ADD_USERS_PAGE_PATH, USER_MANAGEMENT_PAGE_PATH } from "../../../constants";
import * as cognito from "../../../data/cognito";
import { DEFAULT_ORG_ID, getMockRequestAndResponse } from "../../../testData/mockData";
import { randomUUID } from "crypto";

describe("delete-user", () => {
    const writeHeadMock = vi.fn();

    const deleteAdminUserSpy = vi.spyOn(cognito, "deleteUser");

    const getUserDetailsSpy = vi.spyOn(cognito, "getUserDetails");

    vi.mock("../../../data/cognito", () => ({
        deleteUser: vi.fn(),
        getUserDetails: vi.fn(),
    }));

    afterEach(() => {
        vi.resetAllMocks();
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
                Username: "2f99b92e-a86f-4457-a2dc-923db4781c52",
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
                username: "2f99b92e-a86f-4457-a2dc-923db4781c52",
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
                Username: "2f99b92e-a86f-4457-a2dc-923db4781c52",
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
                username: "2f99b92e-a86f-4457-a2dc-923db4781c52",
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
                Username: "2f99b92e-a86f-4457-a2dc-923db4781c52",
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
                username: "2f99b92e-a86f-4457-a2dc-923db4781c52",
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
});
