/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment  */
import { Consequence } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { PublishStatus, Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { formatCreateConsequenceStopsBody } from "./create-consequence-stops.api";
import createTemplateConsequenceStops from "./create-template-consequence-stops.api";
import {
    COOKIES_CONSEQUENCE_STOPS_ERRORS,
    CREATE_TEMPLATE_CONSEQUENCE_STOPS_PATH,
    DASHBOARD_PAGE_PATH,
    REVIEW_TEMPLATE_PAGE_PATH,
    TYPE_OF_CONSEQUENCE_TEMPLATE_PAGE_PATH,
} from "../../constants";
import * as dynamo from "../../data/dynamo";
import { ErrorInfo } from "../../interfaces";
import { FullDisruption } from "../../schemas/disruption.schema";
import {
    DEFAULT_ORG_ID,
    createDisruptionWithConsquences,
    disruptionWithConsequences,
    getMockRequestAndResponse,
    mockSession,
} from "../../testData/mockData";
import { setCookieOnResponseObject } from "../../utils/apiUtils";
import * as session from "../../utils/apiUtils/auth";

const defaultDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";
const defaultConsequenceIndex = "0";

const defaultStopsData = {
    stop1: JSON.stringify({
        atcoCode: "0100BRP90310",
        commonName: "Temple Meads Stn",
        id: 1,
        indicator: "T3",
        latitude: "51.44901",
        longitude: "-2.58569",
    }),
    stop2: JSON.stringify({
        atcoCode: "0100BRP90311",
        commonName: "Temple Meads Stn",
        id: 2,
        indicator: "T7",
        latitude: "51.45014",
        longitude: "-2.5856",
    }),

    description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    removeFromJourneyPlanners: "no",
    disruptionDelay: "45",
    disruptionSeverity: Severity.severe,
    vehicleMode: VehicleMode.bus,
    consequenceType: "stops",
    consequenceIndex: defaultConsequenceIndex,
    disruptionId: defaultDisruptionId,
};

const disruption: FullDisruption = {
    ...createDisruptionWithConsquences([
        { ...defaultStopsData, consequenceIndex: Number(defaultConsequenceIndex) } as Consequence,
    ]),
    publishStatus: PublishStatus.draft,
};

const stopDataToUpsert = {
    disruptionId: "acde070d-8c4c-4f0d-9d8a-162843c10333",
    description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    removeFromJourneyPlanners: "no",
    disruptionDelay: "45",
    disruptionSeverity: "severe",
    vehicleMode: "bus",
    consequenceIndex: 0,
    consequenceType: "stops",
    stops: [
        {
            atcoCode: "0100BRP90310",
            commonName: "Temple Meads Stn",
            indicator: "T3",
            longitude: -2.58569,
            latitude: 51.44901,
        },
        {
            atcoCode: "0100BRP90311",
            commonName: "Temple Meads Stn",
            indicator: "T7",
            longitude: -2.5856,
            latitude: 51.45014,
        },
    ],
};

describe("create-template-consequence-stops API", () => {
    const writeHeadMock = vi.fn();
    vi.mock("../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
    }));

    const upsertConsequenceSpy = vi.spyOn(dynamo, "upsertConsequence");
    vi.mock("../../data/dynamo", () => ({
        upsertConsequence: vi.fn(),
    }));

    afterEach(() => {
        vi.resetAllMocks();
    });

    const getSessionSpy = vi.spyOn(session, "getSession");

    beforeEach(() => {
        getSessionSpy.mockImplementation(() => {
            return mockSession;
        });
        upsertConsequenceSpy.mockResolvedValue(disruption);
    });

    it("should redirect to /review-template when all required inputs are passed", async () => {
        const { req, res } = getMockRequestAndResponse({ body: defaultStopsData, mockWriteHeadFn: writeHeadMock });

        await createTemplateConsequenceStops(req, res);

        expect(upsertConsequenceSpy).toHaveBeenCalledTimes(1);
        expect(upsertConsequenceSpy).toHaveBeenCalledWith(
            stopDataToUpsert,
            DEFAULT_ORG_ID,
            mockSession.isOrgStaff,
            true,
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${REVIEW_TEMPLATE_PAGE_PATH}/${defaultDisruptionId}`,
        });
    });

    it("should redirect back to /create-template-consequence-stops when no form inputs are passed to the API", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { consequenceIndex: defaultConsequenceIndex, disruptionId: defaultDisruptionId },
            mockWriteHeadFn: writeHeadMock,
        });
        await createTemplateConsequenceStops(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Enter a consequence description", id: "description" },
            { errorMessage: "Select yes or no", id: "removeFromJourneyPlanners" },
            { errorMessage: "Select the severity from the dropdown", id: "disruptionSeverity" },
            { errorMessage: "Select a mode of transport", id: "vehicleMode" },
            { errorMessage: "Select a consequence type", id: "consequenceType" },
            { errorMessage: "At least one stop must be added", id: "stops" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CONSEQUENCE_STOPS_ERRORS,
            JSON.stringify({ inputs: formatCreateConsequenceStopsBody(req.body), errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${CREATE_TEMPLATE_CONSEQUENCE_STOPS_PATH}/${defaultDisruptionId}/${defaultConsequenceIndex}`,
        });
    });

    it("should redirect back to /create-template-consequence-stops when description is too long", async () => {
        const stopsData = {
            ...defaultStopsData,
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        };

        const { req, res } = getMockRequestAndResponse({ body: stopsData, mockWriteHeadFn: writeHeadMock });

        await createTemplateConsequenceStops(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Description must not exceed 1000 characters", id: "description" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CONSEQUENCE_STOPS_ERRORS,
            JSON.stringify({ inputs: formatCreateConsequenceStopsBody(req.body), errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${CREATE_TEMPLATE_CONSEQUENCE_STOPS_PATH}/${defaultDisruptionId}/${defaultConsequenceIndex}`,
        });
    });

    it("should redirect back to /create-template-consequence-stops when invalid time is passed", async () => {
        const stopsData = {
            ...defaultStopsData,
            disruptionDelay: "7280",
        };

        const { req, res } = getMockRequestAndResponse({ body: stopsData, mockWriteHeadFn: writeHeadMock });

        await createTemplateConsequenceStops(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Enter a number between 0 to 999 for disruption delay", id: "disruptionDelay" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CONSEQUENCE_STOPS_ERRORS,
            JSON.stringify({ inputs: formatCreateConsequenceStopsBody(req.body), errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${CREATE_TEMPLATE_CONSEQUENCE_STOPS_PATH}/${defaultDisruptionId}/${defaultConsequenceIndex}`,
        });
    });

    it("should redirect to /dashboard when all required inputs are passed and the disruption is saved as draft", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: defaultStopsData,
            mockWriteHeadFn: writeHeadMock,
            query: { draft: "true" },
        });

        await createTemplateConsequenceStops(req, res);

        expect(upsertConsequenceSpy).toHaveBeenCalledTimes(1);
        expect(upsertConsequenceSpy).toHaveBeenCalledWith(
            stopDataToUpsert,
            DEFAULT_ORG_ID,
            mockSession.isOrgStaff,
            true,
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: DASHBOARD_PAGE_PATH,
        });
    });

    it("should redirect to /type-of-consequence-template when all required inputs are passed and add another consequence is true and a template", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { ...defaultStopsData },
            query: { addAnotherConsequence: "true" },
            mockWriteHeadFn: writeHeadMock,
        });

        await createTemplateConsequenceStops(req, res);

        expect(upsertConsequenceSpy).toHaveBeenCalledTimes(1);
        expect(upsertConsequenceSpy).toHaveBeenCalledWith(
            stopDataToUpsert,
            DEFAULT_ORG_ID,
            mockSession.isOrgStaff,
            true,
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${TYPE_OF_CONSEQUENCE_TEMPLATE_PAGE_PATH}/${defaultDisruptionId}/1`,
        });
    });

    it("should redirect to /type-of-consequence-template when all required inputs are passed, when another consequence is added and when the consequence index is not 0", async () => {
        upsertConsequenceSpy.mockResolvedValue(disruptionWithConsequences);
        const { req, res } = getMockRequestAndResponse({
            body: { ...defaultStopsData, consequenceIndex: "2" },
            query: { addAnotherConsequence: "true" },
            mockWriteHeadFn: writeHeadMock,
        });

        await createTemplateConsequenceStops(req, res);

        expect(upsertConsequenceSpy).toHaveBeenCalledTimes(1);
        expect(upsertConsequenceSpy).toHaveBeenCalledWith(
            { ...stopDataToUpsert, consequenceIndex: 2 },
            DEFAULT_ORG_ID,
            mockSession.isOrgStaff,
            true,
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${TYPE_OF_CONSEQUENCE_TEMPLATE_PAGE_PATH}/${defaultDisruptionId}/3`,
        });
    });
});