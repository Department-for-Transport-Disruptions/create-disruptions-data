import { Consequence } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { disruptionInfoSchemaRefined } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { MiscellaneousReason, PublishStatus, Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { getDatetimeFromDateAndTime } from "@create-disruptions-data/shared-ts/utils/dates";
import * as cryptoRandomString from "crypto-random-string";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    CREATE_DISRUPTION_PAGE_PATH,
    DISRUPTION_DETAIL_PAGE_PATH,
    ERROR_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
    VIEW_ALL_TEMPLATES_PAGE_PATH,
} from "../../constants";
import * as db from "../../data/db";
import { FullDisruption } from "../../schemas/disruption.schema";
import {
    DEFAULT_OPERATOR_ORG_ID,
    DEFAULT_ORG_ID,
    getMockRequestAndResponse,
    mockSession,
} from "../../testData/mockData";
import * as session from "../../utils/apiUtils/auth";
import { getFutureDateAsString } from "../../utils/dates";
import duplicateDisruption from "./duplicate-disruption.api";

const defaultDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";
const newDefaultDisruptionId: `${string}-${string}-${string}-${string}-${string}` =
    "bade070d-8c4c-4f0d-9d8a-162843c10444";

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
    publishStartTimestamp: getDatetimeFromDateAndTime(defaultPublishStartDate, "1900").toISOString(),
    publishEndTimestamp: null,
    validityStartTimestamp: getDatetimeFromDateAndTime(defaultDisruptionStartDate, "1800").toISOString(),
    validityEndTimestamp: null,
    validity: [],
    publishStatus: PublishStatus.editing,
    consequences: [defaultNetworkData],
    displayId: "8fg3ha",
    orgId: DEFAULT_ORG_ID,
    template: false,
};

describe("duplicate-disruption API", () => {
    const hoisted = vi.hoisted(() => ({
        randomUUIDMock: vi.fn(),
    }));

    const writeHeadMock = vi.fn();
    vi.mock("../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
        getSession: vi.fn(),
    }));

    vi.mock("crypto", () => ({
        default: {
            randomUUID: hoisted.randomUUIDMock,
        },
    }));

    vi.mock("crypto-random-string", () => ({
        default: vi.fn(),
    }));

    const upsertConsequenceSpy = vi.spyOn(db, "upsertConsequence");
    const upsertDisruptionInfoSpy = vi.spyOn(db, "upsertDisruptionInfo");
    vi.mock("../../data/db", () => ({
        upsertConsequence: vi.fn(),
        upsertDisruptionInfo: vi.fn(),
        getDisruptionById: vi.fn(),
    }));

    afterEach(() => {
        vi.resetAllMocks();
    });

    const cryptoRandomStringSpy = vi.spyOn(cryptoRandomString, "default");
    const getSessionSpy = vi.spyOn(session, "getSession");

    const getDisruptionByIdSpy = vi.spyOn(db, "getDisruptionById");

    const returnPath = encodeURIComponent(
        `${DISRUPTION_DETAIL_PAGE_PATH}/${
            defaultDisruptionId as string
        }?template=true&return=${VIEW_ALL_TEMPLATES_PAGE_PATH}`,
    );

    beforeEach(() => {
        getSessionSpy.mockImplementation(() => {
            return mockSession;
        });
        hoisted.randomUUIDMock.mockImplementation(() => {
            return newDefaultDisruptionId;
        });
        cryptoRandomStringSpy.mockImplementation(() => {
            return "9fg4gc";
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
                ...disruptionInfoSchemaRefined.parse(disruption),
                id: newDefaultDisruptionId,
                displayId: "9fg4gc",
            },
            DEFAULT_ORG_ID,
            mockSession.name,
            mockSession.isOrgStaff,
            false,
            null,
        );

        expect(upsertConsequenceSpy).toHaveBeenCalledTimes(1);
        expect(upsertConsequenceSpy).toHaveBeenCalledWith(
            { ...defaultNetworkData, disruptionId: newDefaultDisruptionId },
            DEFAULT_ORG_ID,
            mockSession.name,
            mockSession.isOrgStaff,
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${REVIEW_DISRUPTION_PAGE_PATH}/${newDefaultDisruptionId}?duplicate=true`,
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

    it("should redirect to /create-disruption when new disruption is required from templates", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {},
            query: {
                template: "true",
                templateId: defaultDisruptionId,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        getDisruptionByIdSpy.mockResolvedValue(disruption);
        await duplicateDisruption(req, res);

        expect(upsertDisruptionInfoSpy).toHaveBeenCalledTimes(1);
        expect(upsertDisruptionInfoSpy).toHaveBeenCalledWith(
            {
                ...disruptionInfoSchemaRefined.parse(disruption),
                id: newDefaultDisruptionId,
                displayId: "9fg4gc",
            },
            DEFAULT_ORG_ID,
            mockSession.name,
            mockSession.isOrgStaff,
            true,
            null,
        );

        expect(upsertConsequenceSpy).toHaveBeenCalledTimes(1);
        expect(upsertConsequenceSpy).toHaveBeenCalledWith(
            { ...defaultNetworkData, disruptionId: newDefaultDisruptionId },
            DEFAULT_ORG_ID,
            mockSession.name,
            mockSession.isOrgStaff,
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${CREATE_DISRUPTION_PAGE_PATH}/${newDefaultDisruptionId}?return=${returnPath}`,
        });
    });

    it("should redirect to /review-disruption when an operator duplicated a disruption and all required inputs are passed", async () => {
        getSessionSpy.mockImplementation(() => {
            return { ...mockSession, isOperatorUser: true, operatorOrgId: DEFAULT_OPERATOR_ORG_ID };
        });

        const { req, res } = getMockRequestAndResponse({
            body: { disruptionId: defaultDisruptionId },
            mockWriteHeadFn: writeHeadMock,
        });

        getDisruptionByIdSpy.mockResolvedValue(disruption);
        await duplicateDisruption(req, res);

        expect(upsertDisruptionInfoSpy).toHaveBeenCalledTimes(1);
        expect(upsertDisruptionInfoSpy).toHaveBeenCalledWith(
            {
                ...disruptionInfoSchemaRefined.parse(disruption),
                id: newDefaultDisruptionId,
                displayId: "9fg4gc",
            },
            DEFAULT_ORG_ID,
            mockSession.name,
            mockSession.isOrgStaff,
            false,
            DEFAULT_OPERATOR_ORG_ID,
        );

        expect(upsertConsequenceSpy).toHaveBeenCalledTimes(1);
        expect(upsertConsequenceSpy).toHaveBeenCalledWith(
            { ...defaultNetworkData, disruptionId: newDefaultDisruptionId },
            DEFAULT_ORG_ID,
            mockSession.name,
            mockSession.isOrgStaff,
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${REVIEW_DISRUPTION_PAGE_PATH}/${newDefaultDisruptionId}?duplicate=true`,
        });
    });
});
