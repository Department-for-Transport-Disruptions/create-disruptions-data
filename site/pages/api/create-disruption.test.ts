/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { MiscellaneousReason } from "@create-disruptions-data/shared-ts/enums";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { describe, it, expect, afterEach, vi } from "vitest";
import createDisruption from "./create-disruption.api";
import { COOKIES_DISRUPTION_ERRORS, COOKIES_DISRUPTION_INFO, CD_DATE_FORMAT } from "../../constants";
import { ErrorInfo } from "../../interfaces";
import { getMockRequestAndResponse } from "../../testData/mockData";
import * as apiUtils from "../../utils/apiUtils";
import { DisruptionPageInputs } from "../create-disruption.page";

dayjs.extend(customParseFormat);

const getFutureDateAsString = (addDays: number, dateFormat: string) => {
    return dayjs().add(addDays, "day").format(dateFormat).toString();
};

const formatDate = (date: string, dateFormat: string): string => {
    return dayjs(date, dateFormat, true).toString();
};

describe("createDisruption", () => {
    const writeHeadMock = vi.fn();
    const setCookieSpy = vi.spyOn(apiUtils, "setCookieOnResponseObject");
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setCookieSpy.mockImplementation(() => {});
    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should redirect back to homepage (/) when all required inputs are passed", () => {
        const disruptionStartDate = getFutureDateAsString(2, CD_DATE_FORMAT);
        const disruptionEndDate = getFutureDateAsString(5, CD_DATE_FORMAT);
        const publishStartDate = getFutureDateAsString(2, CD_DATE_FORMAT);
        const disruptionData: DisruptionPageInputs = {
            "type-of-disruption": "unplanned",
            summary: "Lorem ipsum dolor sit amet",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            "associated-link": "",
            "disruption-reason": MiscellaneousReason.roadWorks,
            "disruption-start-date": disruptionStartDate,
            "disruption-end-date": disruptionEndDate,
            "disruption-start-time": "1000",
            "disruption-end-time": "1100",
            "publish-start-date": publishStartDate,
            "publish-start-time": "1100",
            "publish-end-date": disruptionEndDate,
            "publish-end-time": "1100",
            validity: [],
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);
        disruptionData["disruption-start-date"] = formatDate(disruptionStartDate, CD_DATE_FORMAT);
        disruptionData["disruption-end-date"] = formatDate(disruptionEndDate, CD_DATE_FORMAT);
        disruptionData["publish-start-date"] = formatDate(publishStartDate, CD_DATE_FORMAT);

        expect(setCookieSpy).toHaveBeenCalledTimes(1);
        expect(setCookieSpy).toHaveBeenCalledWith(COOKIES_DISRUPTION_INFO, expect.any(String), res);

        expect(writeHeadMock).toBeCalledWith(302, { Location: "/" });
    });

    it("should redirect back to itself (i.e. /create-disruption) when no form inputs are passed to the API", () => {
        const { req, res } = getMockRequestAndResponse({ body: {}, mockWriteHeadFn: writeHeadMock });
        createDisruption(req, res);

        const errors: ErrorInfo[] = [
            { id: "some-error-id", errorMessage: "Choose a Type of Disruption" },
            { id: "some-error-id", errorMessage: "Enter a summary for this disruption" },
            { id: "some-error-id", errorMessage: "Enter a description for this disruption (200 characters maximum)" },
            { id: "some-error-id", errorMessage: "Select a reason from the dropdown" },
            { id: "some-error-id", errorMessage: "No Start date selected. Select a valid Start date" },
            { id: "some-error-id", errorMessage: "No Start time entered. Select a valid Start time" },
            { id: "some-error-id", errorMessage: "No End date selected. Select a valid End date" },
            { id: "some-error-id", errorMessage: "No End time entered. Select a valid End time" },
            { id: "some-error-id", errorMessage: "No Start date selected. Select a valid Start date" },
            { id: "some-error-id", errorMessage: "No Start time entered. Select a valid Start time" },
            { id: "some-error-id", errorMessage: "No End date selected. Select a valid End date" },
            { id: "some-error-id", errorMessage: "No End time entered. Select a valid End time" },
        ];
        expect(setCookieSpy).toHaveBeenCalledTimes(2);
        expect(setCookieSpy).toHaveBeenNthCalledWith(1, COOKIES_DISRUPTION_INFO, expect.any(String), res);
        expect(setCookieSpy).toHaveBeenNthCalledWith(2, COOKIES_DISRUPTION_ERRORS, JSON.stringify(errors), res);
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });

    it("should redirect back to itself (i.e. /create-disruption) with length validation error for Summary and Disruption", () => {
        const disruptionStartDate = getFutureDateAsString(2, CD_DATE_FORMAT);
        const publishEndDate = getFutureDateAsString(5, CD_DATE_FORMAT);
        const publishStartDate = getFutureDateAsString(2, CD_DATE_FORMAT);

        const disruptionData: DisruptionPageInputs = {
            "type-of-disruption": "planned",
            summary:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            "associated-link": "",
            "disruption-reason": MiscellaneousReason.roadWorks,
            "disruption-start-date": disruptionStartDate,
            "disruption-start-time": "1000",
            "disruption-end-date": publishEndDate,
            "disruption-end-time": "1100",
            "publish-start-date": publishStartDate,
            "publish-start-time": "1100",
            "publish-end-date": publishEndDate,
            "publish-end-time": "1000",
            validity: [],
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);

        disruptionData["disruption-start-date"] = formatDate(disruptionStartDate, CD_DATE_FORMAT);
        disruptionData["publish-end-date"] = formatDate(publishEndDate, CD_DATE_FORMAT);
        disruptionData["publish-start-date"] = formatDate(publishStartDate, CD_DATE_FORMAT);

        const errors: ErrorInfo[] = [
            {
                id: "some-error-id",
                errorMessage: "Enter a Summary of less than 100 characters",
            },
            {
                id: "some-error-id",
                errorMessage: "Enter a Description of less than 200 characters",
            },
        ];
        expect(setCookieSpy).toHaveBeenCalledTimes(2);
        expect(setCookieSpy).toHaveBeenNthCalledWith(1, COOKIES_DISRUPTION_INFO, expect.any(String), res);
        expect(setCookieSpy).toHaveBeenNthCalledWith(2, COOKIES_DISRUPTION_ERRORS, JSON.stringify(errors), res);
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });

    it("should redirect back to itself (i.e. /create-disruption) with incorrect value error for Disruption reason dropdown", () => {
        const disruptionStartDate = getFutureDateAsString(10, CD_DATE_FORMAT);
        const disruptionEndDate = getFutureDateAsString(15, CD_DATE_FORMAT);
        const publishStartDate = getFutureDateAsString(12, CD_DATE_FORMAT);

        const disruptionData: DisruptionPageInputs = {
            "type-of-disruption": "planned",
            summary: "Lorem ipsum dolor sit amet",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            "associated-link": "",
            "disruption-reason": "Incorrect Value",
            "disruption-start-date": disruptionStartDate,
            "disruption-end-date": disruptionEndDate,
            "disruption-start-time": "1000",
            "disruption-end-time": "1100",
            "publish-start-date": publishStartDate,
            "publish-start-time": "1100",
            "publish-end-date": disruptionEndDate,
            "publish-end-time": "1100",
            validity: [],
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);

        disruptionData["disruption-start-date"] = formatDate(disruptionStartDate, CD_DATE_FORMAT);
        disruptionData["disruption-end-date"] = formatDate(disruptionEndDate, CD_DATE_FORMAT);
        disruptionData["publish-start-date"] = formatDate(publishStartDate, CD_DATE_FORMAT);

        const errors: ErrorInfo[] = [
            {
                id: "some-error-id",
                errorMessage: "Invalid value provided for Reason for Disruption",
            },
        ];
        expect(setCookieSpy).toHaveBeenCalledTimes(2);
        expect(setCookieSpy).toHaveBeenNthCalledWith(1, COOKIES_DISRUPTION_INFO, expect.any(String), res);
        expect(setCookieSpy).toHaveBeenNthCalledWith(2, COOKIES_DISRUPTION_ERRORS, JSON.stringify(errors), res);
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });

    it("should redirect back to itself (i.e. /create-disruption) with validation error for invalid URL", () => {
        const disruptionStartDate = getFutureDateAsString(10, CD_DATE_FORMAT);
        const disruptionEndDate = getFutureDateAsString(15, CD_DATE_FORMAT);
        const publishStartDate = getFutureDateAsString(12, CD_DATE_FORMAT);

        const disruptionData: DisruptionPageInputs = {
            "type-of-disruption": "planned",
            summary: "Lorem ipsum dolor sit amet",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            "associated-link": "http://test<>/",
            "disruption-reason": MiscellaneousReason.roadWorks,
            "disruption-start-date": disruptionStartDate,
            "disruption-end-date": disruptionEndDate,
            "disruption-start-time": "1000",
            "disruption-end-time": "1100",
            "publish-start-date": publishStartDate,
            "publish-start-time": "1100",
            "publish-end-date": disruptionEndDate,
            "publish-end-time": "1100",
            validity: [],
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);

        disruptionData["disruption-start-date"] = formatDate(disruptionStartDate, CD_DATE_FORMAT);
        disruptionData["disruption-end-date"] = formatDate(disruptionEndDate, CD_DATE_FORMAT);
        disruptionData["publish-start-date"] = formatDate(publishStartDate, CD_DATE_FORMAT);

        const errors: ErrorInfo[] = [
            {
                id: "some-error-id",
                errorMessage: "The URL is malformed. Enter a valid URL",
            },
        ];
        expect(setCookieSpy).toHaveBeenCalledTimes(2);
        expect(setCookieSpy).toHaveBeenNthCalledWith(1, COOKIES_DISRUPTION_INFO, expect.any(String), res);
        expect(setCookieSpy).toHaveBeenNthCalledWith(2, COOKIES_DISRUPTION_ERRORS, JSON.stringify(errors), res);
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });

    it("should redirect back to itself (i.e. /create-disruption) with error indicating start and end date are in the past for disruption dates", () => {
        const disruptionStartDate = dayjs().subtract(2, "day").format(CD_DATE_FORMAT).toString();
        const disruptionEndDate = dayjs().subtract(1, "day").format(CD_DATE_FORMAT).toString();
        const publishStartDate = getFutureDateAsString(12, CD_DATE_FORMAT);
        const publishEndDate = getFutureDateAsString(15, CD_DATE_FORMAT);

        const disruptionData: DisruptionPageInputs = {
            "type-of-disruption": "planned",
            summary: "Lorem ipsum dolor sit amet",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            "associated-link": "",
            "disruption-reason": MiscellaneousReason.roadWorks,
            "disruption-start-date": disruptionStartDate,
            "disruption-end-date": disruptionEndDate,
            "disruption-start-time": "1000",
            "disruption-end-time": "1100",
            "publish-start-date": publishStartDate,
            "publish-start-time": "1000",
            "publish-end-date": publishEndDate,
            "publish-end-time": "1100",
            validity: [],
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);

        disruptionData["disruption-start-date"] = formatDate(disruptionStartDate, CD_DATE_FORMAT);
        disruptionData["disruption-end-date"] = formatDate(disruptionEndDate, CD_DATE_FORMAT);
        disruptionData["publish-start-date"] = formatDate(publishStartDate, CD_DATE_FORMAT);

        const errors: ErrorInfo[] = [
            { id: "some-error-id", errorMessage: "The Start date and time should be past the current date and time" },
            { id: "some-error-id", errorMessage: "The End date and time should be past the current date and time" },
        ];
        expect(setCookieSpy).toHaveBeenCalledTimes(2);
        expect(setCookieSpy).toHaveBeenNthCalledWith(1, COOKIES_DISRUPTION_INFO, expect.any(String), res);
        expect(setCookieSpy).toHaveBeenNthCalledWith(2, COOKIES_DISRUPTION_ERRORS, JSON.stringify(errors), res);
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });

    it("should redirect back to itself (i.e. /create-disruption) with error indicating start and end date are in the past for published dates", () => {
        const disruptionStartDate = getFutureDateAsString(12, CD_DATE_FORMAT);
        const disruptionEndDate = getFutureDateAsString(15, CD_DATE_FORMAT);
        const publishStartDate = dayjs().subtract(4, "day").format(CD_DATE_FORMAT).toString();
        const publishEndDate = dayjs().subtract(2, "day").format(CD_DATE_FORMAT).toString();

        const disruptionData: DisruptionPageInputs = {
            "type-of-disruption": "planned",
            summary: "Lorem ipsum dolor sit amet",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            "associated-link": "",
            "disruption-reason": MiscellaneousReason.roadWorks,
            "disruption-start-date": disruptionStartDate,
            "disruption-end-date": disruptionEndDate,
            "disruption-start-time": "1000",
            "disruption-end-time": "1100",
            "publish-start-date": publishStartDate,
            "publish-end-date": publishEndDate,
            "publish-start-time": "1100",
            "publish-end-time": "1100",
            validity: [],
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);

        disruptionData["disruption-start-date"] = formatDate(disruptionStartDate, CD_DATE_FORMAT);
        disruptionData["disruption-end-date"] = formatDate(disruptionEndDate, CD_DATE_FORMAT);
        disruptionData["publish-start-date"] = formatDate(publishStartDate, CD_DATE_FORMAT);
        disruptionData["publish-end-date"] = formatDate(publishEndDate, CD_DATE_FORMAT);

        const errors: ErrorInfo[] = [
            {
                id: "some-error-id",
                errorMessage: "The Start date and time should be past the current date and time",
            },
            {
                id: "some-error-id",
                errorMessage: "The End date and time should be past the current date and time",
            },
        ];
        expect(setCookieSpy).toHaveBeenCalledTimes(2);
        expect(setCookieSpy).toHaveBeenNthCalledWith(1, COOKIES_DISRUPTION_INFO, expect.any(String), res);
        expect(setCookieSpy).toHaveBeenNthCalledWith(2, COOKIES_DISRUPTION_ERRORS, JSON.stringify(errors), res);
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });

    it("should redirect back to itself (i.e. /create-disruption) to show that start date should be prior to end date for disruption dates", () => {
        const disruptionStartDate = getFutureDateAsString(12, CD_DATE_FORMAT);
        const disruptionEndDate = getFutureDateAsString(7, CD_DATE_FORMAT);
        const publishStartDate = getFutureDateAsString(12, CD_DATE_FORMAT);
        const publishEndDate = getFutureDateAsString(15, CD_DATE_FORMAT);

        const disruptionData: DisruptionPageInputs = {
            "type-of-disruption": "planned",
            summary: "Lorem ipsum dolor sit amet",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            "associated-link": "",
            "disruption-reason": MiscellaneousReason.roadWorks,
            "disruption-start-date": disruptionStartDate,
            "disruption-end-date": disruptionEndDate,
            "disruption-start-time": "1000",
            "disruption-end-time": "1100",
            "publish-start-date": publishStartDate,
            "publish-end-date": publishEndDate,
            "publish-start-time": "1100",
            "publish-end-time": "1100",
            validity: [],
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);

        disruptionData["disruption-start-date"] = formatDate(disruptionStartDate, CD_DATE_FORMAT);
        disruptionData["disruption-end-date"] = formatDate(disruptionEndDate, CD_DATE_FORMAT);
        disruptionData["publish-start-date"] = formatDate(publishStartDate, CD_DATE_FORMAT);
        disruptionData["publish-end-date"] = formatDate(publishEndDate, CD_DATE_FORMAT);

        const errors: ErrorInfo[] = [
            {
                id: "some-error-id",
                errorMessage: "End Date and time cannot be before the  Start Date and time. Update End Date and time",
            },
        ];
        expect(setCookieSpy).toHaveBeenCalledTimes(2);
        expect(setCookieSpy).toHaveBeenNthCalledWith(1, COOKIES_DISRUPTION_INFO, expect.any(String), res);
        expect(setCookieSpy).toHaveBeenNthCalledWith(2, COOKIES_DISRUPTION_ERRORS, JSON.stringify(errors), res);
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });

    it("should redirect back to itself (i.e. /create-disruption) to show that start date should be prior to end date for published dates", () => {
        const disruptionStartDate = getFutureDateAsString(12, CD_DATE_FORMAT);
        const disruptionEndDate = getFutureDateAsString(5, CD_DATE_FORMAT);
        const publishStartDate = getFutureDateAsString(7, CD_DATE_FORMAT);
        const publishEndDate = getFutureDateAsString(12, CD_DATE_FORMAT);

        const disruptionData: DisruptionPageInputs = {
            "type-of-disruption": "planned",
            summary: "Lorem ipsum dolor sit amet",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            "associated-link": "",
            "disruption-reason": MiscellaneousReason.roadWorks,
            "disruption-start-date": disruptionStartDate,
            "disruption-end-date": disruptionEndDate,
            "disruption-start-time": "1000",
            "disruption-end-time": "1100",
            "publish-start-date": publishStartDate,
            "publish-end-date": publishEndDate,
            "publish-start-time": "1100",
            "publish-end-time": "1100",
            validity: [],
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);

        disruptionData["disruption-start-date"] = formatDate(disruptionStartDate, CD_DATE_FORMAT);
        disruptionData["disruption-end-date"] = formatDate(disruptionEndDate, CD_DATE_FORMAT);
        disruptionData["publish-start-date"] = formatDate(publishStartDate, CD_DATE_FORMAT);
        disruptionData["publish-end-date"] = formatDate(publishEndDate, CD_DATE_FORMAT);

        const errors: ErrorInfo[] = [
            {
                id: "some-error-id",
                errorMessage: "End Date and time cannot be before the  Start Date and time. Update End Date and time",
            },
        ];
        expect(setCookieSpy).toHaveBeenCalledTimes(2);
        expect(setCookieSpy).toHaveBeenNthCalledWith(1, COOKIES_DISRUPTION_INFO, expect.any(String), res);
        expect(setCookieSpy).toHaveBeenNthCalledWith(2, COOKIES_DISRUPTION_ERRORS, JSON.stringify(errors), res);
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });

    it("should redirect back to itself (i.e. /create-disruption)as start time and end time are required when respective dates are passed for disruption dates", () => {
        const disruptionStartDate = getFutureDateAsString(12, CD_DATE_FORMAT);
        const disruptionEndDate = getFutureDateAsString(17, CD_DATE_FORMAT);
        const publishStartDate = getFutureDateAsString(12, CD_DATE_FORMAT);
        const publishEndDate = getFutureDateAsString(15, CD_DATE_FORMAT);

        const disruptionData: DisruptionPageInputs = {
            "type-of-disruption": "planned",
            summary: "Lorem ipsum dolor sit amet",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            "associated-link": "",
            "disruption-reason": MiscellaneousReason.roadWorks,
            "disruption-start-date": disruptionStartDate,
            "disruption-end-date": disruptionEndDate,
            "disruption-start-time": "",
            "disruption-end-time": "",
            "publish-start-date": publishStartDate,
            "publish-end-date": publishEndDate,
            "publish-start-time": "1100",
            "publish-end-time": "1100",
            validity: [],
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);

        disruptionData["disruption-start-date"] = formatDate(disruptionStartDate, CD_DATE_FORMAT);
        disruptionData["disruption-end-date"] = formatDate(disruptionEndDate, CD_DATE_FORMAT);
        disruptionData["publish-start-date"] = formatDate(publishStartDate, CD_DATE_FORMAT);
        disruptionData["publish-end-date"] = formatDate(publishEndDate, CD_DATE_FORMAT);

        const errors: ErrorInfo[] = [
            {
                id: "some-error-id",
                errorMessage: "No Start time entered. Select a valid Start time",
            },
            {
                id: "some-error-id",
                errorMessage: "No End time entered. Select a valid End time",
            },
        ];
        expect(setCookieSpy).toHaveBeenCalledTimes(2);
        expect(setCookieSpy).toHaveBeenNthCalledWith(1, COOKIES_DISRUPTION_INFO, expect.any(String), res);
        expect(setCookieSpy).toHaveBeenNthCalledWith(2, COOKIES_DISRUPTION_ERRORS, JSON.stringify(errors), res);
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });

    it("should redirect back to itself (i.e. /create-disruption) as start time and end time are required when respective dates are passed for published dates", () => {
        const disruptionStartDate = getFutureDateAsString(12, CD_DATE_FORMAT);
        const disruptionEndDate = getFutureDateAsString(15, CD_DATE_FORMAT);
        const publishStartDate = getFutureDateAsString(7, CD_DATE_FORMAT);
        const publishEndDate = getFutureDateAsString(12, CD_DATE_FORMAT);

        const disruptionData: DisruptionPageInputs = {
            "type-of-disruption": "planned",
            summary: "Lorem ipsum dolor sit amet",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            "associated-link": "",
            "disruption-reason": MiscellaneousReason.roadWorks,
            "disruption-start-date": disruptionStartDate,
            "disruption-end-date": disruptionEndDate,
            "disruption-start-time": "1000",
            "disruption-end-time": "1100",
            "publish-start-date": publishStartDate,
            "publish-end-date": publishEndDate,
            "publish-start-time": "",
            "publish-end-time": "",
            validity: [],
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);

        disruptionData["disruption-start-date"] = formatDate(disruptionStartDate, CD_DATE_FORMAT);
        disruptionData["disruption-end-date"] = formatDate(disruptionEndDate, CD_DATE_FORMAT);
        disruptionData["publish-start-date"] = formatDate(publishStartDate, CD_DATE_FORMAT);
        disruptionData["publish-end-date"] = formatDate(publishEndDate, CD_DATE_FORMAT);

        const errors: ErrorInfo[] = [
            {
                id: "some-error-id",
                errorMessage: "No Start time entered. Select a valid Start time",
            },
            {
                id: "some-error-id",
                errorMessage: "No End time entered. Select a valid End time",
            },
        ];
        expect(setCookieSpy).toHaveBeenCalledTimes(2);
        expect(setCookieSpy).toHaveBeenNthCalledWith(1, COOKIES_DISRUPTION_INFO, expect.any(String), res);
        expect(setCookieSpy).toHaveBeenNthCalledWith(2, COOKIES_DISRUPTION_ERRORS, JSON.stringify(errors), res);
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });

    it("should redirect back to itself (i.e. /create-disruption) if non numberic values are passed for time", () => {
        const disruptionStartDate = getFutureDateAsString(12, CD_DATE_FORMAT);
        const disruptionEndDate = getFutureDateAsString(15, CD_DATE_FORMAT);
        const publishStartDate = getFutureDateAsString(7, CD_DATE_FORMAT);
        const publishEndDate = getFutureDateAsString(12, CD_DATE_FORMAT);

        const disruptionData: DisruptionPageInputs = {
            "type-of-disruption": "planned",
            summary: "Lorem ipsum dolor sit amet",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            "associated-link": "",
            "disruption-reason": MiscellaneousReason.roadWorks,
            "disruption-start-date": disruptionStartDate,
            "disruption-end-date": disruptionEndDate,
            "disruption-start-time": "1000",
            "disruption-end-time": "hhmm",
            "publish-start-date": publishStartDate,
            "publish-end-date": publishEndDate,
            "publish-start-time": "1000",
            "publish-end-time": "1100",
            validity: [],
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);

        disruptionData["disruption-start-date"] = formatDate(disruptionStartDate, CD_DATE_FORMAT);
        disruptionData["disruption-end-date"] = formatDate(disruptionEndDate, CD_DATE_FORMAT);
        disruptionData["publish-start-date"] = formatDate(publishStartDate, CD_DATE_FORMAT);
        disruptionData["publish-end-date"] = formatDate(publishEndDate, CD_DATE_FORMAT);

        const errors: ErrorInfo[] = [
            {
                id: "some-error-id",
                errorMessage:
                    "Value for End time is of invalid format. Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm",
            },
        ];
        expect(setCookieSpy).toHaveBeenCalledTimes(2);
        expect(setCookieSpy).toHaveBeenNthCalledWith(1, COOKIES_DISRUPTION_INFO, expect.any(String), res);
        expect(setCookieSpy).toHaveBeenNthCalledWith(2, COOKIES_DISRUPTION_ERRORS, JSON.stringify(errors), res);
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });

    it("should redirect back to itself (i.e. /create-disruption) if time format entered is not for format hhmm", () => {
        const disruptionStartDate = getFutureDateAsString(12, CD_DATE_FORMAT);
        const disruptionEndDate = getFutureDateAsString(15, CD_DATE_FORMAT);
        const publishStartDate = getFutureDateAsString(7, CD_DATE_FORMAT);
        const publishEndDate = getFutureDateAsString(12, CD_DATE_FORMAT);

        const disruptionData: DisruptionPageInputs = {
            "type-of-disruption": "planned",
            summary: "Lorem ipsum dolor sit amet",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            "associated-link": "",
            "disruption-reason": MiscellaneousReason.roadWorks,
            "disruption-start-date": disruptionStartDate,
            "disruption-end-date": disruptionEndDate,
            "disruption-start-time": "10",
            "disruption-end-time": "1100",
            "publish-start-date": publishStartDate,
            "publish-end-date": publishEndDate,
            "publish-start-time": "1000",
            "publish-end-time": "1100",
            validity: [],
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);

        disruptionData["disruption-start-date"] = formatDate(disruptionStartDate, CD_DATE_FORMAT);
        disruptionData["disruption-end-date"] = formatDate(disruptionEndDate, CD_DATE_FORMAT);
        disruptionData["publish-start-date"] = formatDate(publishStartDate, CD_DATE_FORMAT);
        disruptionData["publish-end-date"] = formatDate(publishEndDate, CD_DATE_FORMAT);

        const errors: ErrorInfo[] = [
            {
                id: "some-error-id",
                errorMessage:
                    "Value for Start time is of invalid format. Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm",
            },
        ];
        expect(setCookieSpy).toHaveBeenCalledTimes(2);
        expect(setCookieSpy).toHaveBeenNthCalledWith(1, COOKIES_DISRUPTION_INFO, expect.any(String), res);
        expect(setCookieSpy).toHaveBeenNthCalledWith(2, COOKIES_DISRUPTION_ERRORS, JSON.stringify(errors), res);
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });
});
