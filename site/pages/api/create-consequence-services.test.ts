/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment  */
import { Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { describe, it, expect, afterEach, vi } from "vitest";
import createConsequenceServices, { formatCreateConsequenceStopsServicesBody } from "./create-consequence-services.api";
import {
    COOKIES_CONSEQUENCE_INFO,
    COOKIES_CONSEQUENCE_SERVICES_ERRORS,
    CREATE_CONSEQUENCE_SERVICES_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
} from "../../constants";
import { ErrorInfo } from "../../interfaces";
import { getMockRequestAndResponse } from "../../testData/mockData";
import { setCookieOnResponseObject } from "../../utils/apiUtils";

const defaultServicesData = {
    service1: JSON.stringify({
        id: 23127,
        lineName: "1",
        operatorShortName: "First South Yorkshire",
        origin: "Jordanthorpe",
        destination: "HigH Green",
        nocCode: "TEST",
    }),
    description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    removeFromJourneyPlanners: "no",
    disruptionDelay: "45",
    disruptionSeverity: Severity.severe,
    vehicleMode: VehicleMode.bus,
    consequenceType: "services",
    disruptionDirection: "inbound",
};

describe("create-consequence-services API", () => {
    const writeHeadMock = vi.fn();
    vi.mock("../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
    }));

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should redirect to /review-disruption when all required inputs are passed", () => {
        const { req, res } = getMockRequestAndResponse({ body: defaultServicesData, mockWriteHeadFn: writeHeadMock });

        createConsequenceServices(req, res);

        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(COOKIES_CONSEQUENCE_INFO, expect.any(String), res);

        expect(writeHeadMock).toBeCalledWith(302, { Location: REVIEW_DISRUPTION_PAGE_PATH });
    });

    it("should redirect to /review-disruption when all required inputs are passed with stops", () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                ...defaultServicesData,
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
            },
            mockWriteHeadFn: writeHeadMock,
        });

        createConsequenceServices(req, res);

        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(COOKIES_CONSEQUENCE_INFO, expect.any(String), res);

        expect(writeHeadMock).toBeCalledWith(302, { Location: REVIEW_DISRUPTION_PAGE_PATH });
    });

    it("should redirect back to /create-consequence-services when no form inputs are passed to the API", () => {
        const { req, res } = getMockRequestAndResponse({ body: {}, mockWriteHeadFn: writeHeadMock });
        createConsequenceServices(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Enter a consequence description", id: "description" },
            { errorMessage: "Select yes or no", id: "removeFromJourneyPlanners" },
            { errorMessage: "Select the severity from the dropdown", id: "disruptionSeverity" },
            { errorMessage: "Select a vehicle mode", id: "vehicleMode" },
            { errorMessage: "Select a consequence type", id: "consequenceType" },
            { errorMessage: "At least one service must be added", id: "services" },
            { errorMessage: "Select a direction", id: "disruptionDirection" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CONSEQUENCE_SERVICES_ERRORS,
            JSON.stringify({ inputs: formatCreateConsequenceStopsServicesBody(req.body), errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: CREATE_CONSEQUENCE_SERVICES_PATH });
    });

    it("should redirect back to /create-consequence-services when description is too long", () => {
        const stopsData = {
            ...defaultServicesData,
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        };

        const { req, res } = getMockRequestAndResponse({ body: stopsData, mockWriteHeadFn: writeHeadMock });

        createConsequenceServices(req, res);

        const errors: ErrorInfo[] = [{ errorMessage: "Description must not exceed 500 characters", id: "description" }];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CONSEQUENCE_SERVICES_ERRORS,
            JSON.stringify({ inputs: formatCreateConsequenceStopsServicesBody(req.body), errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: CREATE_CONSEQUENCE_SERVICES_PATH });
    });

    it("should redirect back to /create-consequence-services when invalid time is passed", () => {
        const stopsData = {
            ...defaultServicesData,
            disruptionDelay: "7280",
        };

        const { req, res } = getMockRequestAndResponse({ body: stopsData, mockWriteHeadFn: writeHeadMock });

        createConsequenceServices(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Enter a number between 0 to 999 for disruption delay", id: "disruptionDelay" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CONSEQUENCE_SERVICES_ERRORS,
            JSON.stringify({ inputs: formatCreateConsequenceStopsServicesBody(req.body), errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: CREATE_CONSEQUENCE_SERVICES_PATH });
    });
});
