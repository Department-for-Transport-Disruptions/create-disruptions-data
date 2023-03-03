import * as React from "react";
import renderer from "react-test-renderer";
import CreateDisruption from "./create-disruption";
import { describe, it, expect } from "vitest";
import { DisruptionValidity } from "../interfaces";

const blankInputs: DisruptionValidity = {
    startDate: "",
    endDate: "",
    startTimeHour: "",
    startTimeMinute: "",
    endTimeHour: "",
    endTimeMinute: "",
};

const withInputs: DisruptionValidity = {
    startDate: "01/01/2023",
    endDate: "08/01/2023",
    startTimeHour: "01",
    startTimeMinute: "20",
    endTimeHour: "11",
    endTimeMinute: "30",
};

describe("pages", () => {
    describe("CreateDisruption", () => {
        it("should render correctly with no inputs", () => {
            const tree = renderer.create(<CreateDisruption inputs={blankInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with inputs", () => {
            const tree = renderer.create(<CreateDisruption inputs={withInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });
    });
});
