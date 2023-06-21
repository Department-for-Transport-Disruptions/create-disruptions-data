import { describe, it, expect, afterEach, vi } from "vitest";
import { randomUUID } from "crypto";
import manageOrg from "./org.api";
import {
    COOKIES_ADD_ORG_ERRORS,
    SYSADMIN_ADD_ORG_PAGE_PATH,
    SYSADMIN_MANAGE_ORGANISATIONS_PAGE_PATH,
} from "../../../constants";
import { ErrorInfo } from "../../../interfaces";
import { getMockRequestAndResponse } from "../../../testData/mockData";
import { destroyCookieOnResponseObject, setCookieOnResponseObject } from "../../../utils/apiUtils";

describe("manageOrg", () => {
    const writeHeadMock = vi.fn();
    vi.mock("../../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
    }));

    vi.mock("../../../data/dynamo", () => ({
        upsertOrganisation: vi.fn(),
    }));

    afterEach(() => {
        vi.resetAllMocks();
    });

    const defaultInput = {
        name: "test-org",
        adminAreaCodes: "001,002",
    };

    it("should redirect to /sysadmin/org page when no inputs are passed", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {},
            mockWriteHeadFn: writeHeadMock,
        });

        await manageOrg(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Enter an organisation name", id: "name" },
            { errorMessage: "Required", id: "adminAreaCodes" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_ADD_ORG_ERRORS,
            JSON.stringify({ inputs: req.body as object, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: SYSADMIN_ADD_ORG_PAGE_PATH });
    });

    it("should redirect to /sysadmin/users page without errors when valid inputs are passed", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: defaultInput,
            mockWriteHeadFn: writeHeadMock,
        });

        await manageOrg(req, res);

        expect(destroyCookieOnResponseObject).toHaveBeenCalledTimes(1);

        expect(writeHeadMock).toBeCalledWith(302, { Location: SYSADMIN_MANAGE_ORGANISATIONS_PAGE_PATH });
    });

    it("should redirect to /sysadmin/users page without errors when valid inputs are passed along with orgId", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { ...defaultInput, PK: randomUUID() },
            mockWriteHeadFn: writeHeadMock,
        });

        await manageOrg(req, res);

        expect(destroyCookieOnResponseObject).toHaveBeenCalledTimes(1);

        expect(writeHeadMock).toBeCalledWith(302, { Location: SYSADMIN_MANAGE_ORGANISATIONS_PAGE_PATH });
    });
});
