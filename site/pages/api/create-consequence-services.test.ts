import { ServicesConsequence } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { Datasource, Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    COOKIES_CONSEQUENCE_SERVICES_ERRORS,
    CREATE_CONSEQUENCE_SERVICES_PATH,
    CREATE_DISRUPTION_PAGE_PATH,
    DASHBOARD_PAGE_PATH,
    DISRUPTION_DETAIL_PAGE_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
    VIEW_ALL_TEMPLATES_PAGE_PATH,
} from "../../constants";
import * as db from "../../data/db";
import * as dynamo from "../../data/dynamo";
import { ErrorInfo } from "../../interfaces";
import { DEFAULT_ORG_ID, getMockRequestAndResponse, mockSession } from "../../testData/mockData";
import { setCookieOnResponseObject } from "../../utils/apiUtils";
import * as session from "../../utils/apiUtils/auth";
import createConsequenceServices, { formatCreateConsequenceStopsServicesBody } from "./create-consequence-services.api";

const defaultDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";
const defaultConsequenceIndex = "0";

const service = {
    id: 23127,
    lineName: "1",
    operatorShortName: "First South Yorkshire",
    origin: "Jordanthorpe",
    destination: "HigH Green",
    nocCode: "TEST",
    startDate: "2023-07-23",
    serviceCode: "NW_04_SCMN_149_1",
    dataSource: Datasource.tnds,
    lineId: "SL1",
    endDate: "2023-08-10",
};

const defaultServicesData = {
    service1: JSON.stringify(service),
    description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    removeFromJourneyPlanners: "no",
    disruptionDelay: "45",
    disruptionSeverity: Severity.severe,
    vehicleMode: VehicleMode.bus,
    consequenceType: "services",
    disruptionDirection: "inbound",
    consequenceIndex: defaultConsequenceIndex,
    disruptionId: defaultDisruptionId,
};

const servicesDataToUpsert = {
    disruptionId: "acde070d-8c4c-4f0d-9d8a-162843c10333",
    description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    removeFromJourneyPlanners: "no",
    disruptionDelay: "45",
    disruptionDirection: "inbound",
    disruptionSeverity: "severe",
    vehicleMode: "bus",
    consequenceIndex: 0,
    consequenceType: "services",
    services: [
        {
            destination: "HigH Green",
            id: 23127,
            lineName: "1",
            nocCode: "TEST",
            operatorShortName: "First South Yorkshire",
            origin: "Jordanthorpe",
            startDate: "2023-07-23",
            serviceCode: "NW_04_SCMN_149_1",
            dataSource: Datasource.tnds,
            lineId: "SL1",
            endDate: "2023-08-10",
        },
    ],
    stops: [],
};

