/* eslint-disable @typescript-eslint/no-unsafe-assignment  */
import { MiscellaneousReason, PublishStatus, Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import * as crypto from "crypto";
import duplicateDisruption from "./duplicate-disruption.api";
import { ERROR_PATH, REVIEW_DISRUPTION_PAGE_PATH } from "../../constants";
import * as dynamo from "../../data/dynamo";
import { Consequence } from "../../schemas/consequence.schema";
import { createDisruptionsSchemaRefined } from "../../schemas/create-disruption.schema";
import { Disruption } from "../../schemas/disruption.schema";
import { DEFAULT_ORG_ID, getMockRequestAndResponse, mockSession } from "../../testData/mockData";
import * as session from "../../utils/apiUtils/auth";
import { getFutureDateAsString } from "../../utils/dates";

const defaultDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";
const newDefaultDisruptionId = "bade070d-8c4c-4f0d-9d8a-162843c10444";

const defaultConsequenceIndex = "0";

const defaultNetworkData: Consequence = {
    description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    removeFromJourneyPlanners: "no",
    disruptionDelay: "",
    disruptionSeverity: Severity.slight,
    vehicleMode: VehicleMode.bus,
    consequenceType: "networkWide",
    consequenceIndex: Number(defaultConsequenceIndex),
    disruptionId: defaultDisruptionId,
};

const defaultDisruptionStartDate = getFutureDateAsString(2);
const defaultPublishStartDate = getFutureDateAsString(1);

const disruption: Disruption = {
    disruptionId: defaultDisruptionId,
    disruptionType: "planned",
    summary: "A test disruption",
    description: "oh no",
    associatedLink: "",
    disruptionReason: MiscellaneousReason.accident,
    publishStartDate: defaultPublishStartDate,
    publishStartTime: "1900",
    disruptionStartDate: defaultDisruptionStartDate,
    disruptionStartTime: "1800",
    disruptionNoEndDateTime: "true",
    disruptionRepeats: "doesntRepeat",
    disruptionRepeatsEndDate: "",
    validity: [],
    publishStatus: PublishStatus.editing,
    consequences: [defaultNetworkData],
};

describe("duplicate-disruption API", () => {
    const writeHeadMock = vi.fn();
    vi.mock("../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
    }));

    vi.mock("crypto", () => ({
        randomUUID: vi.fn(),
    }));

    const upsertConsequenceSpy = vi.spyOn(dynamo, "upsertConsequence");
    const upsertDisruptionInfoSpy = vi.spyOn(dynamo, "upsertDisruptionInfo");
    vi.mock("../../data/dynamo", () => ({
        upsertConsequence: vi.fn(),
        upsertDisruptionInfo: vi.fn(),
        getDisruptionById: vi.fn(),
    }));

    afterEach(() => {
        vi.resetAllMocks();
    });

    const getSessionSpy = vi.spyOn(session, "getSession");

    const getDisruptionByIdSpy = vi.spyOn(dynamo, "getDisruptionById");

    const randomUUIDSpy = vi.spyOn(crypto, "randomUUID");

    beforeEach(() => {
        getSessionSpy.mockImplementation(() => {
            return mockSession;
        });
        randomUUIDSpy.mockImplementation(() => {
            return newDefaultDisruptionId;
        });
    });

    it("should redirect to /review-disruption when all required inputs are passed", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { disruptionId: defaultDisruptionId },
            mockWriteHeadFn: writeHeadMock,
        });

        getDisruptionByIdSpy.mockResolvedValue(disruption);
        await duplicateDisruption(req, res);

        expect(upsertDisruptionInfoSpy).toHaveBeenCalledTimes(1);
        expect(upsertDisruptionInfoSpy).toHaveBeenCalledWith(
            {
                ...createDisruptionsSchemaRefined.parse(disruption),
                disruptionId: newDefaultDisruptionId,
            },
            DEFAULT_ORG_ID,
            mockSession.isOrgStaff,
        );

        expect(upsertConsequenceSpy).toHaveBeenCalledTimes(1);
        expect(upsertConsequenceSpy).toHaveBeenCalledWith(
            { ...defaultNetworkData, disruptionId: newDefaultDisruptionId },
            DEFAULT_ORG_ID,
            mockSession.isOrgStaff,
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${REVIEW_DISRUPTION_PAGE_PATH}/${newDefaultDisruptionId}`,
        });
    });

    it("should redirect to /500 when disruptionId is missing", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {},
            mockWriteHeadFn: writeHeadMock,
        });

        await duplicateDisruption(req, res);

        expect(getDisruptionByIdSpy).not.toHaveBeenCalled();
        expect(upsertDisruptionInfoSpy).not.toHaveBeenCalled();
        expect(upsertConsequenceSpy).not.toHaveBeenCalled();

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: ERROR_PATH,
        });
    });

    it("should redirect to /500 when getDisruptionById does not return a disruption", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { disruptionId: defaultDisruptionId },

            mockWriteHeadFn: writeHeadMock,
        });

        getDisruptionByIdSpy.mockResolvedValue(null);
        await duplicateDisruption(req, res);

        expect(upsertDisruptionInfoSpy).not.toHaveBeenCalled();
        expect(upsertConsequenceSpy).not.toHaveBeenCalled();

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: ERROR_PATH,
        });
    });
});