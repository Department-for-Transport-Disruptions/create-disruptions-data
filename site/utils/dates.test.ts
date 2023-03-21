import { describe, it, expect } from "vitest";
import { convertDateTimeToFormat, formatTime } from "./dates";

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
});
