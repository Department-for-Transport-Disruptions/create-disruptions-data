import { Validity } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { Period } from "@create-disruptions-data/shared-ts/siriTypes";
import { getDatetimeFromDateAndTime } from "@create-disruptions-data/shared-ts/utils/dates";
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

const weeklyValidityPeriodOutput: Period[] = [
    {
        StartTime: getDatetimeFromDateAndTime(
            weeklyValidity.disruptionStartDate,
            weeklyValidity.disruptionStartTime,
        ).toISOString(),
        EndTime: getDatetimeFromDateAndTime(valditityDisruptionEndDate, validityDisruptionEndTime).toISOString(),
    },
    {
        StartTime: getDatetimeFromDateAndTime(weeklyValidity.disruptionStartDate, weeklyValidity.disruptionStartTime)
            .add(7, "day")
            .toISOString(),
        EndTime: getDatetimeFromDateAndTime(valditityDisruptionEndDate, validityDisruptionEndTime)
            .add(7, "day")
            .toISOString(),
    },
    {
        StartTime: getDatetimeFromDateAndTime(weeklyValidity.disruptionStartDate, weeklyValidity.disruptionStartTime)
            .add(2 * 7, "day")
            .toISOString(),
        EndTime: getDatetimeFromDateAndTime(valditityDisruptionEndDate, validityDisruptionEndTime)
            .add(2 * 7, "day")
            .toISOString(),
    },
];

const dailyValidityDisruptionEndTime = "1200";
const dailyValditityDisruptionEndDate = "05/05/2023";

const dailyValidity: Validity = {
    disruptionStartDate: "05/05/2023",
    disruptionStartTime: "1000",
    disruptionEndDate: dailyValditityDisruptionEndDate,
    disruptionEndTime: dailyValidityDisruptionEndTime,
    disruptionRepeats: "daily",
    disruptionRepeatsEndDate: "12/05/2023",
};

const dailyValidityPeriodOutput: Period[] = [
    {
        StartTime: getDatetimeFromDateAndTime(
            dailyValidity.disruptionStartDate,
            dailyValidity.disruptionStartTime,
        ).toISOString(),
        EndTime: getDatetimeFromDateAndTime(
            dailyValditityDisruptionEndDate,
            dailyValidityDisruptionEndTime,
        ).toISOString(),
    },
    {
        StartTime: getDatetimeFromDateAndTime(dailyValidity.disruptionStartDate, dailyValidity.disruptionStartTime)
            .add(1, "day")
            .toISOString(),
        EndTime: getDatetimeFromDateAndTime(dailyValditityDisruptionEndDate, dailyValidityDisruptionEndTime)
            .add(1, "day")
            .toISOString(),
    },
    {
        StartTime: getDatetimeFromDateAndTime(dailyValidity.disruptionStartDate, dailyValidity.disruptionStartTime)
            .add(2, "day")
            .toISOString(),
        EndTime: getDatetimeFromDateAndTime(dailyValditityDisruptionEndDate, dailyValidityDisruptionEndTime)
            .add(2, "day")
            .toISOString(),
    },
    {
        StartTime: getDatetimeFromDateAndTime(dailyValidity.disruptionStartDate, dailyValidity.disruptionStartTime)
            .add(3, "day")
            .toISOString(),
        EndTime: getDatetimeFromDateAndTime(dailyValditityDisruptionEndDate, dailyValidityDisruptionEndTime)
            .add(3, "day")
            .toISOString(),
    },
    {
        StartTime: getDatetimeFromDateAndTime(dailyValidity.disruptionStartDate, dailyValidity.disruptionStartTime)
            .add(4, "day")
            .toISOString(),
        EndTime: getDatetimeFromDateAndTime(dailyValditityDisruptionEndDate, dailyValidityDisruptionEndTime)
            .add(4, "day")
            .toISOString(),
    },
    {
        StartTime: getDatetimeFromDateAndTime(dailyValidity.disruptionStartDate, dailyValidity.disruptionStartTime)
            .add(5, "day")
            .toISOString(),
        EndTime: getDatetimeFromDateAndTime(dailyValditityDisruptionEndDate, dailyValidityDisruptionEndTime)
            .add(5, "day")
            .toISOString(),
    },
    {
        StartTime: getDatetimeFromDateAndTime(dailyValidity.disruptionStartDate, dailyValidity.disruptionStartTime)
            .add(6, "day")
            .toISOString(),
        EndTime: getDatetimeFromDateAndTime(dailyValditityDisruptionEndDate, dailyValidityDisruptionEndTime)
            .add(6, "day")
            .toISOString(),
    },
    {
        StartTime: getDatetimeFromDateAndTime(dailyValidity.disruptionStartDate, dailyValidity.disruptionStartTime)
            .add(7, "day")
            .toISOString(),
        EndTime: getDatetimeFromDateAndTime(dailyValditityDisruptionEndDate, dailyValidityDisruptionEndTime)
            .add(7, "day")
            .toISOString(),
    },
];

