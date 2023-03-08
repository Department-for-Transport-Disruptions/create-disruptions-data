/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { describe, it, expect, afterEach, vi } from "vitest";
import createDisruption from "../api/createDisruption";
import { getMockRequestAndResponse } from "../../testData/mockData";
import { PageInputs } from "../../pages/create-disruption";
import dayjs from "dayjs";
import { CD_DATE_FORMAT } from "../../constants/index";
import { MiscellaneousReason } from "@create-disruptions-data/shared-ts/siriTypes";
import * as apiUtils from "../../utils/apiUtils";

import { COOKIES_DISRUPTION_ERRORS, COOKIES_DISRUPTION_INFO, TEN_SECONDS_IN_MILLISECONDS } from "../../constants";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { ErrorInfo } from "../../interfaces";

dayjs.extend(customParseFormat);

const getFutureDateAsString = (addDays: number, dateFormat: string) => {
    return dayjs().add(addDays, "day").format(dateFormat).toString();
};

const getStringToDate = (date: string, dateFormat: string): Date => {
    return dayjs(date, dateFormat, true).toDate();
};

describe("createDisruption", () => {
    const writeHeadMock = vi.fn();
    const setCookieSpy = vi.spyOn(apiUtils, "setCookieOnResponseObject");
    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should redirect back to homepage (/) when all required inputs are passed", () => {
        const disruptionStartDate = getFutureDateAsString(2, CD_DATE_FORMAT);
        const disruptionEndDate = getFutureDateAsString(5, CD_DATE_FORMAT);
        const publishStartDate = getFutureDateAsString(2, CD_DATE_FORMAT);
        const disruptionData: PageInputs = {
            typeOfDisruption: "unplanned",
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
            publishIsNoEndDateTime: "publishNoEndDateTime",
            disruptionRepeats: "yes",
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);
        disruptionData["disruption-start-date"] = getStringToDate(disruptionStartDate, CD_DATE_FORMAT);
        disruptionData["disruption-end-date"] = getStringToDate(disruptionEndDate, CD_DATE_FORMAT);
        disruptionData["publish-start-date"] = getStringToDate(publishStartDate, CD_DATE_FORMAT);

        expect(setCookieSpy).toHaveBeenCalledTimes(1);
        expect(setCookieSpy).toHaveBeenCalledWith(
            COOKIES_DISRUPTION_INFO,
            expect.any(String),
            res,
            TEN_SECONDS_IN_MILLISECONDS,
            false,
        );

        expect(writeHeadMock).toBeCalledWith(302, { Location: "/" });
    });

    it("should redirect back to itself (i.e. /create-disruption) when no form inputs are passed to the API", () => {
        const { req, res } = getMockRequestAndResponse({ body: {}, mockWriteHeadFn: writeHeadMock });
        createDisruption(req, res);

        const disruptionData: PageInputs = {
            typeOfDisruption: undefined,
            summary: undefined,
            description: undefined,
            "associated-link": undefined,
            "disruption-reason": "",
            "disruption-start-date": undefined,
            "disruption-end-date": undefined,
            "disruption-start-time": undefined,
            "disruption-end-time": undefined,
            disruptionIsNoEndDateTime: undefined,
            "publish-start-date": undefined,
            "publish-end-date": undefined,
            "publish-start-time": undefined,
            "publish-end-time": undefined,
            publishIsNoEndDateTime: undefined,
            disruptionRepeats: undefined,
        };

        const errors: ErrorInfo[] = [
            {
                id: "some-error-id",
                errorMessage: "Please choose a Type of Disruption",
            },
            { id: "some-error-id", errorMessage: "Please enter a Summary" },
            { id: "some-error-id", errorMessage: "Please enter a Description" },
            {
                id: "some-error-id",
                errorMessage: "Please choose a Reason from the dropdown",
            },
            {
                id: "some-error-id",
                errorMessage: "No Start date selected. Please select a valid Start date",
            },
            {
                id: "some-error-id",
                errorMessage: "No Start time entered. Please select a valid Start time",
            },
            {
                id: "some-error-id",
                errorMessage: "No End date selected. Please select a valid End date",
            },
            {
                id: "some-error-id",
                errorMessage: "No End time entered. Please select a valid End time",
            },
            {
                id: "some-error-id",
                errorMessage: "No Start date selected. Please select a valid Start date",
            },
            {
                id: "some-error-id",
                errorMessage: "No Start time entered. Please select a valid Start time",
            },
            {
                id: "some-error-id",
                errorMessage: "No End date selected. Please select a valid End date",
            },
            {
                id: "some-error-id",
                errorMessage: "No End time entered. Please select a valid End time",
            },
        ];
        expect(setCookieSpy).toHaveBeenCalledTimes(2);
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            1,
            COOKIES_DISRUPTION_INFO,
            expect.any(String),
            res,
            TEN_SECONDS_IN_MILLISECONDS,
            false,
        );
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            2,
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify(errors),
            res,
            TEN_SECONDS_IN_MILLISECONDS,
            false,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });

    it("should redirect back to itself (i.e. /create-disruption) with length validation error for Summary and Disruption", () => {
        const disruptionStartDate = getFutureDateAsString(2, CD_DATE_FORMAT);
        const publishEndDate = getFutureDateAsString(5, CD_DATE_FORMAT);
        const publishStartDate = getFutureDateAsString(2, CD_DATE_FORMAT);

        const disruptionData: PageInputs = {
            typeOfDisruption: "planned",
            summary:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            "associated-link": "",
            "disruption-reason": MiscellaneousReason.roadWorks,
            "disruption-start-date": disruptionStartDate,
            "disruption-start-time": "1000",
            "publish-start-date": publishStartDate,
            "publish-start-time": "1100",
            "publish-end-date": publishEndDate,
            "publish-end-time": "1000",
            disruptionIsNoEndDateTime: "disruptionNoEndDateTime",
            disruptionRepeats: "yes",
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);

        disruptionData["disruption-start-date"] = getStringToDate(disruptionStartDate, CD_DATE_FORMAT);
        disruptionData["publish-end-date"] = getStringToDate(publishEndDate, CD_DATE_FORMAT);
        disruptionData["publish-start-date"] = getStringToDate(publishStartDate, CD_DATE_FORMAT);

        const errors: ErrorInfo[] = [
            {
                id: "some-error-id",
                errorMessage: "Please enter a Summary of less than 100 characters",
            },
            {
                id: "some-error-id",
                errorMessage: "Please enter a Description of less than 200 characters",
            },
        ];
        expect(setCookieSpy).toHaveBeenCalledTimes(2);
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            1,
            COOKIES_DISRUPTION_INFO,
            expect.any(String),
            res,
            TEN_SECONDS_IN_MILLISECONDS,
            false,
        );
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            2,
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify(errors),
            res,
            TEN_SECONDS_IN_MILLISECONDS,
            false,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });

    it("should redirect back to itself (i.e. /create-disruption) with incorrect value error for Disruption reason dropdown", () => {
        const disruptionStartDate = getFutureDateAsString(10, CD_DATE_FORMAT);
        const disruptionEndDate = getFutureDateAsString(15, CD_DATE_FORMAT);
        const publishStartDate = getFutureDateAsString(12, CD_DATE_FORMAT);

        const disruptionData: PageInputs = {
            typeOfDisruption: "planned",
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
            publishIsNoEndDateTime: "publishNoEndDateTime",
            disruptionRepeats: "yes",
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);

        disruptionData["disruption-start-date"] = getStringToDate(disruptionStartDate, CD_DATE_FORMAT);
        disruptionData["disruption-end-date"] = getStringToDate(disruptionEndDate, CD_DATE_FORMAT);
        disruptionData["publish-start-date"] = getStringToDate(publishStartDate, CD_DATE_FORMAT);

        const errors: ErrorInfo[] = [
            {
                id: "some-error-id",
                errorMessage: "Invalid value provided for Reason for Disruption",
            },
        ];
        expect(setCookieSpy).toHaveBeenCalledTimes(2);
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            1,
            COOKIES_DISRUPTION_INFO,
            expect.any(String),
            res,
            TEN_SECONDS_IN_MILLISECONDS,
            false,
        );
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            2,
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify(errors),
            res,
            TEN_SECONDS_IN_MILLISECONDS,
            false,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });

    it("should redirect back to itself (i.e. /create-disruption) with validation error for invalid URL", () => {
        const disruptionStartDate = getFutureDateAsString(10, CD_DATE_FORMAT);
        const disruptionEndDate = getFutureDateAsString(15, CD_DATE_FORMAT);
        const publishStartDate = getFutureDateAsString(12, CD_DATE_FORMAT);

        const disruptionData: PageInputs = {
            typeOfDisruption: "planned",
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
            publishIsNoEndDateTime: "publishNoEndDateTime",
            disruptionRepeats: "yes",
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);

        disruptionData["disruption-start-date"] = getStringToDate(disruptionStartDate, CD_DATE_FORMAT);
        disruptionData["disruption-end-date"] = getStringToDate(disruptionEndDate, CD_DATE_FORMAT);
        disruptionData["publish-start-date"] = getStringToDate(publishStartDate, CD_DATE_FORMAT);

        const errors: ErrorInfo[] = [
            {
                id: "some-error-id",
                errorMessage: "The URL is malformed. Please enter a valid URL",
            },
        ];
        expect(setCookieSpy).toHaveBeenCalledTimes(2);
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            1,
            COOKIES_DISRUPTION_INFO,
            expect.any(String),
            res,
            TEN_SECONDS_IN_MILLISECONDS,
            false,
        );
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            2,
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify(errors),
            res,
            TEN_SECONDS_IN_MILLISECONDS,
            false,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });

    it("should redirect back to itself (i.e. /create-disruption) with error indicating start and end date are in the past for disruption dates", () => {
        const disruptionStartDate = dayjs().subtract(2, "day").format(CD_DATE_FORMAT).toString();
        const disruptionEndDate = dayjs().subtract(1, "day").format(CD_DATE_FORMAT).toString();
        const publishStartDate = getFutureDateAsString(12, CD_DATE_FORMAT);

        const disruptionData: PageInputs = {
            typeOfDisruption: "planned",
            summary: "Lorem ipsum dolor sit amet",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            "associated-link": "",
            "disruption-reason": MiscellaneousReason.roadWorks,
            "disruption-start-date": disruptionStartDate.toString(),
            "disruption-end-date": disruptionEndDate,
            "disruption-start-time": "1000",
            "disruption-end-time": "1100",
            "publish-start-date": publishStartDate,
            "publish-start-time": "1100",
            publishIsNoEndDateTime: "publishNoEndDateTime",
            disruptionRepeats: "yes",
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);

        disruptionData["disruption-start-date"] = getStringToDate(disruptionStartDate, CD_DATE_FORMAT);
        disruptionData["disruption-end-date"] = getStringToDate(disruptionEndDate, CD_DATE_FORMAT);
        disruptionData["publish-start-date"] = getStringToDate(publishStartDate, CD_DATE_FORMAT);

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
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            1,
            COOKIES_DISRUPTION_INFO,
            expect.any(String),
            res,
            TEN_SECONDS_IN_MILLISECONDS,
            false,
        );
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            2,
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify(errors),
            res,
            TEN_SECONDS_IN_MILLISECONDS,
            false,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });

    it("should redirect back to itself (i.e. /create-disruption) with error indicating start and end date are in the past for published dates", () => {
        const disruptionStartDate = getFutureDateAsString(12, CD_DATE_FORMAT);
        const disruptionEndDate = getFutureDateAsString(15, CD_DATE_FORMAT);
        const publishStartDate = dayjs().subtract(4, "day").format(CD_DATE_FORMAT).toString();
        const publishEndDate = dayjs().subtract(2, "day").format(CD_DATE_FORMAT).toString();

        const disruptionData: PageInputs = {
            typeOfDisruption: "planned",
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
            disruptionRepeats: "yes",
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);

        disruptionData["disruption-start-date"] = getStringToDate(disruptionStartDate, CD_DATE_FORMAT);
        disruptionData["disruption-end-date"] = getStringToDate(disruptionEndDate, CD_DATE_FORMAT);
        disruptionData["publish-start-date"] = getStringToDate(publishStartDate, CD_DATE_FORMAT);
        disruptionData["publish-end-date"] = getStringToDate(publishEndDate, CD_DATE_FORMAT);

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
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            1,
            COOKIES_DISRUPTION_INFO,
            expect.any(String),
            res,
            TEN_SECONDS_IN_MILLISECONDS,
            false,
        );
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            2,
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify(errors),
            res,
            TEN_SECONDS_IN_MILLISECONDS,
            false,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });

    it("should redirect back to itself (i.e. /create-disruption) to show that start date should be prior to end date for disruption dates", () => {
        const disruptionStartDate = getFutureDateAsString(12, CD_DATE_FORMAT);
        const disruptionEndDate = getFutureDateAsString(7, CD_DATE_FORMAT);
        const publishStartDate = getFutureDateAsString(12, CD_DATE_FORMAT);
        const publishEndDate = getFutureDateAsString(15, CD_DATE_FORMAT);

        const disruptionData: PageInputs = {
            typeOfDisruption: "planned",
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
            disruptionRepeats: "yes",
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);

        disruptionData["disruption-start-date"] = getStringToDate(disruptionStartDate, CD_DATE_FORMAT);
        disruptionData["disruption-end-date"] = getStringToDate(disruptionEndDate, CD_DATE_FORMAT);
        disruptionData["publish-start-date"] = getStringToDate(publishStartDate, CD_DATE_FORMAT);
        disruptionData["publish-end-date"] = getStringToDate(publishEndDate, CD_DATE_FORMAT);

        const errors: ErrorInfo[] = [
            {
                id: "some-error-id",
                errorMessage:
                    "End Date and time cannot be before the  Start Date and time. Please update End Date and time",
            },
        ];
        expect(setCookieSpy).toHaveBeenCalledTimes(2);
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            1,
            COOKIES_DISRUPTION_INFO,
            expect.any(String),
            res,
            TEN_SECONDS_IN_MILLISECONDS,
            false,
        );
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            2,
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify(errors),
            res,
            TEN_SECONDS_IN_MILLISECONDS,
            false,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });

    it("should redirect back to itself (i.e. /create-disruption) to show that start date should be prior to end date for published dates", () => {
        const disruptionStartDate = getFutureDateAsString(12, CD_DATE_FORMAT);
        const disruptionEndDate = getFutureDateAsString(5, CD_DATE_FORMAT);
        const publishStartDate = getFutureDateAsString(7, CD_DATE_FORMAT);
        const publishEndDate = getFutureDateAsString(12, CD_DATE_FORMAT);

        const disruptionData: PageInputs = {
            typeOfDisruption: "planned",
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
            disruptionRepeats: "yes",
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);

        disruptionData["disruption-start-date"] = getStringToDate(disruptionStartDate, CD_DATE_FORMAT);
        disruptionData["disruption-end-date"] = getStringToDate(disruptionEndDate, CD_DATE_FORMAT);
        disruptionData["publish-start-date"] = getStringToDate(publishStartDate, CD_DATE_FORMAT);
        disruptionData["publish-end-date"] = getStringToDate(publishEndDate, CD_DATE_FORMAT);

        const errors: ErrorInfo[] = [
            {
                id: "some-error-id",
                errorMessage:
                    "End Date and time cannot be before the  Start Date and time. Please update End Date and time",
            },
        ];
        expect(setCookieSpy).toHaveBeenCalledTimes(2);
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            1,
            COOKIES_DISRUPTION_INFO,
            expect.any(String),
            res,
            TEN_SECONDS_IN_MILLISECONDS,
            false,
        );
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            2,
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify(errors),
            res,
            TEN_SECONDS_IN_MILLISECONDS,
            false,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });

    it("should redirect back to itself (i.e. /create-disruption)as start time and end time are required when respective dates are passed for disruption dates", () => {
        const disruptionStartDate = getFutureDateAsString(12, CD_DATE_FORMAT);
        const disruptionEndDate = getFutureDateAsString(17, CD_DATE_FORMAT);
        const publishStartDate = getFutureDateAsString(12, CD_DATE_FORMAT);
        const publishEndDate = getFutureDateAsString(15, CD_DATE_FORMAT);

        const disruptionData: PageInputs = {
            typeOfDisruption: "planned",
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
            disruptionRepeats: "yes",
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);

        disruptionData["disruption-start-date"] = getStringToDate(disruptionStartDate, CD_DATE_FORMAT);
        disruptionData["disruption-end-date"] = getStringToDate(disruptionEndDate, CD_DATE_FORMAT);
        disruptionData["publish-start-date"] = getStringToDate(publishStartDate, CD_DATE_FORMAT);
        disruptionData["publish-end-date"] = getStringToDate(publishEndDate, CD_DATE_FORMAT);

        const errors: ErrorInfo[] = [
            {
                id: "some-error-id",
                errorMessage: "No Start time entered. Please select a valid Start time",
            },
            {
                id: "some-error-id",
                errorMessage: "No End time entered. Please select a valid End time",
            },
        ];
        expect(setCookieSpy).toHaveBeenCalledTimes(2);
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            1,
            COOKIES_DISRUPTION_INFO,
            expect.any(String),
            res,
            TEN_SECONDS_IN_MILLISECONDS,
            false,
        );
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            2,
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify(errors),
            res,
            TEN_SECONDS_IN_MILLISECONDS,
            false,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });

    it("should redirect back to itself (i.e. /create-disruption) as start time and end time are required when respective dates are passed for published dates", () => {
        const disruptionStartDate = getFutureDateAsString(12, CD_DATE_FORMAT);
        const disruptionEndDate = getFutureDateAsString(15, CD_DATE_FORMAT);
        const publishStartDate = getFutureDateAsString(7, CD_DATE_FORMAT);
        const publishEndDate = getFutureDateAsString(12, CD_DATE_FORMAT);

        const disruptionData: PageInputs = {
            typeOfDisruption: "planned",
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
            disruptionRepeats: "yes",
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);

        disruptionData["disruption-start-date"] = getStringToDate(disruptionStartDate, CD_DATE_FORMAT);
        disruptionData["disruption-end-date"] = getStringToDate(disruptionEndDate, CD_DATE_FORMAT);
        disruptionData["publish-start-date"] = getStringToDate(publishStartDate, CD_DATE_FORMAT);
        disruptionData["publish-end-date"] = getStringToDate(publishEndDate, CD_DATE_FORMAT);

        const errors: ErrorInfo[] = [
            {
                id: "some-error-id",
                errorMessage: "No Start time entered. Please select a valid Start time",
            },
            {
                id: "some-error-id",
                errorMessage: "No End time entered. Please select a valid End time",
            },
        ];
        expect(setCookieSpy).toHaveBeenCalledTimes(2);
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            1,
            COOKIES_DISRUPTION_INFO,
            expect.any(String),
            res,
            TEN_SECONDS_IN_MILLISECONDS,
            false,
        );
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            2,
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify(errors),
            res,
            TEN_SECONDS_IN_MILLISECONDS,
            false,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });

    it("should redirect back to itself (i.e. /create-disruption) if non numberic values are passed for time", () => {
        const disruptionStartDate = getFutureDateAsString(12, CD_DATE_FORMAT);
        const disruptionEndDate = getFutureDateAsString(15, CD_DATE_FORMAT);
        const publishStartDate = getFutureDateAsString(7, CD_DATE_FORMAT);
        const publishEndDate = getFutureDateAsString(12, CD_DATE_FORMAT);

        const disruptionData: PageInputs = {
            typeOfDisruption: "planned",
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
            disruptionRepeats: "yes",
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);

        disruptionData["disruption-start-date"] = getStringToDate(disruptionStartDate, CD_DATE_FORMAT);
        disruptionData["disruption-end-date"] = getStringToDate(disruptionEndDate, CD_DATE_FORMAT);
        disruptionData["publish-start-date"] = getStringToDate(publishStartDate, CD_DATE_FORMAT);
        disruptionData["publish-end-date"] = getStringToDate(publishEndDate, CD_DATE_FORMAT);

        const errors: ErrorInfo[] = [
            {
                id: "some-error-id",
                errorMessage:
                    "Value for End time is not a Number. Please enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm",
            },
        ];
        expect(setCookieSpy).toHaveBeenCalledTimes(2);
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            1,
            COOKIES_DISRUPTION_INFO,
            expect.any(String),
            res,
            TEN_SECONDS_IN_MILLISECONDS,
            false,
        );
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            2,
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify(errors),
            res,
            TEN_SECONDS_IN_MILLISECONDS,
            false,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });

    it("should redirect back to itself (i.e. /create-disruption) if time format entered is not for format hhmm", () => {
        const disruptionStartDate = getFutureDateAsString(12, CD_DATE_FORMAT);
        const disruptionEndDate = getFutureDateAsString(15, CD_DATE_FORMAT);
        const publishStartDate = getFutureDateAsString(7, CD_DATE_FORMAT);
        const publishEndDate = getFutureDateAsString(12, CD_DATE_FORMAT);

        const disruptionData: PageInputs = {
            typeOfDisruption: "planned",
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
            disruptionRepeats: "yes",
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);

        disruptionData["disruption-start-date"] = getStringToDate(disruptionStartDate, CD_DATE_FORMAT);
        disruptionData["disruption-end-date"] = getStringToDate(disruptionEndDate, CD_DATE_FORMAT);
        disruptionData["publish-start-date"] = getStringToDate(publishStartDate, CD_DATE_FORMAT);
        disruptionData["publish-end-date"] = getStringToDate(publishEndDate, CD_DATE_FORMAT);

        const errors: ErrorInfo[] = [
            {
                id: "some-error-id",
                errorMessage:
                    "Value for Start time is of invalid format. Please enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm",
            },
        ];
        expect(setCookieSpy).toHaveBeenCalledTimes(2);
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            1,
            COOKIES_DISRUPTION_INFO,
            expect.any(String),
            res,
            TEN_SECONDS_IN_MILLISECONDS,
            false,
        );
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            2,
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify(errors),
            res,
            TEN_SECONDS_IN_MILLISECONDS,
            false,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });
});
