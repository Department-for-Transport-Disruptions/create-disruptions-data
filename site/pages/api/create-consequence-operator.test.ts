/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment  */
import { describe, it, expect, afterEach, vi } from "vitest";
import createConsequenceOperator from "./create-consequence-operator.api";
import {
    COOKIES_CONSEQUENCE_OPERATOR_ERRORS,
    COOKIES_CONSEQUENCE_OPERATOR_INFO,
    CREATE_CONSEQUENCE_OPERATOR_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
    Severity,
} from "../../constants";
import { ErrorInfo } from "../../interfaces";
import { getMockRequestAndResponse } from "../../testData/mockData";
import { setCookieOnResponseObject } from "../../utils/apiUtils";
import { ConsequenceOperatorPageInputs } from "../create-consequence-operator.page";

const defaultOperatorData: ConsequenceOperatorPageInputs = {
    consequenceOperator: "FMAN",
    description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    removeFromJourneyPlanners: "no",
    disruptionDelay: "",
    disruptionSeverity: Severity.slight,
    disruptionDirection: "allDirections",
};
describe("create-consequence-operator API", () => {
    const writeHeadMock = vi.fn();
    vi.mock("../../utils/apiUtils", async () => ({
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        ...((await vi.importActual("../../utils/apiUtils")) as object),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
    }));

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should redirect to /review-disruption when all required inputs are passed", () => {
        const { req, res } = getMockRequestAndResponse({ body: defaultOperatorData, mockWriteHeadFn: writeHeadMock });

        createConsequenceOperator(req, res);

        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CONSEQUENCE_OPERATOR_INFO,
            expect.any(String),
            res,
        );

        expect(writeHeadMock).toBeCalledWith(302, { Location: REVIEW_DISRUPTION_PAGE_PATH });
    });

    it("should redirect back to /create-consequence-operator when no form inputs are passed to the API", () => {
        const { req, res } = getMockRequestAndResponse({ body: {}, mockWriteHeadFn: writeHeadMock });
        createConsequenceOperator(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Select at least one operator", id: "consequenceOperator" },
            { errorMessage: "Enter a consequence description", id: "description" },
            { errorMessage: "Enter planned or unplanned", id: "removeFromJourneyPlanners" },
            { errorMessage: "Select the severity from the dropdown", id: "disruptionSeverity" },
            { errorMessage: "Select atleast one direction", id: "disruptionDirection" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CONSEQUENCE_OPERATOR_ERRORS,
            JSON.stringify({ inputs: req.body, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: CREATE_CONSEQUENCE_OPERATOR_PATH });
    });

    it("should redirect back to /create-consequence-operator when description is too long", () => {
        const operatorData: ConsequenceOperatorPageInputs = {
            ...defaultOperatorData,
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        };

        const { req, res } = getMockRequestAndResponse({ body: operatorData, mockWriteHeadFn: writeHeadMock });

        createConsequenceOperator(req, res);

        const errors: ErrorInfo[] = [{ errorMessage: "Description must not exceed 500 characters", id: "description" }];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CONSEQUENCE_OPERATOR_ERRORS,
            JSON.stringify({ inputs: req.body, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: CREATE_CONSEQUENCE_OPERATOR_PATH });
    });

    it("should redirect back to /create-consequence-operator when invalid time is passed", () => {
        const operatorData: ConsequenceOperatorPageInputs = {
            ...defaultOperatorData,
            disruptionDelay: "7280",
        };

        const { req, res } = getMockRequestAndResponse({ body: operatorData, mockWriteHeadFn: writeHeadMock });

        createConsequenceOperator(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Enter a valid time for disruption delay", id: "disruptionDelay" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CONSEQUENCE_OPERATOR_ERRORS,
            JSON.stringify({ inputs: req.body, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: CREATE_CONSEQUENCE_OPERATOR_PATH });
    });
});
