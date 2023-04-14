/* eslint-disable @typescript-eslint/no-unsafe-argument  */
import { MiscellaneousReason } from "@create-disruptions-data/shared-ts/enums";
import { describe, it, expect, afterEach, vi } from "vitest";
import createDisruption, { formatCreateDisruptionBody } from "./create-disruption.api";
import { COOKIES_DISRUPTION_ERRORS } from "../../constants";
import * as dynamo from "../../data/dynamo";
import { ErrorInfo } from "../../interfaces";
import { Validity, expandDisruptionRepeats } from "../../schemas/create-disruption.schema";
import { getMockRequestAndResponse } from "../../testData/mockData";
import { setCookieOnResponseObject } from "../../utils/apiUtils";
import { getFutureDateAsString } from "../../utils/dates";

const defaultDisruptionStartDate = getFutureDateAsString(2);
const defaultDisruptionEndDate = getFutureDateAsString(5);
const defaultPublishStartDate = getFutureDateAsString(1);

const defaultDisruptionId = "acde070d-8c4c-4f0d-9d8a-162843c10333";

const defaultDisruptionData = {
    disruptionId: defaultDisruptionId,
    disruptionType: "unplanned",
    summary: "Lorem ipsum dolor sit amet",
    description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    associatedLink: "",
    disruptionReason: MiscellaneousReason.roadworks,
    publishStartDate: defaultPublishStartDate,
    publishStartTime: "1100",
    publishEndDate: "",
    publishEndTime: "",
    disruptionStartDate: defaultDisruptionEndDate,
    disruptionStartTime: "1100",
    disruptionEndDate: "",
    disruptionEndTime: "",
    disruptionNoEndDateTime: "true",
    validity1: [defaultDisruptionStartDate, "1100", defaultDisruptionEndDate, "1000", ""],
};

