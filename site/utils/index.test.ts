import { describe, it, expect } from "vitest";
import { formatTime, splitCamelCaseToString, convertDateTimeToFormat } from ".";

describe("utils tests", () => {
    it.each([
        ["1100", "11:00"],
        ["0900", "09:00"],
        ["", new Error("Time must be 4 digits long")],
    ])("should format add a : between provided numbers", (unformattedTime, formattedTime) => {
        expect(formatTime(unformattedTime)).toEqual(formattedTime);
    });

    it.each([
        ["specialEvent", "Special event"],
        ["roadWorks", "Road works"],
        ["", ""],
    ])("should convert text to sentence case", (text, formattedText) => {
        expect(splitCamelCaseToString(text)).toEqual(formattedText);
    });

    it.each([
        ["2019-01-25", "DD/MM/YYYY", "25/01/2019"],
        ["2019-01-25", "DD/MM/YY", "25/01/19"],
        ["2019-01-25", "", "2019-01-25T00:00:00+00:00"],
        ["", "DD/MM/YYYY", "Invalid Date"],
        ["", "", "Invalid Date"],
    ])("should convert date/time into format given", (dateOrTime, format, result) => {
        expect(convertDateTimeToFormat(dateOrTime, format)).toEqual(result);
    });
});
