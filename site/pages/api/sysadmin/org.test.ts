import { randomUUID } from "crypto";
import { Datasource } from "@create-disruptions-data/shared-ts/enums";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
    COOKIES_ADD_ORG_ERRORS,
    SYSADMIN_ADD_ORG_PAGE_PATH,
    SYSADMIN_MANAGE_ORGANISATIONS_PAGE_PATH,
} from "../../../constants";
import { ErrorInfo } from "../../../interfaces";
import { getMockRequestAndResponse } from "../../../testData/mockData";
import { destroyCookieOnResponseObject, setCookieOnResponseObject } from "../../../utils/apiUtils";
import manageOrg from "./org.api";

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
        mode: JSON.stringify({
            bus: Datasource.bods,
            tram: Datasource.bods,
            ferryService: Datasource.tnds,
            rail: Datasource.tnds,
            underground: Datasource.tnds,
        }),
    };

    it(`should redirect to ${SYSADMIN_ADD_ORG_PAGE_PATH} page when no inputs are passed`, async () => {
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

    it(`should redirect to ${SYSADMIN_MANAGE_ORGANISATIONS_PAGE_PATH} page without errors when valid inputs are passed`, async () => {
        const { req, res } = getMockRequestAndResponse({
            body: defaultInput,
            mockWriteHeadFn: writeHeadMock,
        });

        await manageOrg(req, res);

        expect(destroyCookieOnResponseObject).toHaveBeenCalledTimes(1);

        expect(writeHeadMock).toBeCalledWith(302, { Location: SYSADMIN_MANAGE_ORGANISATIONS_PAGE_PATH });
    });

    it(`should redirect to ${SYSADMIN_MANAGE_ORGANISATIONS_PAGE_PATH} page without errors when valid inputs are passed along with orgId`, async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { ...defaultInput, PK: randomUUID() },
            mockWriteHeadFn: writeHeadMock,
        });

        await manageOrg(req, res);

        expect(destroyCookieOnResponseObject).toHaveBeenCalledTimes(1);

        expect(writeHeadMock).toBeCalledWith(302, { Location: SYSADMIN_MANAGE_ORGANISATIONS_PAGE_PATH });
    });

    it(`should redirect to ${SYSADMIN_MANAGE_ORGANISATIONS_PAGE_PATH} page without errors when mode is an empty string`, async () => {
        const bodyWithEmptyMode = {
            name: "test-org",
            adminAreaCodes: "001,002",
            mode: "",
        };
        const { req, res } = getMockRequestAndResponse({
            body: bodyWithEmptyMode,
            mockWriteHeadFn: writeHeadMock,
        });

        await manageOrg(req, res);

        expect(destroyCookieOnResponseObject).toHaveBeenCalledTimes(1);

        expect(writeHeadMock).toBeCalledWith(302, { Location: SYSADMIN_MANAGE_ORGANISATIONS_PAGE_PATH });
    });
});
