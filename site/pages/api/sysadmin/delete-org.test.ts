import { afterEach, describe, expect, it, vi } from "vitest";
import { ERROR_PATH, SYSADMIN_MANAGE_ORGANISATIONS_PAGE_PATH } from "../../../constants";
import * as cognito from "../../../data/cognito";
import * as dynamo from "../../../data/dynamo";
import { getMockRequestAndResponse } from "../../../testData/mockData";
import deleteOrg from "./delete-org.api";

describe("delete-org", () => {
    const writeHeadMock = vi.fn();

    const deleteUsersByAttributeSpy = vi.spyOn(cognito, "deleteUsersByAttribute");

    const removeOrganisationSpy = vi.spyOn(dynamo, "removeOrganisation");

    vi.mock("../../../data/cognito", () => ({
        deleteUsersByAttribute: vi.fn(),
    }));

    vi.mock("../../../data/dynamo", () => ({
        removeOrganisation: vi.fn(),
    }));

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should redirect to /sysadmin/manage-organisations if delete was a success", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                org: "2f99b92e-a86f-4457-a2dc-923db4781c52",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await deleteOrg(req, res);

        expect(writeHeadMock).toBeCalledWith(302, { Location: SYSADMIN_MANAGE_ORGANISATIONS_PAGE_PATH });
    });

    it("should redirect to /500 if delete users operation failed", async () => {
        deleteUsersByAttributeSpy.mockImplementation(() => {
            throw new Error("invalid", {
                cause: "Invalid",
            });
        });

        const { req, res } = getMockRequestAndResponse({
            body: {},
            mockWriteHeadFn: writeHeadMock,
        });

        await deleteOrg(req, res);

        expect(writeHeadMock).toBeCalledWith(302, { Location: ERROR_PATH });
    });

    it("should redirect to /500 if delete organisation operation failed", async () => {
        removeOrganisationSpy.mockImplementation(() => {
            throw new Error("invalid", {
                cause: "Invalid",
            });
        });

        const { req, res } = getMockRequestAndResponse({
            body: {},
            mockWriteHeadFn: writeHeadMock,
        });

        await deleteOrg(req, res);

        expect(writeHeadMock).toBeCalledWith(302, { Location: ERROR_PATH });
    });
});
