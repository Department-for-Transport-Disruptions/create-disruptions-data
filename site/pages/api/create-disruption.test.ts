/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment  */
import { MiscellaneousReason } from "@create-disruptions-data/shared-ts/enums";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { describe, it, expect, afterEach, vi } from "vitest";
import createDisruption, { formatCreateDisruptionBody } from "./create-disruption.api";
import { COOKIES_DISRUPTION_ERRORS, COOKIES_DISRUPTION_INFO, CD_DATE_FORMAT } from "../../constants";
import { ErrorInfo } from "../../interfaces";
import { getMockRequestAndResponse } from "../../testData/mockData";
import { setCookieOnResponseObject } from "../../utils/apiUtils";

dayjs.extend(customParseFormat);

const getFutureDateAsString = (addDays: number, dateFormat: string) => {
    return dayjs().add(addDays, "day").format(dateFormat).toString();
};

const defaultDisruptionStartDate = getFutureDateAsString(2, CD_DATE_FORMAT);
const defaultDisruptionEndDate = getFutureDateAsString(5, CD_DATE_FORMAT);
const defaultPublishStartDate = getFutureDateAsString(2, CD_DATE_FORMAT);

const defaultDisruptionData = {
    disruptionType: "unplanned",
    summary: "Lorem ipsum dolor sit amet",
    description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    associatedLink: "",
    disruptionReason: MiscellaneousReason.roadWorks,
    validity1: [defaultDisruptionStartDate, "1100", defaultDisruptionEndDate, "1000", ""],
    publishStartDate: defaultPublishStartDate,
    publishStartTime: "1100",
    publishEndDate: "",
    publishEndTime: "",
    publishNoEndDateTime: "true",
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
            { errorMessage: "Enter a publish start date for the disruption", id: "publishStartDate" },
            { errorMessage: "Enter a publish start time for the disruption", id: "publishStartTime" },
            { errorMessage: "At least one validity period must be provided", id: "disruptionStartDate" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify({ inputs: formatCreateDisruptionBody(req.body), errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });

    it("should redirect back to /create-disruption when summary or description are too long", () => {
        const disruptionData = {
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
            JSON.stringify({ inputs: formatCreateDisruptionBody(req.body), errors }),
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
            JSON.stringify({ inputs: formatCreateDisruptionBody(req.body), errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });

    it("should redirect back to /create-disruption when invalid URL passed for associated link", () => {
        const disruptionData = {
            ...defaultDisruptionData,
            associatedLink: "http://test<>/",
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);

        const errors: ErrorInfo[] = [{ errorMessage: "Associated link must be a valid URL", id: "associatedLink" }];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify({ inputs: formatCreateDisruptionBody(req.body), errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });

    it("should redirect back to /create-disruption when validity has duplicates/overlaps", () => {
        const disruptionData = {
            ...defaultDisruptionData,
            validity2: defaultDisruptionData.validity1,
        };

        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);

        const errors: ErrorInfo[] = [{ errorMessage: "Validity periods cannot overlap", id: "disruptionStartDate" }];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify({ inputs: formatCreateDisruptionBody(req.body), errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });

    it("should redirect back to /create-disruption when validity has end date/time empty not in the last position", () => {
        const disruptionData = {
            ...defaultDisruptionData,
            validity1: ["24/03/2002", "1200", "", "", "true"],
            validity2: defaultDisruptionData.validity1,
        };
        const { req, res } = getMockRequestAndResponse({ body: disruptionData, mockWriteHeadFn: writeHeadMock });

        createDisruption(req, res);

        const errors: ErrorInfo[] = [
            { errorMessage: "A validity period with no end time must be the last validity", id: "disruptionStartDate" },
        ];
        expect(setCookieOnResponseObject).toHaveBeenCalledTimes(1);
        expect(setCookieOnResponseObject).toHaveBeenCalledWith(
            COOKIES_DISRUPTION_ERRORS,
            JSON.stringify({ inputs: formatCreateDisruptionBody(req.body), errors }),
            res,
        );
        expect(writeHeadMock).toBeCalledWith(302, { Location: "/create-disruption" });
    });
});
