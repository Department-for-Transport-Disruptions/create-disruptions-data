/* eslint-disable @typescript-eslint/no-unsafe-assignment  */
import { Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { describe, it, expect, afterEach, vi } from "vitest";
import createConsequenceNetwork from "./create-consequence-network.api";
import {
    COOKIES_CONSEQUENCE_NETWORK_ERRORS,
    CREATE_CONSEQUENCE_NETWORK_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
} from "../../constants";
import * as dynamo from "../../data/dynamo";
import { ErrorInfo } from "../../interfaces";
import { getMockRequestAndResponse } from "../../testData/mockData";
import { setCookieOnResponseObject } from "../../utils/apiUtils";

const defaultDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";
const defaultConsequenceIndex = "0";

const defaultNetworkData = {
    description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    removeFromJourneyPlanners: "no",
    disruptionDelay: "",
    disruptionSeverity: Severity.slight,
    vehicleMode: VehicleMode.bus,
    consequenceType: "networkWide",
    consequenceIndex: defaultConsequenceIndex,
    disruptionId: defaultDisruptionId,
};

describe("create-consequence-network API", () => {
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
        const { req, res } = getMockRequestAndResponse({ body: defaultNetworkData, mockWriteHeadFn: writeHeadMock });

        await createConsequenceNetwork(req, res);

        expect(upsertConsequenceSpy).toHaveBeenCalledTimes(1);
        expect(upsertConsequenceSpy).toHaveBeenCalledWith({
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            removeFromJourneyPlanners: "no",
            disruptionDelay: "",
            disruptionSeverity: Severity.slight,
            vehicleMode: VehicleMode.bus,
            consequenceType: "networkWide",
            consequenceIndex: 0,
            disruptionId: defaultDisruptionId,
        });

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${REVIEW_DISRUPTION_PAGE_PATH}/${defaultDisruptionId}`,
        });
    });

    it("should redirect back to /create-consequence-network when no form inputs are passed to the API", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { consequenceIndex: defaultConsequenceIndex, disruptionId: defaultDisruptionId },
            mockWriteHeadFn: writeHeadMock,
        });
        await createConsequenceNetwork(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Enter a consequence description", id: "description" },
            { errorMessage: "Select yes or no", id: "removeFromJourneyPlanners" },
            { errorMessage: "Select the severity from the dropdown", id: "disruptionSeverity" },
            { errorMessage: "Select a mode of transport", id: "vehicleMode" },
            { errorMessage: "Select a consequence type", id: "consequenceType" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CONSEQUENCE_NETWORK_ERRORS,
            JSON.stringify({ inputs: req.body, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${CREATE_CONSEQUENCE_NETWORK_PATH}/${defaultDisruptionId}/${defaultConsequenceIndex}`,
        });
    });

    it("should redirect back to /create-consequence-network when description is too long", async () => {
        const networkData = {
            ...defaultNetworkData,
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        };

        const { req, res } = getMockRequestAndResponse({ body: networkData, mockWriteHeadFn: writeHeadMock });

        await createConsequenceNetwork(req, res);

        const errors: ErrorInfo[] = [{ errorMessage: "Description must not exceed 500 characters", id: "description" }];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CONSEQUENCE_NETWORK_ERRORS,
            JSON.stringify({ inputs: req.body, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${CREATE_CONSEQUENCE_NETWORK_PATH}/${defaultDisruptionId}/${defaultConsequenceIndex}`,
        });
    });

    it("should redirect back to /create-consequence-network when invalid time is passed", async () => {
        const networkData = {
            ...defaultNetworkData,
            disruptionDelay: "7280",
        };

        const { req, res } = getMockRequestAndResponse({ body: networkData, mockWriteHeadFn: writeHeadMock });

        await createConsequenceNetwork(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Enter a number between 0 to 999 for disruption delay", id: "disruptionDelay" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CONSEQUENCE_NETWORK_ERRORS,
            JSON.stringify({ inputs: req.body, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: `${CREATE_CONSEQUENCE_NETWORK_PATH}/${defaultDisruptionId}/${defaultConsequenceIndex}`,
        });
    });
});
