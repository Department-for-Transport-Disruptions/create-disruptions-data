import { describe, it, expect } from "vitest";
import { checkOverlap, convertDateTimeToFormat, formatTime, getDatetimeFromDateAndTime } from "./dates";

describe("date/time tests", () => {
    it.each([
        ["2019-01-25", "DD/MM/YYYY", "25/01/2019"],
        ["2019-01-25", "DD/MM/YY", "25/01/19"],
        ["2019-01-25", "", "2019-01-25T00:00:00+00:00"],
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
            getDatetimeFromDateAndTime("12/04/2019", "1000"),
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
            getDatetimeFromDateAndTime("10/04/2019", "1000"),
        ],
        [
            getDatetimeFromDateAndTime("02/04/2019", "1000"),
            getDatetimeFromDateAndTime("15/04/2019", "1000"),
            getDatetimeFromDateAndTime("05/04/2019", "1000"),
            getDatetimeFromDateAndTime("10/04/2019", "1000"),
        ],
    ])("should confirm that the dates overlap", (firstStartDate, firstEndDate, secondStartDate, secondEndDate) => {
        expect(checkOverlap(firstStartDate, firstEndDate, secondStartDate, secondEndDate)).toEqual(true);
    });
});