describe("create-disruption API", () => {
    const writeHeadMock = vi.fn();
    vi.mock("../../utils/apiUtils", async () => ({
        ...(await vi.importActual<object>("../../utils/apiUtils")),
        setCookieOnResponseObject: vi.fn(),
        destroyCookieOnResponseObject: vi.fn(),
    }));

    const upsertDisruptionSpy = vi.spyOn(dynamo, "upsertDisruptionInfo");
    vi.mock("../../data/dynamo", () => ({
        upsertDisruptionInfo: vi.fn(),
    }));

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should redirect to /type-of-consequence when all required inputs are passed", async () => {
        const { req, res } = getMockRequestAndResponse({ body: defaultDisruptionData, mockWriteHeadFn: writeHeadMock });

        await createDisruption(req, res);

        expect(upsertDisruptionSpy).toHaveBeenCalledTimes(1);
        expect(upsertDisruptionSpy).toHaveBeenCalledWith({
            disruptionId: defaultDisruptionId,
            disruptionType: "unplanned",
            summary: "Lorem ipsum dolor sit amet",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            associatedLink: "",
            disruptionReason: MiscellaneousReason.roadworks,
            publishStartDate: defaultPublishStartDate,
            publishStartTime: "1100",
            publishEndDate: "",
            publishEndTime: "",
            disruptionStartDate: defaultDisruptionEndDate,
            disruptionStartTime: "1100",
            disruptionEndDate: "",
            disruptionEndTime: "",
            disruptionNoEndDateTime: "true",
            validity: [
                {
                    disruptionStartDate: defaultDisruptionStartDate,
                    disruptionStartTime: "1100",
                    disruptionEndDate: defaultDisruptionEndDate,
                    disruptionEndTime: "1000",
                    disruptionNoEndDateTime: "",
                },
            ],
        });
        expect(writeHeadMock).toBeCalledWith(302, { Location: `/type-of-consequence/${defaultDisruptionId}/0` });
    });

    it("should redirect back to /create-disruption when no form inputs are passed to the API", async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { disruptionId: defaultDisruptionId },
            mockWriteHeadFn: writeHeadMock,
        });
        await createDisruption(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Select a disruption type", id: "disruptionType" },
            { errorMessage: "Enter a summary for this disruption", id: "summary" },
            { errorMessage: "Enter a description for this disruption", id: "description" },
            { errorMessage: "Select a reason from the dropdown", id: "disruptionReason" },
            { errorMessage: "Enter a publish start date for the disruption", id: "publishStartDate" },
            { errorMessage: "Enter a publish start time for the disruption", id: "publishStartTime" },
            { errorMessage: "Enter a validity start date for the disruption", id: "disruptionStartDate" },
            { errorMessage: "Enter a validity start time for the disruption", id: "disruptionStartTime" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);

        const inputs = formatCreateDisruptionBody(req.body);

        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify({ inputs, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: `/create-disruption/${defaultDisruptionId}` });
    });

    it("should redirect back to /create-disruption when summary or description are too long", async () => {
        const disruptionData = {
            ...defaultDisruptionData,
            summary:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        await createDisruption(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Summary must not exceed 100 characters", id: "summary" },
            { errorMessage: "Description must not exceed 500 characters", id: "description" },
        ];

        const inputs = formatCreateDisruptionBody(req.body);

        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify({ inputs, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: `/create-disruption/${defaultDisruptionId}` });
    });

    it("should redirect back to /create-disruption when invalid reason passed", async () => {
        const disruptionData = {
            ...defaultDisruptionData,
            disruptionReason: "Incorrect Value",
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        await createDisruption(req, res);

        const errors: ErrorInfo[] = [{ errorMessage: "Select a reason from the dropdown", id: "disruptionReason" }];
        const inputs = formatCreateDisruptionBody(req.body);

        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify({ inputs, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: `/create-disruption/${defaultDisruptionId}` });
    });

    it("should redirect back to /create-disruption when invalid URL passed for associated link", async () => {
        const disruptionData = {
            ...defaultDisruptionData,
            associatedLink: "http://google.com<>/",
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        await createDisruption(req, res);

        const inputs = formatCreateDisruptionBody(req.body);

        const errors: ErrorInfo[] = [{ errorMessage: "Associated link must be a valid URL", id: "associatedLink" }];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify({ inputs, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: `/create-disruption/${defaultDisruptionId}` });
    });

    it("should redirect back to /create-disruption when validity has duplicates/overlaps", async () => {
        const disruptionData = {
            ...defaultDisruptionData,
            validity2: [defaultDisruptionStartDate, "1100", defaultDisruptionEndDate, "1000", ""],
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        await createDisruption(req, res);

        const inputs = formatCreateDisruptionBody(req.body);

        const errors: ErrorInfo[] = [{ errorMessage: "Validity periods cannot overlap", id: "disruptionStartDate" }];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify({ inputs, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: `/create-disruption/${defaultDisruptionId}` });
    });

    it("should redirect back to /create-disruption when validity has end date/time empty not in the last position", async () => {
        const disruptionData = {
            ...defaultDisruptionData,
            validity1: [getFutureDateAsString(10), "1200", "", "", "true"],
            validity2: [getFutureDateAsString(7), "1100", getFutureDateAsString(8), "1000", ""],
        };
        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        await createDisruption(req, res);

        const inputs = formatCreateDisruptionBody(req.body);

        const errors: ErrorInfo[] = [
            { errorMessage: "A validity period with no end time must be the last validity", id: "disruptionStartDate" },
            { errorMessage: "Validity periods cannot overlap", id: "disruptionStartDate" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify({ inputs, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: `/create-disruption/${defaultDisruptionId}` });
    });

    it("should redirect back to /create-disruption when disruption repeats daily but no ending on date is provided", async () => {
        const disruptionData = {
            ...defaultDisruptionData,
            disruptionEndDate: defaultDisruptionEndDate,
            disruptionEndTime: "1200",
            disruptionNoEndDateTime: "",
            disruptionRepeats: "daily",
            publishEndDate: getFutureDateAsString(7),
            publishEndTime: "1000",
        };
        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        await createDisruption(req, res);

        const inputs = formatCreateDisruptionBody(req.body);

        const errors: ErrorInfo[] = [
            {
                errorMessage: "The ending on date must be provided",
                id: "disruptionDailyRepeatsEndDate",
            },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify({ inputs, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: `/create-disruption/${defaultDisruptionId}` });
    });

    it("should redirect back to /create-disruption when disruption repeats weekly but no ending on date is provided", async () => {
        const disruptionData = {
            ...defaultDisruptionData,
            disruptionEndDate: defaultDisruptionEndDate,
            disruptionEndTime: "1200",
            disruptionNoEndDateTime: "",
            disruptionRepeats: "weekly",
            publishEndDate: getFutureDateAsString(7),
            publishEndTime: "1000",
        };
        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        await createDisruption(req, res);

        const inputs = formatCreateDisruptionBody(req.body);

        const errors: ErrorInfo[] = [
            {
                errorMessage: "The ending on date must be provided",
                id: "disruptionWeeklyRepeatsEndDate",
            },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify({ inputs, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: `/create-disruption/${defaultDisruptionId}` });
    });

    it("should redirect back to /create-disruption when disruption repeats daily and the ending on date is before the disruption end date", async () => {
        const disruptionData = {
            ...defaultDisruptionData,
            disruptionEndDate: defaultDisruptionEndDate,
            disruptionEndTime: "1200",
            disruptionNoEndDateTime: "",
            disruptionRepeats: "daily",
            disruptionDailyRepeatsEndDate: getFutureDateAsString(1),
            publishEndDate: getFutureDateAsString(7),
            publishEndTime: "1000",
        };
        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        await createDisruption(req, res);

        const inputs = formatCreateDisruptionBody(req.body);

        const errors: ErrorInfo[] = [
            {
                errorMessage: "The ending on date must be after the end date",
                id: "disruptionDailyRepeatsEndDate",
            },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify({ inputs, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: `/create-disruption/${defaultDisruptionId}` });
    });

    it("should redirect back to /create-disruption when disruption repeats weekly and the ending on date is before the disruption end date", async () => {
        const disruptionData = {
            ...defaultDisruptionData,
            disruptionEndDate: defaultDisruptionEndDate,
            disruptionEndTime: "1200",
            disruptionNoEndDateTime: "",
            disruptionRepeats: "weekly",
            disruptionWeeklyRepeatsEndDate: getFutureDateAsString(1),
            publishEndDate: getFutureDateAsString(7),
            publishEndTime: "1000",
        };
        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        await createDisruption(req, res);

        const inputs = formatCreateDisruptionBody(req.body);

        const errors: ErrorInfo[] = [
            {
                errorMessage: "The ending on date must be after the end date",
                id: "disruptionWeeklyRepeatsEndDate",
            },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify({ inputs, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: `/create-disruption/${defaultDisruptionId}` });
    });

    it("should redirect back to /create-disruption when disruption repeats daily and the ending on date is more than 365 days of start date", async () => {
        const disruptionData = {
            ...defaultDisruptionData,
            disruptionEndDate: defaultDisruptionEndDate,
            disruptionEndTime: "1200",
            disruptionNoEndDateTime: "",
            disruptionRepeats: "daily",
            disruptionDailyRepeatsEndDate: getFutureDateAsString(380),
            publishEndDate: getFutureDateAsString(7),
            publishEndTime: "1000",
        };
        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        await createDisruption(req, res);

        const inputs = formatCreateDisruptionBody(req.body);

        const errors: ErrorInfo[] = [
            {
                errorMessage: "The repeat ending on must be within one year of the start date",
                id: "disruptionDailyRepeatsEndDate",
            },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify({ inputs, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: `/create-disruption/${defaultDisruptionId}` });
    });

    it("should redirect back to /create-disruption when disruption repeats weekly and the ending on date is more than 365 days of start date", async () => {
        const disruptionData = {
            ...defaultDisruptionData,
            disruptionEndDate: defaultDisruptionEndDate,
            disruptionEndTime: "1200",
            disruptionNoEndDateTime: "",
            disruptionRepeats: "weekly",
            disruptionWeeklyRepeatsEndDate: getFutureDateAsString(380),
            publishEndDate: getFutureDateAsString(7),
            publishEndTime: "1000",
        };
        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        await createDisruption(req, res);

        const inputs = formatCreateDisruptionBody(req.body);

        const errors: ErrorInfo[] = [
            {
                errorMessage: "The repeat ending on must be within one year of the start date",
                id: "disruptionWeeklyRepeatsEndDate",
            },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify({ inputs, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: `/create-disruption/${defaultDisruptionId}` });
    });

    it("should redirect back to /create-disruption when disruption repeats daily and the end date is more than 24 hours of start date", async () => {
        const disruptionData = {
            ...defaultDisruptionData,
            disruptionEndDate: getFutureDateAsString(7),
            disruptionEndTime: "1200",
            disruptionNoEndDateTime: "",
            disruptionRepeats: "daily",
            disruptionDailyRepeatsEndDate: getFutureDateAsString(10),
            publishEndDate: getFutureDateAsString(20),
            publishEndTime: "1000",
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        await createDisruption(req, res);

        const inputs = formatCreateDisruptionBody(req.body);

        const errors: ErrorInfo[] = [
            {
                errorMessage: "The date range must be within 24 hours for daily repetitions",
                id: "disruptionEndDate",
            },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify({ inputs, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: `/create-disruption/${defaultDisruptionId}` });
    });

    it("should redirect back to /create-disruption when disruption repeats weekly and the end date is more than 7 days of start date", async () => {
        const disruptionData = {
            ...defaultDisruptionData,
            disruptionEndDate: getFutureDateAsString(14),
            disruptionEndTime: "1200",
            disruptionNoEndDateTime: "",
            disruptionRepeats: "weekly",
            disruptionWeeklyRepeatsEndDate: getFutureDateAsString(15),
            publishEndDate: getFutureDateAsString(20),
            publishEndTime: "1000",
        };
        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        await createDisruption(req, res);

        const inputs = formatCreateDisruptionBody(req.body);

        const errors: ErrorInfo[] = [
            {
                errorMessage: "The date range must be within 7 days for weekly repetitions",
                id: "disruptionEndDate",
            },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify({ inputs, errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: `/create-disruption/${defaultDisruptionId}` });
    });

    it("should confirm that the dates are expanded as expected", () => {
        const dailyValidity: Validity = {
            disruptionStartDate: "13/04/2023",
            disruptionStartTime: "1100",
            disruptionEndDate: "13/04/2023",
            disruptionEndTime: "1200",
            disruptionRepeats: "daily",
            disruptionDailyRepeatsEndDate: "25/04/2023",
        };

        const weeklyValidity: Validity = {
            ...dailyValidity,
            disruptionRepeats: "weekly",
            disruptionEndDate: "14/04/2023",
            disruptionWeeklyRepeatsEndDate: "25/04/2023",
        };

        const dailyExpandedValidity: Validity[] = [
            {
                disruptionDailyRepeatsEndDate: "14/04/2023",
                disruptionEndDate: "14/04/2023",
                disruptionEndTime: "1200",
                disruptionRepeats: "daily",
                disruptionStartDate: "14/04/2023",
                disruptionStartTime: "1100",
            },
            {
                disruptionDailyRepeatsEndDate: "15/04/2023",
                disruptionEndDate: "15/04/2023",
                disruptionEndTime: "1200",
                disruptionRepeats: "daily",
                disruptionStartDate: "15/04/2023",
                disruptionStartTime: "1100",
            },
            {
                disruptionDailyRepeatsEndDate: "16/04/2023",
                disruptionEndDate: "16/04/2023",
                disruptionEndTime: "1200",
                disruptionRepeats: "daily",
                disruptionStartDate: "16/04/2023",
                disruptionStartTime: "1100",
            },
            {
                disruptionDailyRepeatsEndDate: "17/04/2023",
                disruptionEndDate: "17/04/2023",
                disruptionEndTime: "1200",
                disruptionRepeats: "daily",
                disruptionStartDate: "17/04/2023",
                disruptionStartTime: "1100",
            },
            {
                disruptionDailyRepeatsEndDate: "18/04/2023",
                disruptionEndDate: "18/04/2023",
                disruptionEndTime: "1200",
                disruptionRepeats: "daily",
                disruptionStartDate: "18/04/2023",
                disruptionStartTime: "1100",
            },
            {
                disruptionDailyRepeatsEndDate: "19/04/2023",
                disruptionEndDate: "19/04/2023",
                disruptionEndTime: "1200",
                disruptionRepeats: "daily",
                disruptionStartDate: "19/04/2023",
                disruptionStartTime: "1100",
            },
            {
                disruptionDailyRepeatsEndDate: "20/04/2023",
                disruptionEndDate: "20/04/2023",
                disruptionEndTime: "1200",
                disruptionRepeats: "daily",
                disruptionStartDate: "20/04/2023",
                disruptionStartTime: "1100",
            },
            {
                disruptionDailyRepeatsEndDate: "21/04/2023",
                disruptionEndDate: "21/04/2023",
                disruptionEndTime: "1200",
                disruptionRepeats: "daily",
                disruptionStartDate: "21/04/2023",
                disruptionStartTime: "1100",
            },
            {
                disruptionDailyRepeatsEndDate: "22/04/2023",
                disruptionEndDate: "22/04/2023",
                disruptionEndTime: "1200",
                disruptionRepeats: "daily",
                disruptionStartDate: "22/04/2023",
                disruptionStartTime: "1100",
            },
            {
                disruptionDailyRepeatsEndDate: "23/04/2023",
                disruptionEndDate: "23/04/2023",
                disruptionEndTime: "1200",
                disruptionRepeats: "daily",
                disruptionStartDate: "23/04/2023",
                disruptionStartTime: "1100",
            },
            {
                disruptionDailyRepeatsEndDate: "24/04/2023",
                disruptionEndDate: "24/04/2023",
                disruptionEndTime: "1200",
                disruptionRepeats: "daily",
                disruptionStartDate: "24/04/2023",
                disruptionStartTime: "1100",
            },
        ];

        const weeklyExpandedDisruption: Validity[] = [
            {
                disruptionDailyRepeatsEndDate: "25/04/2023",
                disruptionEndDate: "21/04/2023",
                disruptionEndTime: "1200",
                disruptionRepeats: "weekly",
                disruptionStartDate: "20/04/2023",
                disruptionStartTime: "1100",
                disruptionWeeklyRepeatsEndDate: "21/04/2023",
            },
        ];
        expect(expandDisruptionRepeats(dailyValidity, 1)).toEqual(dailyExpandedValidity);
        expect(expandDisruptionRepeats(weeklyValidity, 7)).toEqual(weeklyExpandedDisruption);
    });
});
