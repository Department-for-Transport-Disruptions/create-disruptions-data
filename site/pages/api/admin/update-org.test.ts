import { randomUUID } from "crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as dynamo from "../../../data/dynamo";
import { defaultModes } from "../../../schemas/organisation.schema";
import { getMockRequestAndResponse, mockSession } from "../../../testData/mockData";
import * as session from "../../../utils/apiUtils/auth";
import updateOrg from "./update-org.api";

const defaultInput = {
    PK: randomUUID(),
    name: "Nexus",
    adminAreaCodes: ["A", "B", "C"],
    mode: defaultModes,
};

describe("update-org", () => {
    const writeHeadMock = vi.fn();

    vi.mock("../../../data/dynamo", () => ({
        upsertOrganisation: vi.fn(),
    }));

    const upsertOrganisationSpy = vi.spyOn(dynamo, "upsertOrganisation");
    const getSessionSpy = vi.spyOn(session, "getSession");

    beforeEach(() => {
        getSessionSpy.mockImplementation(() => ({ ...mockSession, isOrgAdmin: true, isSystemAdmin: false }));
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should be successful for valid input", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: defaultInput,
            mockWriteHeadFn: writeHeadMock,
        });

        await updateOrg(req, res);
        expect(upsertOrganisationSpy).toBeCalled();
    });

    it("should be return error when Primary key is not passed", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { ...defaultInput, PK: "" },
            mockWriteHeadFn: writeHeadMock,
        });

        await updateOrg(req, res);
        expect(upsertOrganisationSpy).not.toBeCalled();
    });

    it("should be return error when invalid inputs are passed", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {},
            mockWriteHeadFn: writeHeadMock,
        });

        await updateOrg(req, res);
        expect(upsertOrganisationSpy).not.toBeCalled();
    });
});
