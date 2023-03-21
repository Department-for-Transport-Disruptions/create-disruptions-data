import { describe, it, expect } from "vitest";
import { splitCamelCaseToString } from ".";

describe("utils tests", () => {
    it.each([
        ["specialEvent", "Special event"],
        ["roadWorks", "Road works"],
        ["", ""],
    ])("should convert text to sentence case", (text, formattedText) => {
        expect(splitCamelCaseToString(text)).toEqual(formattedText);
    });
});
