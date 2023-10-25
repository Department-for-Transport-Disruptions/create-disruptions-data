import { Validity } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { describe, it, expect } from "vitest";
import { getValidityPeriod } from "./siri";

const validityDisruptionEndTime = "1000";
const valditityDisruptionEndDate = "07/05/2023";

const weeklyValidity: Validity = {
    disruptionStartDate: "02/05/2023",
    disruptionStartTime: "0900",
    disruptionEndDate: valditityDisruptionEndDate,
    disruptionEndTime: validityDisruptionEndTime,
    disruptionRepeats: "weekly",
    disruptionRepeatsEndDate: "22/05/2023",
};

const dailyValidityDisruptionEndTime = "0700";
const dailyValditityDisruptionEndDate = "14/10/2023";

const dailyValidity: Validity = {
    disruptionStartDate: "13/10/2023",
    disruptionStartTime: "1900",
    disruptionEndDate: dailyValditityDisruptionEndDate,
    disruptionEndTime: dailyValidityDisruptionEndTime,
    disruptionRepeats: "daily",
    disruptionRepeatsEndDate: "15/10/2023",
};

const nonRepeatingValidity: Validity = {
    disruptionStartDate: "15/05/2023",
    disruptionStartTime: "1000",
    disruptionRepeats: "doesntRepeat",
};

describe("siri tests", () => {
    it("should return expected periods for weekly validity when repeating end date day is between the end date and start date day", () => {
        expect(getValidityPeriod(weeklyValidity)).toMatchSnapshot();
    });

    it("should return expected periods for weekly validity when repeating end date day is on the same day as the end date day", () => {
        expect(getValidityPeriod({ ...weeklyValidity, disruptionRepeatsEndDate: "21/05/2023" })).toMatchSnapshot();
    });

    it("should return expected periods for weekly validity when repeating end date day is on the same day as the start date day", () => {
        expect(getValidityPeriod({ ...weeklyValidity, disruptionRepeatsEndDate: "23/05/2023" })).toMatchSnapshot();
    });

    it("should return expected periods for weekly validity when repeating end date day is in between the start date and end date days", () => {
        expect(getValidityPeriod({ ...weeklyValidity, disruptionRepeatsEndDate: "18/05/2023" })).toMatchSnapshot();
    });

    it("should return expected periods for daily validity", () => {
        expect(getValidityPeriod(dailyValidity)).toMatchSnapshot();
    });

    it("should return expected periods for non repeating validity without end date", () => {
        expect(getValidityPeriod(nonRepeatingValidity)).toMatchSnapshot();
    });

    it("should return expected periods for non repeating validity with end date and time", () => {
        expect(
            getValidityPeriod({ ...nonRepeatingValidity, disruptionEndDate: "23/07/2023", disruptionEndTime: "1000" }),
        ).toMatchSnapshot();
    });
});
