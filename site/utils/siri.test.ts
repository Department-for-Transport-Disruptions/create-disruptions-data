import { Period } from "@create-disruptions-data/shared-ts/siriTypes";
import { describe, it, expect } from "vitest";
import { getValidityPeriod } from "./siri";
import { Validity } from "../schemas/create-disruption.schema";

const weeklyValidity: Validity = {
    disruptionStartDate: "02/05/2023",
    disruptionStartTime: "0900",
    disruptionEndDate: "07/05/2023",
    disruptionEndTime: "1000",
    disruptionRepeats: "weekly",
    disruptionRepeatsEndDate: "22/05/2023",
};

const weeklyValidityPeriodOutput: Period[] = [
    {
        StartTime: "2023-05-02T08:00:00.000Z",
        EndTime: "2023-05-07T09:00:00.000Z",
    },
    {
        StartTime: "2023-05-09T08:00:00.000Z",
        EndTime: "2023-05-14T09:00:00.000Z",
    },
    {
        StartTime: "2023-05-16T08:00:00.000Z",
        EndTime: "2023-05-21T09:00:00.000Z",
    },
];

const dailyValidity: Validity = {
    disruptionStartDate: "05/05/2023",
    disruptionStartTime: "1000",
    disruptionEndDate: "05/05/2023",
    disruptionEndTime: "1200",
    disruptionRepeats: "daily",
    disruptionRepeatsEndDate: "12/05/2023",
};

const dailyValidityPeriodOutput: Period[] = [
    {
        StartTime: "2023-05-05T09:00:00.000Z",
        EndTime: "2023-05-05T11:00:00.000Z",
    },
    {
        StartTime: "2023-05-06T09:00:00.000Z",
        EndTime: "2023-05-06T11:00:00.000Z",
    },
    {
        StartTime: "2023-05-07T09:00:00.000Z",
        EndTime: "2023-05-07T11:00:00.000Z",
    },
    {
        StartTime: "2023-05-08T09:00:00.000Z",
        EndTime: "2023-05-08T11:00:00.000Z",
    },
    {
        StartTime: "2023-05-09T09:00:00.000Z",
        EndTime: "2023-05-09T11:00:00.000Z",
    },
    {
        StartTime: "2023-05-10T09:00:00.000Z",
        EndTime: "2023-05-10T11:00:00.000Z",
    },
    {
        StartTime: "2023-05-11T09:00:00.000Z",
        EndTime: "2023-05-11T11:00:00.000Z",
    },
    {
        StartTime: "2023-05-12T09:00:00.000Z",
        EndTime: "2023-05-12T11:00:00.000Z",
    },
];

const nonRepeatingValidity: Validity = {
    disruptionStartDate: "15/05/2023",
    disruptionStartTime: "1000",
    disruptionRepeats: "doesntRepeat",
};

const nonRepeatingPeriod: Period[] = [
    {
        StartTime: "2023-05-15T09:00:00.000Z",
    },
];

describe("siri tests", () => {
    it.each([
        [weeklyValidity, weeklyValidityPeriodOutput],
        [{ ...weeklyValidity, disruptionRepeatsEndDate: "21/05/2023" }, weeklyValidityPeriodOutput],
        [
            { ...weeklyValidity, disruptionRepeatsEndDate: "23/05/2023" },
            weeklyValidityPeriodOutput.concat({
                StartTime: "2023-05-23T08:00:00.000Z",
                EndTime: "2023-05-23T09:00:00.000Z",
            }),
        ],
        [
            { ...weeklyValidity, disruptionRepeatsEndDate: "18/05/2023" },
            weeklyValidityPeriodOutput.slice(0, -1).concat({
                StartTime: "2023-05-16T08:00:00.000Z",
                EndTime: "2023-05-18T09:00:00.000Z",
            }),
        ],
        [dailyValidity, dailyValidityPeriodOutput],
        [nonRepeatingValidity, nonRepeatingPeriod],
        [
            { ...nonRepeatingValidity, disruptionEndDate: "23/07/2023", disruptionEndTime: "1000" },
            [
                {
                    StartTime: "2023-05-15T09:00:00.000Z",
                    EndTime: "2023-07-23T09:00:00.000Z",
                },
            ],
        ],
    ])("should return expect periods for validity", (validity, result) => {
        expect(getValidityPeriod(validity)).toEqual(result);
    });
});
