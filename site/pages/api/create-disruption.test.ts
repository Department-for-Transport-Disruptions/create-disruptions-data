/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment  */
import { MiscellaneousReason } from "@create-disruptions-data/shared-ts/enums";
import { describe, it, expect, afterEach, vi } from "vitest";
import createDisruption from "./create-disruption.api";
import { COOKIES_DISRUPTION_ERRORS, COOKIES_DISRUPTION_INFO, CD_DATE_FORMAT } from "../../constants";
import { ErrorInfo } from "../../interfaces";
import { getMockRequestAndResponse } from "../../testData/mockData";
import { setCookieOnResponseObject } from "../../utils/apiUtils";
import { getFutureDateAsString } from "../../utils/dates";
import { DisruptionPageInputs } from "../create-disruption.page";

const defaultDisruptionStartDate = getFutureDateAsString(2, CD_DATE_FORMAT);
const defaultDisruptionEndDate = getFutureDateAsString(5, CD_DATE_FORMAT);
const defaultPublishStartDate = getFutureDateAsString(2, CD_DATE_FORMAT);

const defaultDisruptionData: DisruptionPageInputs = {
    disruptionType: "unplanned",
    summary: "Lorem ipsum dolor sit amet",
    description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    associatedLink: "",
    disruptionReason: MiscellaneousReason.roadWorks,
    disruptionStartDate: defaultDisruptionStartDate,
    disruptionEndDate: defaultDisruptionEndDate,
    disruptionStartTime: "1000",
    disruptionEndTime: "1100",
    disruptionRepeats: "no",
    publishStartDate: defaultPublishStartDate,
    publishStartTime: "1100",
    publishEndDate: "",
    publishEndTime: "",
    publishNoEndDateTime: "true",
    disruptionNoEndDateTime: "",
};

describe("create-disruption API", () => {
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

    it("should redirect to /type-of-consequence when all required inputs are passed", () => {
        const { req, res } = getMockRequestAndResponse({ body: defaultDisruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);

        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(COOKIES_DISRUPTION_INFO, expect.any(String), res);

        expect(writeHeadMock).toBeCalledWith(302, { Location: "/type-of-consequence" });
    });

    it("should redirect back to /create-disruption when no form inputs are passed to the API", () => {
        const { req, res } = getMockRequestAndResponse({ body: {}, mockWriteHeadFn: writeHeadMock });
        createDisruption(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Select a disruption type", id: "disruptionType" },
            { errorMessage: "Enter a summary for this disruption", id: "summary" },
            { errorMessage: "Enter a description for this disruption", id: "description" },
            { errorMessage: "Select a reason from the dropdown", id: "disruptionReason" },
            { errorMessage: "Enter a start date for the disruption", id: "disruptionStartDate" },
            { errorMessage: "Enter a start time for the disruption", id: "disruptionStartTime" },
            { errorMessage: "Select yes or no", id: "disruptionRepeats" },
            { errorMessage: "Enter a publish start date for the disruption", id: "publishStartDate" },
            { errorMessage: "Enter a publish start time for the disruption", id: "publishStartTime" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify({ inputs: req.body, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });

    it("should redirect back to /create-disruption when summary or description are too long", () => {
        const disruptionData: DisruptionPageInputs = {
            ...defaultDisruptionData,
            summary:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Summary must not exceed 100 characters", id: "summary" },
            { errorMessage: "Description must not exceed 500 characters", id: "description" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify({ inputs: req.body, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });

    it("should redirect back to /create-disruption when invalid reason passed", () => {
        const disruptionData = {
            ...defaultDisruptionData,
            disruptionReason: "Incorrect Value",
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);

        const errors: ErrorInfo[] = [{ errorMessage: "Select a reason from the dropdown", id: "disruptionReason" }];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify({ inputs: req.body, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });

    it("should redirect back to /create-disruption when invalid URL passed for associated link", () => {
        const disruptionData: DisruptionPageInputs = {
            ...defaultDisruptionData,
            associatedLink: "http://test<>/",
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);

        const errors: ErrorInfo[] = [{ errorMessage: "Associated link must be a valid URL", id: "associatedLink" }];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify({ inputs: req.body, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });

    it("should redirect back to /create-disruption when end date is before start date", () => {
        const disruptionStartDate = getFutureDateAsString(12, CD_DATE_FORMAT);
        const disruptionEndDate = getFutureDateAsString(7, CD_DATE_FORMAT);
        const publishStartDate = getFutureDateAsString(12, CD_DATE_FORMAT);
        const publishEndDate = getFutureDateAsString(4, CD_DATE_FORMAT);

        const disruptionData: DisruptionPageInputs = {
            ...defaultDisruptionData,
            disruptionStartDate,
            disruptionEndDate,
            publishStartDate,
            publishEndDate,
            publishEndTime: "1200",
            publishNoEndDateTime: "",
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Disruption end datetime must be after start datetime", id: "disruptionEndDate" },
            { errorMessage: "Publish end datetime must be after start datetime", id: "publishEndDate" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify({ inputs: req.body, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });

    it("should redirect back to /create-disruption if end times have not been entered with dates", () => {
        const publishEndDate = getFutureDateAsString(15, CD_DATE_FORMAT);

        const disruptionData: DisruptionPageInputs = {
            ...defaultDisruptionData,
            disruptionEndDate: "",
            publishEndDate: publishEndDate,
            publishEndTime: "",
            publishNoEndDateTime: "",
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Disruption end date must be set when end time is set", id: "disruptionEndDate" },
            { errorMessage: "Publish end time must be set when end date is set", id: "publishEndTime" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify({ inputs: req.body, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });

    it("should redirect back to /create-disruption if end date entered and 'No end date/time' is selected", () => {
        const disruptionData: DisruptionPageInputs = {
            ...defaultDisruptionData,
            disruptionNoEndDateTime: "true",
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);

        const errors: ErrorInfo[] = [
            {
                errorMessage:
                    '"No end date/time" should not be selected when a disruption date and time have been entered',
                id: "disruptionNoEndDateTime",
            },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify({ inputs: req.body, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });

    it("should redirect back to /create-disruption if invalid dates or times entered", () => {
        const disruptionData: DisruptionPageInputs = {
            ...defaultDisruptionData,
            disruptionStartDate: "invalidDate",
            disruptionEndDate: "",
            disruptionEndTime: "",
            disruptionNoEndDateTime: "true",
            publishStartTime: "2410",
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Enter a start date for the disruption", id: "disruptionStartDate" },
            { errorMessage: "Enter a publish start time for the disruption", id: "publishStartTime" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify({ inputs: req.body, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });
});
