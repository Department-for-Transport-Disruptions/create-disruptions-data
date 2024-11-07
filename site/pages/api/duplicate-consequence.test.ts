import { Consequence } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { MiscellaneousReason, PublishStatus, Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DISRUPTION_DETAIL_PAGE_PATH, ERROR_PATH, REVIEW_DISRUPTION_PAGE_PATH } from "../../constants";
import * as db from "../../data/db";
import { FullDisruption } from "../../schemas/disruption.schema";
import { DEFAULT_ORG_ID, getMockRequestAndResponse, mockSession } from "../../testData/mockData";
import * as session from "../../utils/apiUtils/auth";
import { getFutureDateAsString } from "../../utils/dates";
import duplicateConsequence from "./duplicate-consequence.api";

const defaultDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";
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

const disruption: FullDisruption = {
    id: defaultDisruptionId,
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
    displayId: "8fg3ha",
    orgId: DEFAULT_ORG_ID,
    template: false,
};

describe("duplicate-consequence API", () => {
    const writeHeadMock = vi.fn();
    vi.mock("../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
    }));

    const upsertConsequenceSpy = vi.spyOn(db, "upsertConsequence");
    vi.mock("../../data/db", () => ({
        upsertConsequence: vi.fn(),
        getDisruptionById: vi.fn(),
    }));

    afterEach(() => {
        vi.resetAllMocks();
    });

    const getSessionSpy = vi.spyOn(session, "getSession");

    const getDisruptionByIdSpy = vi.spyOn(db, "getDisruptionById");

    beforeEach(() => {
        getSessionSpy.mockImplementation(() => {
            return mockSession;
        });
    });

    it("should redirect to /review-disruption when all required inputs are passed", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { disruptionId: defaultDisruptionId },
            query: { consequenceId: defaultConsequenceIndex, return: REVIEW_DISRUPTION_PAGE_PATH },
            mockWriteHeadFn: writeHeadMock,
        });

        getDisruptionByIdSpy.mockResolvedValue(disruption);
        await duplicateConsequence(req, res);

        expect(upsertConsequenceSpy).toHaveBeenCalledTimes(1);
        expect(upsertConsequenceSpy).toHaveBeenCalledWith(
            {
                description:
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                removeFromJourneyPlanners: "no",
                disruptionDelay: "",
                disruptionSeverity: Severity.slight,
                vehicleMode: VehicleMode.bus,
                consequenceType: "networkWide",
                consequenceIndex: 1,
                disruptionId: defaultDisruptionId,
            },
            DEFAULT_ORG_ID,
            mockSession.name,
            mockSession.isOrgStaff,
            false,
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${REVIEW_DISRUPTION_PAGE_PATH}/${defaultDisruptionId}`,
        });
    });

    it("should redirect to /disruption-detail when all required inputs are passed", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { disruptionId: defaultDisruptionId },
            query: { consequenceId: defaultConsequenceIndex, return: DISRUPTION_DETAIL_PAGE_PATH },
            mockWriteHeadFn: writeHeadMock,
        });

        getDisruptionByIdSpy.mockResolvedValue(disruption);
        await duplicateConsequence(req, res);

        expect(upsertConsequenceSpy).toHaveBeenCalledTimes(1);
        expect(upsertConsequenceSpy).toHaveBeenCalledWith(
            {
                description:
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                removeFromJourneyPlanners: "no",
                disruptionDelay: "",
                disruptionSeverity: Severity.slight,
                vehicleMode: VehicleMode.bus,
                consequenceType: "networkWide",
                consequenceIndex: 1,
                disruptionId: defaultDisruptionId,
            },
            DEFAULT_ORG_ID,
            mockSession.name,
            mockSession.isOrgStaff,
            false,
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${DISRUPTION_DETAIL_PAGE_PATH}/${defaultDisruptionId}`,
        });
    });

    it("should redirect to /500 when disruptionId is missing", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {},
            query: { consequenceId: defaultConsequenceIndex, return: DISRUPTION_DETAIL_PAGE_PATH },
            mockWriteHeadFn: writeHeadMock,
        });

        await duplicateConsequence(req, res);

        expect(getDisruptionByIdSpy).not.toHaveBeenCalled();
        expect(upsertConsequenceSpy).not.toHaveBeenCalled();

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: ERROR_PATH,
        });
    });

    it("should redirect to /500 when consequenceId is missing", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { disruptionId: defaultDisruptionId },
            query: { return: DISRUPTION_DETAIL_PAGE_PATH },
            mockWriteHeadFn: writeHeadMock,
        });

        await duplicateConsequence(req, res);

        expect(getDisruptionByIdSpy).not.toHaveBeenCalled();
        expect(upsertConsequenceSpy).not.toHaveBeenCalled();

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: ERROR_PATH,
        });
    });

    it("should redirect to /500 when return is missing", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { disruptionId: defaultDisruptionId },
            query: { consequenceId: defaultConsequenceIndex },
            mockWriteHeadFn: writeHeadMock,
        });

        await duplicateConsequence(req, res);

        expect(getDisruptionByIdSpy).not.toHaveBeenCalled();
        expect(upsertConsequenceSpy).not.toHaveBeenCalled();

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: ERROR_PATH,
        });
    });

    it("should redirect to /500 when getDisruptionById does not return a disruption", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { disruptionId: defaultDisruptionId },
            query: { consequenceId: defaultConsequenceIndex, return: DISRUPTION_DETAIL_PAGE_PATH },
            mockWriteHeadFn: writeHeadMock,
        });

        getDisruptionByIdSpy.mockResolvedValue(null);
        await duplicateConsequence(req, res);

        expect(upsertConsequenceSpy).not.toHaveBeenCalled();

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: ERROR_PATH,
        });
    });
});
