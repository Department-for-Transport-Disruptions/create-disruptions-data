import { describe, it, expect } from "vitest";
import {
    checkOverlap,
    convertDateTimeToFormat,
    formatTime,
    getDatetimeFromDateAndTime,
    getEndingOnDateText,
} from "./dates";
import dayjs from "dayjs";

describe("date/time tests", () => {
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
        ["07/03/2023", "", dayjs("2023-03-07")],
        ["25/04/2023", "1000", dayjs("2023-04-25").set("hour", 10)],
    ])("should return expected date time", (date, time, result) => {
        expect(getDatetimeFromDateAndTime(date, time).toISOString()).toEqual(result.toISOString());
    });
});
