/* eslint-disable @typescript-eslint/no-unsafe-assignment  */
import { Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { describe, it, expect, afterEach, vi } from "vitest";
import createConsequenceOperator from "./create-consequence-operator.api";
import {
    COOKIES_CONSEQUENCE_OPERATOR_ERRORS,
    CREATE_CONSEQUENCE_OPERATOR_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
} from "../../constants";
import * as dynamo from "../../data/dynamo";
import { ErrorInfo } from "../../interfaces";
import { getMockRequestAndResponse } from "../../testData/mockData";
import { setCookieOnResponseObject } from "../../utils/apiUtils";

const defaultDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";
const defaultConsequenceIndex = "0";

const defaultOperatorData = {
    consequenceOperator: "FMAN",
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
describe("create-consequence-operator API", () => {
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

    it("should redirect to /review-disruption when all required inputs are passed", async () => {
        const { req, res } = getMockRequestAndResponse({ body: defaultOperatorData, mockWriteHeadFn: writeHeadMock });

        await createConsequenceOperator(req, res);

        expect(upsertConsequenceSpy).toHaveBeenCalledTimes(1);
        expect(upsertConsequenceSpy).toHaveBeenCalledWith({
            disruptionId: "acde070d-8c4c-4f0d-9d8a-162843c10333",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            removeFromJourneyPlanners: "no",
            disruptionDelay: "",
            disruptionSeverity: "slight",
            vehicleMode: "bus",
            consequenceIndex: 0,
            consequenceOperator: "FMAN",
            consequenceType: "operatorWide",
        });

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
            { errorMessage: "Select an operator", id: "consequenceOperator" },
            { errorMessage: "Select a consequence type", id: "consequenceType" },
        ];

        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CONSEQUENCE_OPERATOR_ERRORS,
            JSON.stringify({ inputs: req.body, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${CREATE_CONSEQUENCE_OPERATOR_PATH}/${defaultDisruptionId}/${defaultConsequenceIndex}`,
        });
    });

    it("should redirect back to /create-consequence-operator when description is too long", async () => {
        const operatorData = {
            ...defaultOperatorData,
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        };

        const { req, res } = getMockRequestAndResponse({ body: operatorData, mockWriteHeadFn: writeHeadMock });

        await createConsequenceOperator(req, res);

        const errors: ErrorInfo[] = [{ errorMessage: "Description must not exceed 500 characters", id: "description" }];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CONSEQUENCE_OPERATOR_ERRORS,
            JSON.stringify({ inputs: req.body, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${CREATE_CONSEQUENCE_OPERATOR_PATH}/${defaultDisruptionId}/${defaultConsequenceIndex}`,
        });
    });

    it("should redirect back to /create-consequence-operator when invalid time is passed", async () => {
        const operatorData = {
            ...defaultOperatorData,
            disruptionDelay: "7280",
        };

        const { req, res } = getMockRequestAndResponse({ body: operatorData, mockWriteHeadFn: writeHeadMock });

        await createConsequenceOperator(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Enter a number between 0 to 999 for disruption delay", id: "disruptionDelay" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CONSEQUENCE_OPERATOR_ERRORS,
            JSON.stringify({ inputs: req.body, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${CREATE_CONSEQUENCE_OPERATOR_PATH}/${defaultDisruptionId}/${defaultConsequenceIndex}`,
        });
    });
});
