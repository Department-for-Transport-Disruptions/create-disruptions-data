import { describe, it, expect, afterEach, vi } from "vitest";
import deleteUser from "./delete-user.api";
import { ERROR_PATH, USER_MANAGEMENT_PAGE_PATH } from "../../constants";
import * as cognito from "../../data/cognito";
import { getMockRequestAndResponse } from "../../testData/mockData";

describe("login", () => {
    const writeHeadMock = vi.fn();

    const deleteAdminUserSpy = vi.spyOn(cognito, "deleteAdminUser");

    vi.mock("../../data/cognito", () => ({
        deleteAdminUser: vi.fn(),
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

        const { req, res } = getMockRequestAndResponse({
            body: {
                username: "2f99b92e-a86f-4457-a2dc-923db4781c52",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await deleteUser(req, res);

        expect(writeHeadMock).toBeCalledWith(302, { Location: USER_MANAGEMENT_PAGE_PATH });
    });

    it("should redirect to /500 if delete operation failed", async () => {
        deleteAdminUserSpy.mockImplementation(() => {
            throw new Error("invalid", {
                cause: "Invalid",
            });
        });

        const { req, res } = getMockRequestAndResponse({
            body: {},
            mockWriteHeadFn: writeHeadMock,
        });

        await deleteUser(req, res);

        expect(writeHeadMock).toBeCalledWith(302, { Location: ERROR_PATH });
    });
});
