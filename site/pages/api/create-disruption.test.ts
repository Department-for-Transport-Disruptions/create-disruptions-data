/* eslint-disable @typescript-eslint/no-unsafe-argument  */
import { MiscellaneousReason } from "@create-disruptions-data/shared-ts/enums";
import * as cryptoRandomString from "crypto-random-string";
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import createDisruption, { formatCreateDisruptionBody } from "./create-disruption.api";
import { COOKIES_DISRUPTION_ERRORS, DASHBOARD_PAGE_PATH } from "../../constants";
import * as dynamo from "../../data/dynamo";
import { ErrorInfo } from "../../interfaces";
import { DEFAULT_ORG_ID, getMockRequestAndResponse, mockSession } from "../../testData/mockData";
import { setCookieOnResponseObject } from "../../utils/apiUtils";
import * as session from "../../utils/apiUtils/auth";
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
    displayId: "8fg3ha",
    orgId: DEFAULT_ORG_ID,
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

    vi.mock("crypto-random-string", () => ({
        default: vi.fn(),
    }));

    afterEach(() => {
        vi.resetAllMocks();
    });

    const getSessionSpy = vi.spyOn(session, "getSession");
    const cryptoRandomStringSpy = vi.spyOn(cryptoRandomString, "default");

    beforeEach(() => {
        getSessionSpy.mockImplementation(() => {
            return mockSession;
        });
        cryptoRandomStringSpy.mockImplementation(() => {
            return "8fg3ha";
        });
    });

    it("should redirect to /type-of-consequence when all required inputs are passed expect displayId for new disruptions", async () => {
        const disruptionData = {
            ...defaultDisruptionData,
            publishStartTime: "0900",
            disruptionStartDate: getFutureDateAsString(40),
            disruptionStartTime: "1200",
            displayId: "",
            validity1: [
                defaultDisruptionStartDate,
                "1000",
                defaultDisruptionStartDate,
                "1100",
                "",
                "daily",
                getFutureDateAsString(11),
            ],
            validity2: [
                getFutureDateAsString(11),
                "0900",
                getFutureDateAsString(13),
                "1100",
                "",
                "weekly",
                getFutureDateAsString(40),
            ],
        };
        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        await createDisruption(req, res);

        expect(upsertDisruptionSpy).toHaveBeenCalledTimes(1);
        expect(upsertDisruptionSpy).toHaveBeenCalledWith(
            {
                disruptionId: defaultDisruptionId,
                disruptionType: "unplanned",
                orgId: DEFAULT_ORG_ID,
                summary: "Lorem ipsum dolor sit amet",
                description:
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                associatedLink: "",
                disruptionReason: MiscellaneousReason.roadworks,
                publishStartDate: defaultPublishStartDate,
                publishStartTime: "0900",
                publishEndDate: "",
                publishEndTime: "",
                disruptionStartDate: getFutureDateAsString(40),
                disruptionStartTime: "1200",
                disruptionEndDate: "",
                disruptionEndTime: "",
                disruptionNoEndDateTime: "true",
                displayId: "8fg3ha",
                validity: [
                    {
                        disruptionStartDate: defaultDisruptionStartDate,
                        disruptionStartTime: "1000",
                        disruptionEndDate: defaultDisruptionStartDate,
                        disruptionEndTime: "1100",
                        disruptionNoEndDateTime: "",
                        disruptionRepeats: "daily",
                        disruptionRepeatsEndDate: getFutureDateAsString(11),
                    },
                    {
                        disruptionStartDate: getFutureDateAsString(11),
                        disruptionStartTime: "0900",
                        disruptionEndDate: getFutureDateAsString(13),
                        disruptionEndTime: "1100",
                        disruptionNoEndDateTime: "",
                        disruptionRepeats: "weekly",
                        disruptionRepeatsEndDate: getFutureDateAsString(40),
                    },
                ],
            },
            DEFAULT_ORG_ID,
            mockSession.isOrgStaff,
            false,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: `/type-of-consequence/${defaultDisruptionId}/0` });
    });

    it("should redirect to /type-of-consequence when all required inputs are passed", async () => {
        const disruptionData = {
            ...defaultDisruptionData,
            publishStartTime: "0900",
            disruptionStartDate: getFutureDateAsString(40),
            disruptionStartTime: "1200",
            validity1: [
                defaultDisruptionStartDate,
                "1000",
                defaultDisruptionStartDate,
                "1100",
                "",
                "daily",
                getFutureDateAsString(11),
            ],
            validity2: [
                getFutureDateAsString(11),
                "0900",
                getFutureDateAsString(13),
                "1100",
                "",
                "weekly",
                getFutureDateAsString(40),
            ],
        };
        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        await createDisruption(req, res);

        expect(upsertDisruptionSpy).toHaveBeenCalledTimes(1);
        expect(upsertDisruptionSpy).toHaveBeenCalledWith(
            {
                disruptionId: defaultDisruptionId,
                disruptionType: "unplanned",
                orgId: DEFAULT_ORG_ID,
                summary: "Lorem ipsum dolor sit amet",
                description:
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                associatedLink: "",
                disruptionReason: MiscellaneousReason.roadworks,
                publishStartDate: defaultPublishStartDate,
                publishStartTime: "0900",
                publishEndDate: "",
                publishEndTime: "",
                disruptionStartDate: getFutureDateAsString(40),
                disruptionStartTime: "1200",
                disruptionEndDate: "",
                disruptionEndTime: "",
                disruptionNoEndDateTime: "true",
                displayId: "8fg3ha",
                validity: [
                    {
                        disruptionStartDate: defaultDisruptionStartDate,
                        disruptionStartTime: "1000",
                        disruptionEndDate: defaultDisruptionStartDate,
                        disruptionEndTime: "1100",
                        disruptionNoEndDateTime: "",
                        disruptionRepeats: "daily",
                        disruptionRepeatsEndDate: getFutureDateAsString(11),
                    },
                    {
                        disruptionStartDate: getFutureDateAsString(11),
                        disruptionStartTime: "0900",
                        disruptionEndDate: getFutureDateAsString(13),
                        disruptionEndTime: "1100",
                        disruptionNoEndDateTime: "",
                        disruptionRepeats: "weekly",
                        disruptionRepeatsEndDate: getFutureDateAsString(40),
                    },
                ],
            },
            DEFAULT_ORG_ID,
            mockSession.isOrgStaff,
            false,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: `/type-of-consequence/${defaultDisruptionId}/0` });
    });

    it("should redirect to /create-disruption when disruptionNoEndDateTime is false and there is no publish end date/time", async () => {
        const disruptionData = {
            ...defaultDisruptionData,
            disruptionNoEndDateTime: "",
            disruptionEndDate: getFutureDateAsString(48),
            disruptionEndTime: "1200",
        };
        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        await createDisruption(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "Enter publication end date", id: "publishEndDate" },
            { errorMessage: "Enter publication end time", id: "publishEndTime" },
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
            { errorMessage: "Enter publication start date", id: "publishStartDate" },
            { errorMessage: "Enter publication start time", id: "publishStartTime" },
            { errorMessage: "Enter a start date", id: "disruptionStartDate" },
            { errorMessage: "Enter a start time", id: "disruptionStartTime" },
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

    it("should redirect back to /create-disruption when validity has an overlapping row", async () => {
        const disruptionData = {
            ...defaultDisruptionData,
            publishStartTime: "0900",
            validity1: [defaultDisruptionStartDate, "1000", defaultDisruptionEndDate, "1300", "", "doesntRepeat", ""],
            validity2: [
                getFutureDateAsString(11),
                "1300",
                getFutureDateAsString(13),
                "1100",
                "",
                "weekly",
                getFutureDateAsString(40),
            ],
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

    it("should redirect back to /create-disruption when publishing window doesn't encompass disruption window", async () => {
        const disruptionData = {
            ...defaultDisruptionData,
            publishStartTime: "0900",
            publishEndDate: getFutureDateAsString(47),
            publishEndTime: "1100",
            disruptionStartDate: getFutureDateAsString(40),
            disruptionStartTime: "1200",
            disruptionEndDate: getFutureDateAsString(48),
            disruptionEndTime: "1200",
            disruptionNoEndDateTime: "",
            validity1: [
                defaultDisruptionStartDate,
                "1000",
                defaultDisruptionStartDate,
                "1100",
                "",
                "daily",
                getFutureDateAsString(12),
            ],
            validity2: [
                getFutureDateAsString(11),
                "1300",
                getFutureDateAsString(13),
                "1100",
                "",
                "weekly",
                getFutureDateAsString(40),
            ],
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        await createDisruption(req, res);

        const inputs = formatCreateDisruptionBody(req.body);

        const errors: ErrorInfo[] = [
            {
                errorMessage: "The publishing period must end after the last validity period",
                id: "publishEndDate",
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
                id: "disruptionRepeatsEndDate",
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
                id: "disruptionRepeatsEndDate",
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
            disruptionRepeatsEndDate: getFutureDateAsString(1),
            publishEndDate: getFutureDateAsString(7),
            publishEndTime: "1000",
        };
        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        await createDisruption(req, res);

        const inputs = formatCreateDisruptionBody(req.body);

        const errors: ErrorInfo[] = [
            {
                errorMessage: "The ending on date must be after the end date",
                id: "disruptionRepeatsEndDate",
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
            disruptionRepeatsEndDate: getFutureDateAsString(1),
            publishEndDate: getFutureDateAsString(7),
            publishEndTime: "1000",
        };
        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        await createDisruption(req, res);

        const inputs = formatCreateDisruptionBody(req.body);

        const errors: ErrorInfo[] = [
            {
                errorMessage: "The ending on date must be after the end date",
                id: "disruptionRepeatsEndDate",
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
            disruptionRepeatsEndDate: getFutureDateAsString(380),
            publishEndDate: getFutureDateAsString(387),
            publishEndTime: "1000",
        };
        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        await createDisruption(req, res);

        const inputs = formatCreateDisruptionBody(req.body);

        const errors: ErrorInfo[] = [
            {
                errorMessage: "The repeat ending on must be within one year of the start date",
                id: "disruptionRepeatsEndDate",
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
            disruptionRepeatsEndDate: getFutureDateAsString(380),
            publishEndDate: getFutureDateAsString(387),
            publishEndTime: "1000",
        };
        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        await createDisruption(req, res);

        const inputs = formatCreateDisruptionBody(req.body);

        const errors: ErrorInfo[] = [
            {
                errorMessage: "The repeat ending on must be within one year of the start date",
                id: "disruptionRepeatsEndDate",
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
            disruptionRepeatsEndDate: getFutureDateAsString(10),
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
            disruptionRepeatsEndDate: getFutureDateAsString(15),
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

    it("should redirect to /dashboard when all required inputs are passed and the disruption is saved as draft", async () => {
        const disruptionData = {
            ...defaultDisruptionData,
            publishStartTime: "0900",
            disruptionStartDate: getFutureDateAsString(40),
            disruptionStartTime: "1200",
            validity1: [
                defaultDisruptionStartDate,
                "1000",
                defaultDisruptionStartDate,
                "1100",
                "",
                "daily",
                getFutureDateAsString(11),
            ],
            validity2: [
                getFutureDateAsString(11),
                "0900",
                getFutureDateAsString(13),
                "1100",
                "",
                "weekly",
                getFutureDateAsString(40),
            ],
        };
        const { req, res } = getMockRequestAndResponse({
            body: disruptionData,
            mockWriteHeadFn: writeHeadMock,
            query: { draft: "true" },
        });

        await createDisruption(req, res);

        expect(upsertDisruptionSpy).toHaveBeenCalledTimes(1);
        expect(upsertDisruptionSpy).toHaveBeenCalledWith(
            {
                disruptionId: defaultDisruptionId,
                disruptionType: "unplanned",
                orgId: DEFAULT_ORG_ID,
                summary: "Lorem ipsum dolor sit amet",
                description:
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                associatedLink: "",
                disruptionReason: MiscellaneousReason.roadworks,
                publishStartDate: defaultPublishStartDate,
                publishStartTime: "0900",
                publishEndDate: "",
                publishEndTime: "",
                disruptionStartDate: getFutureDateAsString(40),
                disruptionStartTime: "1200",
                disruptionEndDate: "",
                disruptionEndTime: "",
                disruptionNoEndDateTime: "true",
                displayId: "8fg3ha",
                validity: [
                    {
                        disruptionStartDate: defaultDisruptionStartDate,
                        disruptionStartTime: "1000",
                        disruptionEndDate: defaultDisruptionStartDate,
                        disruptionEndTime: "1100",
                        disruptionNoEndDateTime: "",
                        disruptionRepeats: "daily",
                        disruptionRepeatsEndDate: getFutureDateAsString(11),
                    },
                    {
                        disruptionStartDate: getFutureDateAsString(11),
                        disruptionStartTime: "0900",
                        disruptionEndDate: getFutureDateAsString(13),
                        disruptionEndTime: "1100",
                        disruptionNoEndDateTime: "",
                        disruptionRepeats: "weekly",
                        disruptionRepeatsEndDate: getFutureDateAsString(40),
                    },
                ],
            },
            DEFAULT_ORG_ID,
            mockSession.isOrgStaff,
            false,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: DASHBOARD_PAGE_PATH });
    });
});