const nonRepeatingValidity: Validity = {
    disruptionStartDate: "15/05/2023",
    disruptionStartTime: "1000",
    disruptionRepeats: "doesntRepeat",
};

const nonRepeatingPeriod: Period[] = [
    {
        StartTime: getDatetimeFromDateAndTime(
            nonRepeatingValidity.disruptionStartDate,
            nonRepeatingValidity.disruptionStartTime,
        ).toISOString(),
    },
];

describe("siri tests", () => {
    it("should return expected periods for weekly validity when repeating end date day is between the end date and start date day", () => {
        expect(getValidityPeriod(weeklyValidity)).toEqual(weeklyValidityPeriodOutput);
    });

    it("should return expected periods for weekly validity when repeating end date day is on the same day as the end date day", () => {
        expect(getValidityPeriod({ ...weeklyValidity, disruptionRepeatsEndDate: "21/05/2023" })).toEqual(
            weeklyValidityPeriodOutput,
        );
    });

    it("should return expected periods for weekly validity when repeating end date day is on the same day as the start date day", () => {
        expect(getValidityPeriod({ ...weeklyValidity, disruptionRepeatsEndDate: "23/05/2023" })).toEqual(
            weeklyValidityPeriodOutput.concat({
                StartTime: getDatetimeFromDateAndTime(
                    weeklyValidity.disruptionStartDate,
                    weeklyValidity.disruptionStartTime,
                )
                    .add(3 * 7, "day")
                    .toISOString(),
                EndTime: getDatetimeFromDateAndTime(weeklyValidity.disruptionStartDate, validityDisruptionEndTime)
                    .add(3 * 7, "day")
                    .toISOString(),
            }),
        );
    });

    it("should return expected periods for weekly validity when repeating end date day is in between the start date and end date days", () => {
        expect(getValidityPeriod({ ...weeklyValidity, disruptionRepeatsEndDate: "18/05/2023" })).toEqual(
            weeklyValidityPeriodOutput.slice(0, -1).concat({
                StartTime: getDatetimeFromDateAndTime(
                    weeklyValidity.disruptionStartDate,
                    weeklyValidity.disruptionStartTime,
                )
                    .add(2 * 7, "day")
                    .toISOString(),
                EndTime: getDatetimeFromDateAndTime("18/05/2023", validityDisruptionEndTime).toISOString(),
            }),
        );
    });

    it("should return expected periods for daily validity", () => {
        expect(getValidityPeriod(dailyValidity)).toEqual(dailyValidityPeriodOutput);
    });

    it("should return expected periods for non repeating validity without end date", () => {
        expect(getValidityPeriod(nonRepeatingValidity)).toEqual(nonRepeatingPeriod);
    });

    it("should return expected periods for non repeating validity with end date and time", () => {
        expect(
            getValidityPeriod({ ...nonRepeatingValidity, disruptionEndDate: "23/07/2023", disruptionEndTime: "1000" }),
        ).toEqual([
            {
                StartTime: getDatetimeFromDateAndTime(
                    nonRepeatingValidity.disruptionStartDate,
                    nonRepeatingValidity.disruptionStartTime,
                ).toISOString(),
                EndTime: getDatetimeFromDateAndTime("23/07/2023", "1000").toISOString(),
            },
        ]);
    });
});
