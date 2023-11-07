/* eslint-disable @typescript-eslint/no-unsafe-assignment  */
import { Consequence, ConsequenceOperators } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import createConsequenceOperator from "./create-consequence-operator.api";
import {
    COOKIES_CONSEQUENCE_OPERATOR_ERRORS,
    CREATE_CONSEQUENCE_OPERATOR_PATH,
    CREATE_DISRUPTION_PAGE_PATH,
    DASHBOARD_PAGE_PATH,
    DISRUPTION_DETAIL_PAGE_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
    VIEW_ALL_TEMPLATES_PAGE_PATH,
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

const defaultConsequenceOperators: ConsequenceOperators[] = [
    {
        operatorNoc: "FMAN",
        operatorPublicName: "Another operator",
    },
];

const bodyData = {
    consequenceOperators: JSON.stringify(defaultConsequenceOperators),
    description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    removeFromJourneyPlanners: "no",
    disruptionDelay: "",
    disruptionSeverity: Severity.slight,
    vehicleMode: VehicleMode.bus,
    consequenceType: "operatorWide",
    consequenceIndex: defaultConsequenceIndex,
    disruptionId: defaultDisruptionId,
};

const disruption: FullDisruption = createDisruptionWithConsquences([
    { ...bodyData, consequenceIndex: Number(defaultConsequenceIndex) } as Consequence,
]);

const operatorToUpsert = {
    disruptionId: "acde070d-8c4c-4f0d-9d8a-162843c10333",
    description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    removeFromJourneyPlanners: "no",
    disruptionDelay: "",
    disruptionSeverity: "slight",
    vehicleMode: "bus",
    consequenceIndex: 0,
    consequenceOperators: defaultConsequenceOperators,
    consequenceType: "operatorWide",
};

describe("create-consequence-operator API", () => {
    const writeHeadMock = vi.fn();
    vi.mock("../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
    }));

    const upsertConsequenceSpy = vi.spyOn(dynamo, "upsertConsequence");
    const getNocCodesForOperatorOrgSpy = vi.spyOn(dynamo, "getNocCodesForOperatorOrg");

    vi.mock("../../data/dynamo", () => ({
        upsertConsequence: vi.fn(),
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
        upsertConsequenceSpy.mockResolvedValue(disruption);
    });

    it("should redirect to /review-disruption when all required inputs are passed", async () => {
        const { req, res } = getMockRequestAndResponse({ body: bodyData, mockWriteHeadFn: writeHeadMock });

        await createConsequenceOperator(req, res);

        expect(upsertConsequenceSpy).toHaveBeenCalledTimes(1);
        expect(upsertConsequenceSpy).toHaveBeenCalledWith(
            operatorToUpsert,
            DEFAULT_ORG_ID,
            mockSession.isOrgStaff,
            false,
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${REVIEW_DISRUPTION_PAGE_PATH}/${defaultDisruptionId}`,
        });
    });

    it("should redirect back to /create-consequence-operator when no form inputs are passed to the API", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { consequenceIndex: defaultConsequenceIndex, disruptionId: defaultDisruptionId },
            mockWriteHeadFn: writeHeadMock,
        });
        await createConsequenceOperator(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Enter a consequence description", id: "description" },
            { errorMessage: "Select yes or no", id: "removeFromJourneyPlanners" },
            { errorMessage: "Select the severity from the dropdown", id: "disruptionSeverity" },
            { errorMessage: "Select a mode of transport", id: "vehicleMode" },
            { errorMessage: "Select one or more operators", id: "consequenceOperators" },
            { errorMessage: "Select a consequence type", id: "consequenceType" },
        ];

        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CONSEQUENCE_OPERATOR_ERRORS,
            JSON.stringify({
                inputs: {
                    consequenceIndex: defaultConsequenceIndex,
                    disruptionId: defaultDisruptionId,
                    consequenceOperators: [],
                },
                errors,
            }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${CREATE_CONSEQUENCE_OPERATOR_PATH}/${defaultDisruptionId}/${defaultConsequenceIndex}`,
        });
    });

    it("should redirect back to /create-consequence-operator when description is too long", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                ...bodyData,
                description:
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await createConsequenceOperator(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Description must not exceed 1000 characters", id: "description" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CONSEQUENCE_OPERATOR_ERRORS,
            JSON.stringify({
                inputs: {
                    ...bodyData,
                    consequenceOperators: defaultConsequenceOperators,
                    description:
                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                },
                errors,
            }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${CREATE_CONSEQUENCE_OPERATOR_PATH}/${defaultDisruptionId}/${defaultConsequenceIndex}`,
        });
    });

    it("should redirect back to /create-consequence-operator when invalid time is passed", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { ...bodyData, disruptionDelay: "7280" },
            mockWriteHeadFn: writeHeadMock,
        });

        await createConsequenceOperator(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Enter a number between 0 to 999 for disruption delay", id: "disruptionDelay" },
        ];

        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CONSEQUENCE_OPERATOR_ERRORS,
            JSON.stringify({
                inputs: {
                    ...bodyData,
                    consequenceOperators: defaultConsequenceOperators,
                    disruptionDelay: "7280",
                },
                errors,
            }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${CREATE_CONSEQUENCE_OPERATOR_PATH}/${defaultDisruptionId}/${defaultConsequenceIndex}`,
        });
    });

    it("should redirect to /dashboard when all required inputs are passed and the disruption is saved as draft", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: bodyData,
            mockWriteHeadFn: writeHeadMock,
            query: { draft: "true" },
        });

        await createConsequenceOperator(req, res);

        expect(upsertConsequenceSpy).toHaveBeenCalledTimes(1);
        expect(upsertConsequenceSpy).toHaveBeenCalledWith(
            operatorToUpsert,
            DEFAULT_ORG_ID,
            mockSession.isOrgStaff,
            false,
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: DASHBOARD_PAGE_PATH,
        });
    });

    it("should redirect to /review-disruption when all required inputs are passed  with appropriate query params when a new disruption is created from template", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: bodyData,
            requestHeaders: {
                referer: refererPath,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await createConsequenceOperator(req, res);

        expect(upsertConsequenceSpy).toHaveBeenCalledTimes(1);
        expect(upsertConsequenceSpy).toHaveBeenCalledWith(
            operatorToUpsert,
            DEFAULT_ORG_ID,
            mockSession.isOrgStaff,
            false,
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${REVIEW_DISRUPTION_PAGE_PATH}/${defaultDisruptionId}?${returnPath}`,
        });
    });

    it("should redirect back to /create-consequence-operator when description is too long with appropriate query params", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                ...bodyData,
                description:
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            },
            requestHeaders: {
                referer: refererPath,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await createConsequenceOperator(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Description must not exceed 1000 characters", id: "description" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CONSEQUENCE_OPERATOR_ERRORS,
            JSON.stringify({
                inputs: {
                    ...bodyData,
                    consequenceOperators: defaultConsequenceOperators,
                    description:
                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                },
                errors,
            }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${CREATE_CONSEQUENCE_OPERATOR_PATH}/${defaultDisruptionId}/${defaultConsequenceIndex}?${returnPath}`,
        });
    });

    it("should redirect to /type-of-consequence when all required inputs are passed and add another consequence is true", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { ...bodyData, consequenceIndex: "1" },
            query: { addAnotherConsequence: "true" },
            mockWriteHeadFn: writeHeadMock,
        });

        await createConsequenceOperator(req, res);

        expect(upsertConsequenceSpy).toHaveBeenCalledTimes(1);
        expect(upsertConsequenceSpy).toHaveBeenCalledWith(
            { ...operatorToUpsert, consequenceIndex: 1 },
            DEFAULT_ORG_ID,
            mockSession.isOrgStaff,
            false,
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${TYPE_OF_CONSEQUENCE_PAGE_PATH}/${defaultDisruptionId}/2`,
        });
    });

    it("should redirect to /type-of-consequence when all required inputs are passed and add another consequence is true and a template", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: bodyData,
            query: { addAnotherConsequence: "true", template: "true" },
            mockWriteHeadFn: writeHeadMock,
        });

        await createConsequenceOperator(req, res);

        expect(upsertConsequenceSpy).toHaveBeenCalledTimes(1);
        expect(upsertConsequenceSpy).toHaveBeenCalledWith(
            operatorToUpsert,
            DEFAULT_ORG_ID,
            mockSession.isOrgStaff,
            true,
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${TYPE_OF_CONSEQUENCE_PAGE_PATH}/${defaultDisruptionId}/1?template=true`,
        });
    });

    it("should redirect to /type-of-consequence when all required inputs are passed, when another consequence is added and when the consequence index is not 0", async () => {
        upsertConsequenceSpy.mockResolvedValue(disruptionWithConsequences);
        const { req, res } = getMockRequestAndResponse({
            body: { ...bodyData, consequenceIndex: "2" },
            query: { addAnotherConsequence: "true" },
            mockWriteHeadFn: writeHeadMock,
        });

        await createConsequenceOperator(req, res);

        expect(upsertConsequenceSpy).toHaveBeenCalledTimes(1);
        expect(upsertConsequenceSpy).toHaveBeenCalledWith(
            { ...operatorToUpsert, consequenceIndex: 2 },
            DEFAULT_ORG_ID,
            mockSession.isOrgStaff,
            false,
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${TYPE_OF_CONSEQUENCE_PAGE_PATH}/${defaultDisruptionId}/3`,
        });
    });

    it("should redirect back to /create-consequence-operator when an operator user creates a consequence with a NOC code that is not their own", async () => {
        getSessionSpy.mockImplementation(() => {
            return { ...mockSession, isOperatorUser: true, operatorOrgId: "test-org-id" };
        });
        upsertConsequenceSpy.mockResolvedValue(disruptionWithConsequences);
        getNocCodesForOperatorOrgSpy.mockResolvedValue(["TESTING", "TEST"]);

        const { req, res } = getMockRequestAndResponse({
            body: { ...bodyData },
            mockWriteHeadFn: writeHeadMock,
        });

        await createConsequenceOperator(req, res);

        const errors: ErrorInfo[] = [
            {
                errorMessage: "Operator user can only create operator type consequence for their own NOC codes.",
                id: "",
            },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CONSEQUENCE_OPERATOR_ERRORS,
            JSON.stringify({
                inputs: {
                    ...bodyData,
                    consequenceOperators: defaultConsequenceOperators,
                },
                errors,
            }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${CREATE_CONSEQUENCE_OPERATOR_PATH}/${defaultDisruptionId}/${defaultConsequenceIndex}`,
        });
    });

    it("should redirect to /review-disruption when operator user creates consequence and all required inputs are passed", async () => {
        getSessionSpy.mockImplementation(() => {
            return { ...mockSession, isOperatorUser: true, operatorOrgId: "test-org-id" };
        });
        getNocCodesForOperatorOrgSpy.mockResolvedValue([defaultConsequenceOperators[0].operatorNoc]);

        const { req, res } = getMockRequestAndResponse({ body: bodyData, mockWriteHeadFn: writeHeadMock });

        await createConsequenceOperator(req, res);

        expect(upsertConsequenceSpy).toHaveBeenCalledTimes(1);
        expect(upsertConsequenceSpy).toHaveBeenCalledWith(
            operatorToUpsert,
            DEFAULT_ORG_ID,
            mockSession.isOperatorUser,
            false,
        );

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${REVIEW_DISRUPTION_PAGE_PATH}/${defaultDisruptionId}`,
        });
    });
});
