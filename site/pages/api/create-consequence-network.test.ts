/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment  */
import { Severity } from "@create-disruptions-data/shared-ts/enums";
import { describe, it, expect, afterEach, vi } from "vitest";
import createConsequenceNetwork from "./create-consequence-network.api";
import {
    COOKIES_CONSEQUENCE_INFO,
    COOKIES_CONSEQUENCE_NETWORK_ERRORS,
    CREATE_CONSEQUENCE_NETWORK_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
} from "../../constants";
import { ErrorInfo } from "../../interfaces";
import { getMockRequestAndResponse } from "../../testData/mockData";
import { setCookieOnResponseObject } from "../../utils/apiUtils";
import { ConsequenceNetworkPageInputs } from "../create-consequence-network.page";

const defaultNetworkData: ConsequenceNetworkPageInputs = {
    description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    removeFromJourneyPlanners: "no",
    disruptionDelay: "",
    disruptionSeverity: Severity.slight,
    disruptionDirection: "allDirections",
};

describe("create-consequence-network API", () => {
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
        const { req, res } = getMockRequestAndResponse({ body: defaultNetworkData, mockWriteHeadFn: writeHeadMock });

        createConsequenceNetwork(req, res);

        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(COOKIES_CONSEQUENCE_INFO, expect.any(String), res);

        expect(writeHeadMock).toBeCalledWith(302, { Location: REVIEW_DISRUPTION_PAGE_PATH });
    });

    it("should redirect back to /create-consequence-network when no form inputs are passed to the API", () => {
        const { req, res } = getMockRequestAndResponse({ body: {}, mockWriteHeadFn: writeHeadMock });
        createConsequenceNetwork(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Enter a consequence description", id: "description" },
            { errorMessage: "Select planned or unplanned", id: "removeFromJourneyPlanners" },
            { errorMessage: "Select the severity from the dropdown", id: "disruptionSeverity" },
            { errorMessage: "Select a direction", id: "disruptionDirection" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CONSEQUENCE_NETWORK_ERRORS,
            JSON.stringify({ inputs: req.body, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: CREATE_CONSEQUENCE_NETWORK_PATH });
    });

    it("should redirect back to /create-consequence-network when description is too long", () => {
        const networkData: ConsequenceNetworkPageInputs = {
            ...defaultNetworkData,
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        };

        const { req, res } = getMockRequestAndResponse({ body: networkData, mockWriteHeadFn: writeHeadMock });

        createConsequenceNetwork(req, res);

        const errors: ErrorInfo[] = [{ errorMessage: "Description must not exceed 500 characters", id: "description" }];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CONSEQUENCE_NETWORK_ERRORS,
            JSON.stringify({ inputs: req.body, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: CREATE_CONSEQUENCE_NETWORK_PATH });
    });

    it("should redirect back to /create-consequence-network when invalid time is passed", () => {
        const networkData: ConsequenceNetworkPageInputs = {
            ...defaultNetworkData,
            disruptionDelay: "7280",
        };

        const { req, res } = getMockRequestAndResponse({ body: networkData, mockWriteHeadFn: writeHeadMock });

        createConsequenceNetwork(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Enter a number between 0 to 999 for disruption delay", id: "disruptionDelay" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_CONSEQUENCE_NETWORK_ERRORS,
            JSON.stringify({ inputs: req.body, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: CREATE_CONSEQUENCE_NETWORK_PATH });
    });
});
