import { DisruptionInfo, Validity } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { checkOverlap, getDatetimeFromDateAndTime, getDate } from "@create-disruptions-data/shared-ts/utils/dates";
import dayjs from "dayjs";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
    convertDateTimeToFormat,
    formatTime,
    getEndingOnDateText,
    getFutureDateAsString,
    getValidityAndPublishStartAndEndDates,
    isUpcomingDisruption,
} from "./dates";
import { MiscellaneousReason } from "@create-disruptions-data/shared-ts/enums";
import MockDate from "mockdate";
import { cleanup } from "@testing-library/react";

describe("date/time tests", () => {
    afterEach(() => {
        vi.resetAllMocks();
        cleanup();
    });

    it.each([
        ["2019-01-25", "DD/MM/YYYY", "25/01/2019"],
        ["2019-01-25", "DD/MM/YY", "25/01/19"],
        ["2019-01-25", "", "2019-01-25T00:00:00Z"],
        ["", "DD/MM/YYYY", "Invalid Date"],
        ["", "", "Invalid Date"],
    ])("should convert date/time into format given", (dateOrTime, format, result) => {
        expect(convertDateTimeToFormat(dateOrTime, format)).toEqual(result);
    });

    it.each([
        ["1100", "11:00"],
        ["0900", "09:00"],
        ["", ""],
    ])("should format add a : between provided numbers", (unformattedTime, formattedTime) => {
        expect(formatTime(unformattedTime)).toEqual(formattedTime);
    });

    it.each([
        [
            getDatetimeFromDateAndTime("04/04/2019", "1000"),
            getDatetimeFromDateAndTime("07/04/2019", "1000"),
            getDatetimeFromDateAndTime("03/04/2019", "1000"),
            getDatetimeFromDateAndTime("05/04/2019", "1000"),
        ],
        [
            getDatetimeFromDateAndTime("04/04/2019", "1000"),
            getDatetimeFromDateAndTime("07/04/2019", "1000"),
            getDatetimeFromDateAndTime("03/04/2019", "1000"),
            getDatetimeFromDateAndTime("05/04/2019", "1000"),
        ],
        [
            getDatetimeFromDateAndTime("04/04/2019", "1000"),
            getDatetimeFromDateAndTime("07/04/2019", "1000"),
            getDatetimeFromDateAndTime("05/04/2019", "1000"),
            getDatetimeFromDateAndTime("08/04/2019", "1000"),
        ],
        [
            getDatetimeFromDateAndTime("02/04/2019", "1000"),
            getDatetimeFromDateAndTime("15/04/2019", "1000"),
            getDatetimeFromDateAndTime("05/04/2019", "1000"),
            getDatetimeFromDateAndTime("08/04/2019", "1000"),
        ],
    ])("should confirm that the dates overlap", (firstStartDate, firstEndDate, secondStartDate, secondEndDate) => {
        expect(checkOverlap(firstStartDate, firstEndDate, secondStartDate, secondEndDate)).toEqual(true);
    });

    it.each([
        ["weekly", "26/05/2023", "04/05/2023", "05/05/2023", "26/05/2023"],
        ["weekly", "30/05/2023", "03/05/2023", "07/05/2023", "28/05/2023"],
        ["weekly", "27/05/2023", "03/05/2023", "07/05/2023", "27/05/2023"],
        ["weekly", "28/05/2023", "03/05/2023", "04/05/2023", "25/05/2023"],
        ["weekly", "24/05/2023", "03/05/2023", "05/05/2023", "24/05/2023"],
        ["weekly", "26/05/2023", "03/05/2023", "03/05/2023", "24/05/2023"],
        ["doesntRepeat", "15/05/2023", undefined, undefined, "15/05/2023"],
        ["daily", "10/05/2023", "03/05/2023", "03/05/2023", "10/05/2023"],
    ])("should return expected end date", (repeats, endingOnDate, startDate, endDate, result) => {
        expect(getEndingOnDateText(repeats, endingOnDate, startDate, endDate)).toEqual(result);
    });

    it.each([
        ["07/03/2023", ""],
        ["25/04/2023", "1000"],
    ])("should return expected date time", (date, time) => {
        expect(getDatetimeFromDateAndTime(date, time).toISOString()).toBeTruthy();
    });

    it.each([
        [
            [
                {
                    disruptionStartDate: "13/01/2022",
                    disruptionStartTime: "1200",
                    disruptionEndDate: "14/01/2022",
                    disruptionEndTime: "1400",
                    disruptionNoEndDateTime: "",
                },
                {
                    disruptionStartDate: "13/01/2022",
                    disruptionStartTime: "1200",
                    disruptionEndDate: "14/01/2022",
                    disruptionEndTime: "1400",
                    disruptionNoEndDateTime: "",
                },
            ] as Validity[],
            dayjs.tz("11/08/2023", "Europe/London"),
            false,
        ],
        [
            [
                {
                    disruptionStartDate: "13/01/2024",
                    disruptionStartTime: "1300",
                    disruptionEndDate: "14/01/2024",
                    disruptionEndTime: "1400",
                    disruptionNoEndDateTime: "",
                },
                {
                    disruptionStartDate: "13/01/2024",
                    disruptionStartTime: "1300",
                    disruptionEndDate: "14/01/2024",
                    disruptionEndTime: "1400",
                    disruptionNoEndDateTime: "",
                },
            ] as Validity[],
            dayjs.tz("11/08/2023", "Europe/London"),
            true,
        ],
        [
            [
                {
                    disruptionStartDate: "13/01/2024",
                    disruptionStartTime: "1300",
                    disruptionNoEndDateTime: "true",
                },
                {
                    disruptionStartDate: "13/01/2024",
                    disruptionStartTime: "1300",
                    disruptionNoEndDateTime: "true",
                },
            ] as Validity[],
            dayjs.tz("11/08/2023", "Europe/London"),
            true,
        ],
        [
            [
                {
                    disruptionStartDate: "11/08/2023",
                    disruptionStartTime: "1300",
                    disruptionNoEndDateTime: "true",
                },
                {
                    disruptionStartDate: "11/08/2023",
                    disruptionStartTime: "1400",
                    disruptionNoEndDateTime: "true",
                },
            ] as Validity[],
            dayjs.tz("11/08/2023", "Europe/London"),
            false,
        ],
    ])("should return whether a disruption is upcoming or not ", (validity, today, result) => {
        expect(isUpcomingDisruption(validity, today)).toEqual(result);
    });

    it.each(["2023-03-03", "2023-07-03"])(
        "should correctly format validity and publish dates to UTC",
        (date: string) => {
            MockDate.set(date);

            const mockDisruptionInfo: DisruptionInfo = {
                id: "123e4567-e89b-12d3-a456-426614174000",
                disruptionType: "unplanned",
                summary: "Road closure on Main Street",
                description: "Main Street will be closed for maintenance work from 9 AM to 5 PM.",
                associatedLink: "https://example.com/disruption-details",
                disruptionReason: MiscellaneousReason.accident,
                publishStartDate: getFutureDateAsString(0),
                publishStartTime: "08:00",
                publishEndDate: getFutureDateAsString(0),
                publishEndTime: "18:00",
                disruptionStartDate: getFutureDateAsString(0),
                disruptionStartTime: "08:00",
                disruptionEndDate: getFutureDateAsString(0),
                disruptionEndTime: "18:00",
                disruptionNoEndDateTime: "",
                disruptionRepeats: "doesntRepeat",
                disruptionRepeatsEndDate: "",
                validity: [
                    {
                        disruptionStartDate: getFutureDateAsString(0),
                        disruptionStartTime: "08:00",
                        disruptionEndDate: getFutureDateAsString(0),
                        disruptionEndTime: "18:00",
                        disruptionNoEndDateTime: "",
                        disruptionRepeats: "doesntRepeat",
                        disruptionRepeatsEndDate: "",
                    },
                ],
                displayId: "DISRUPTION-001",
                orgId: "123e4567-e89b-12d3-a456-426614174001",
                createdByOperatorOrgId: null,
                creationTime: "2023-09-30T12:00:00Z",
                permitReferenceNumber: null,
            };

            expect(getValidityAndPublishStartAndEndDates(mockDisruptionInfo)).toEqual({
                publishEndTimestamp: getDate(`${date}T18:00:00.000Z`),
                publishStartTimestamp: getDate(`${date}T08:00:00.000Z`),
                validityEndTimestamp: getDate(`${date}T18:00:00.000Z`),
                validityStartTimestamp: getDate(`${date}T08:00:00.000Z`),
            });
        },
    );
});
