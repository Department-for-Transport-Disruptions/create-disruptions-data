import { describe, it, expect } from "vitest";
import { getEndingOnDateText } from "./formUtils";

describe("formUtils tests", () => {
    it.each([
        ["weekly", "26/05/2023", "04/05/2023", "05/05/2023", "26/05/2023"],
        ["weekly", "30/05/2023", "03/05/2023", "07/05/2023", "28/05/2023"],
        ["weekly", "27/05/2023", "03/05/2023", "07/05/2023", "27/05/2023"],
        ["weekly", "28/05/2023", "03/05/2023", "04/05/2023", "25/05/2023"],
        ["weekly", "24/05/2023", "03/05/2023", "05/05/2023", "24/05/2023"],
    ])("should return expected end date", (repeats, endingOnDate, startDate, endDate, result) => {
        expect(getEndingOnDateText(repeats, endingOnDate, startDate, endDate)).toEqual(result);
    });
});