describe("create-consequence-services API", () => {
    const writeHeadMock = vi.fn();
    vi.mock("../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
    }));

    const upsertConsequenceSpy = vi.spyOn(db, "upsertConsequence");
    const getNocCodesForOperatorOrgSpy = vi.spyOn(dynamo, "getNocCodesForOperatorOrg");

    vi.mock("../../data/db", () => ({
        upsertConsequence: vi.fn(),
    }));

    vi.mock("../../data/dynamo", () => ({
        getNocCodesForOperatorOrg: vi.fn(),
    }));

    afterEach(() => {
        vi.resetAllMocks();
    });

    const getSessionSpy = vi.spyOn(session, "getSession");

    const refererPath = `${CREATE_DISRUPTION_PAGE_PATH}/${defaultDisruptionId}?${encodeURIComponent(
        `${DISRUPTION_DETAIL_PAGE_PATH}/${
            defaultDisruptionId as string
        }?template=true&return=${VIEW_ALL_TEMPLATES_PAGE_PATH}`,
    )}`;

    const returnPath = encodeURIComponent(
        `${DISRUPTION_DETAIL_PAGE_PATH}/${
            defaultDisruptionId as string
        }?template=true&return=${VIEW_ALL_TEMPLATES_PAGE_PATH}`,
    );

    beforeEach(() => {
        getSessionSpy.mockImplementation(() => {
            return mockSession;
        });
        upsertConsequenceSpy.mockResolvedValue(1);
    });

    it("should redirect to /review-disruption when all required inputs are passed", async () => {
        const { req, res } = getMockRequestAndResponse({ body: defaultServicesData, mockWriteHeadFn: writeHeadMock });

        await createConsequenceServices(req, res);

        expect(upsertConsequenceSpy).toHaveBeenCalledTimes(1);
        expect(upsertConsequenceSpy).toHaveBeenCalledWith(
            {
                disruptionId: "acde070d-8c4c-4f0d-9d8a-162843c10333",
                description:
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                removeFromJourneyPlanners: "no",
                disruptionDelay: "45",
                disruptionDirection: "inbound",
                disruptionSeverity: "severe",
                vehicleMode: "bus",
                consequenceIndex: 0,
                consequenceType: "services",
                services: [
                    {
                        destination: "HigH Green",
                        id: 23127,
                        lineName: "1",
                        nocCode: "TEST",
                        operatorShortName: "First South Yorkshire",
                        origin: "Jordanthorpe",
                        startDate: "2023-07-23",
                        serviceCode: "NW_04_SCMN_149_1",
                        dataSource: Datasource.tnds,
                        lineId: "SL1",
                        endDate: "2023-08-10",
                    },
                ],
                stops: [],
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

    it("should redirect to /review-disruption when all required inputs are passed with stops", async () => {
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

        await createConsequenceServices(req, res);

        expect(upsertConsequenceSpy).toHaveBeenCalledTimes(1);
        expect(upsertConsequenceSpy).toHaveBeenCalledWith(
            {
                disruptionId: "acde070d-8c4c-4f0d-9d8a-162843c10333",
                description:
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                removeFromJourneyPlanners: "no",
                disruptionDelay: "45",
                disruptionDirection: "inbound",
                disruptionSeverity: "severe",
                vehicleMode: "bus",
                consequenceIndex: 0,
                consequenceType: "services",
                services: [
                    {
                        destination: "HigH Green",
                        id: 23127,
                        lineName: "1",
                        nocCode: "TEST",
                        operatorShortName: "First South Yorkshire",
                        origin: "Jordanthorpe",
                        startDate: "2023-07-23",
                        serviceCode: "NW_04_SCMN_149_1",
                        dataSource: Datasource.tnds,
                        lineId: "SL1",
                        endDate: "2023-08-10",
                    },
                ],
                stops: [
                    {
                        atcoCode: "0100BRP90310",
                        commonName: "Temple Meads Stn",
                        indicator: "T3",
                        latitude: 51.44901,
                        longitude: -2.58569,
                    },
                    {
                        atcoCode: "0100BRP90311",
                        commonName: "Temple Meads Stn",
                        indicator: "T7",
                        latitude: 51.45014,
                        longitude: -2.5856,
                    },
                ],
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

    it("should redirect back to /create-consequence-services when no form inputs are passed to the API", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { consequenceIndex: defaultConsequenceIndex, disruptionId: defaultDisruptionId },
            mockWriteHeadFn: writeHeadMock,
        });
        await createConsequenceServices(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Enter a consequence description", id: "description" },
            { errorMessage: "Select yes or no", id: "removeFromJourneyPlanners" },
            { errorMessage: "Select the severity from the dropdown", id: "disruptionSeverity" },
            { errorMessage: "Select a mode of transport", id: "vehicleMode" },
            { errorMessage: "Select a consequence type", id: "consequenceType" },
            { errorMessage: "At least one service must be added", id: "services" },
            { errorMessage: "Select a direction", id: "disruptionDirection" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CONSEQUENCE_SERVICES_ERRORS,
            JSON.stringify({
                inputs: {
                    ...(formatCreateConsequenceStopsServicesBody(req.body) as ServicesConsequence),
                    services: [],
                    stops: [],
                    serviceRefs: [],
                    stopRefs: [],
                },
                errors,
            }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${CREATE_CONSEQUENCE_SERVICES_PATH}/${defaultDisruptionId}/${defaultConsequenceIndex}`,
        });
    });

    it("should redirect back to /create-consequence-services when description is too long", async () => {
        const stopsData = {
            ...defaultServicesData,
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        };

        const { req, res } = getMockRequestAndResponse({ body: stopsData, mockWriteHeadFn: writeHeadMock });

        await createConsequenceServices(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Description must not exceed 1000 characters", id: "description" },
        ];

        const formattedBody = formatCreateConsequenceStopsServicesBody(req.body) as ServicesConsequence;

        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CONSEQUENCE_SERVICES_ERRORS,
            JSON.stringify({
                inputs: {
                    ...formattedBody,
                    services: [],
                    stops: [],
                    serviceRefs: ["NW_04_SCMN_149_1"],
                    stopRefs: [],
                },
                errors,
            }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${CREATE_CONSEQUENCE_SERVICES_PATH}/${defaultDisruptionId}/${defaultConsequenceIndex}`,
        });
    });

    it("should redirect back to /create-consequence-services when invalid time is passed", async () => {
        const stopsData = {
            ...defaultServicesData,
            disruptionDelay: "7280",
        };

        const { req, res } = getMockRequestAndResponse({ body: stopsData, mockWriteHeadFn: writeHeadMock });

        await createConsequenceServices(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Enter a number between 0 to 999 for disruption delay", id: "disruptionDelay" },
        ];

        const formattedBody = formatCreateConsequenceStopsServicesBody(req.body) as ServicesConsequence;

        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CONSEQUENCE_SERVICES_ERRORS,
            JSON.stringify({
                inputs: {
                    ...formattedBody,
                    services: [],
                    stops: [],
                    serviceRefs: ["NW_04_SCMN_149_1"],
                    stopRefs: [],
                },
                errors,
            }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${CREATE_CONSEQUENCE_SERVICES_PATH}/${defaultDisruptionId}/${defaultConsequenceIndex}`,
        });
    });

    it("should redirect to /dashboard when all required inputs are passed and the disruption is saved as draft", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: defaultServicesData,
            mockWriteHeadFn: writeHeadMock,
            query: { draft: "true" },
        });

        await createConsequenceServices(req, res);

        expect(upsertConsequenceSpy).toHaveBeenCalledTimes(1);
        expect(upsertConsequenceSpy).toHaveBeenCalledWith(
            servicesDataToUpsert,
            DEFAULT_ORG_ID,
            mockSession.name,
            mockSession.isOrgStaff,
            false,
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: DASHBOARD_PAGE_PATH,
        });
    });

    it("should redirect to /review-disruption when all required inputs are passed  with appropriate query params when a new disruption is created from template", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: defaultServicesData,
            requestHeaders: {
                referer: refererPath,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await createConsequenceServices(req, res);

        expect(upsertConsequenceSpy).toHaveBeenCalledTimes(1);
        expect(upsertConsequenceSpy).toHaveBeenCalledWith(
            servicesDataToUpsert,
            DEFAULT_ORG_ID,
            mockSession.name,
            mockSession.isOrgStaff,
            false,
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${REVIEW_DISRUPTION_PAGE_PATH}/${defaultDisruptionId}?${returnPath}`,
        });
    });

    it("should redirect back to /create-consequence-services when description is too long with appropriate query params", async () => {
        const stopsData = {
            ...defaultServicesData,
            service2: JSON.stringify({
                ...service,
                dataSource: Datasource.bods,
            }),
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        };

        const { req, res } = getMockRequestAndResponse({
            body: stopsData,
            requestHeaders: {
                referer: refererPath,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await createConsequenceServices(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Description must not exceed 1000 characters", id: "description" },
        ];

        const formattedBody = formatCreateConsequenceStopsServicesBody(req.body) as ServicesConsequence;

        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CONSEQUENCE_SERVICES_ERRORS,
            JSON.stringify({
                inputs: {
                    ...formattedBody,
                    services: [],
                    stops: [],
                    serviceRefs: ["NW_04_SCMN_149_1", "SL1"],
                    stopRefs: [],
                },
                errors,
            }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${CREATE_CONSEQUENCE_SERVICES_PATH}/${defaultDisruptionId}/${defaultConsequenceIndex}?${returnPath}`,
        });
    });

    it("should redirect to /type-of-consequence when all required inputs are passed and add another consequence is true", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { ...defaultServicesData, consequenceIndex: "1" },
            query: { addAnotherConsequence: "true" },
            mockWriteHeadFn: writeHeadMock,
        });

        await createConsequenceServices(req, res);

        expect(upsertConsequenceSpy).toHaveBeenCalledTimes(1);
        expect(upsertConsequenceSpy).toHaveBeenCalledWith(
            { ...servicesDataToUpsert, consequenceIndex: 1 },
            DEFAULT_ORG_ID,
            mockSession.name,
            mockSession.isOrgStaff,
            false,
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${TYPE_OF_CONSEQUENCE_PAGE_PATH}/${defaultDisruptionId}/2`,
        });
    });
    it("should redirect to /type-of-consequence when all required inputs are passed and add another consequence is true and a template", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { ...defaultServicesData },
            query: { addAnotherConsequence: "true", template: "true" },
            mockWriteHeadFn: writeHeadMock,
        });

        await createConsequenceServices(req, res);

        expect(upsertConsequenceSpy).toHaveBeenCalledTimes(1);
        expect(upsertConsequenceSpy).toHaveBeenCalledWith(
            servicesDataToUpsert,
            DEFAULT_ORG_ID,
            mockSession.name,
            mockSession.isOrgStaff,
            true,
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${TYPE_OF_CONSEQUENCE_PAGE_PATH}/${defaultDisruptionId}/2?template=true`,
        });
    });

    it("should redirect to /type-of-consequence when all required inputs are passed, when another consequence is added and when the consequence index is not 0", async () => {
        upsertConsequenceSpy.mockResolvedValue(1);
        const { req, res } = getMockRequestAndResponse({
            body: { ...defaultServicesData, consequenceIndex: "2" },
            query: { addAnotherConsequence: "true" },
            mockWriteHeadFn: writeHeadMock,
        });

        await createConsequenceServices(req, res);

        expect(upsertConsequenceSpy).toHaveBeenCalledTimes(1);
        expect(upsertConsequenceSpy).toHaveBeenCalledWith(
            { ...servicesDataToUpsert, consequenceIndex: 2 },
            DEFAULT_ORG_ID,
            mockSession.name,
            mockSession.isOrgStaff,
            false,
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${TYPE_OF_CONSEQUENCE_PAGE_PATH}/${defaultDisruptionId}/3`,
        });
    });

    it("should redirect back to /create-consequence-services when operator user tries to create a consequence for service that does not contain their NOC code", async () => {
        getSessionSpy.mockImplementation(() => {
            return { ...mockSession, isSystemAdmin: false, isOperatorUser: true, operatorOrgId: "test-org-id" };
        });
        upsertConsequenceSpy.mockResolvedValue(1);
        getNocCodesForOperatorOrgSpy.mockResolvedValue(["TESTING, TESTING"]);

        const { req, res } = getMockRequestAndResponse({
            body: { ...defaultServicesData },
            mockWriteHeadFn: writeHeadMock,
        });

        await createConsequenceServices(req, res);

        const errors: ErrorInfo[] = [
            {
                errorMessage:
                    "Operator user can only create service type consequence for services that contain their own NOC codes.",
                id: "",
            },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CONSEQUENCE_SERVICES_ERRORS,
            JSON.stringify({ inputs: formatCreateConsequenceStopsServicesBody(req.body), errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${CREATE_CONSEQUENCE_SERVICES_PATH}/${defaultDisruptionId}/${defaultConsequenceIndex}`,
        });
    });

    it("should redirect to /review-disruption when operator user creates consequence and all required inputs are passed", async () => {
        getSessionSpy.mockImplementation(() => {
            return { ...mockSession, isSystemAdmin: false, isOperatorUser: true, operatorOrgId: "test-org-id" };
        });
        getNocCodesForOperatorOrgSpy.mockResolvedValue(["TEST"]);
        const { req, res } = getMockRequestAndResponse({ body: defaultServicesData, mockWriteHeadFn: writeHeadMock });

        await createConsequenceServices(req, res);

        expect(upsertConsequenceSpy).toHaveBeenCalledTimes(1);
        expect(upsertConsequenceSpy).toHaveBeenCalledWith(
            {
                disruptionId: "acde070d-8c4c-4f0d-9d8a-162843c10333",
                description:
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                removeFromJourneyPlanners: "no",
                disruptionDelay: "45",
                disruptionDirection: "inbound",
                disruptionSeverity: "severe",
                vehicleMode: "bus",
                consequenceIndex: 0,
                consequenceType: "services",
                services: [
                    {
                        destination: "HigH Green",
                        id: 23127,
                        lineName: "1",
                        nocCode: "TEST",
                        operatorShortName: "First South Yorkshire",
                        origin: "Jordanthorpe",
                        startDate: "2023-07-23",
                        serviceCode: "NW_04_SCMN_149_1",
                        dataSource: Datasource.tnds,
                        lineId: "SL1",
                        endDate: "2023-08-10",
                    },
                ],
                stops: [],
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
});
