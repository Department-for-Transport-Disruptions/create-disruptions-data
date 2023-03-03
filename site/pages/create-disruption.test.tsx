import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import CreateDisruption from "./create-disruption";
import { DisruptionInfo } from "../interfaces";

const blankInputs: DisruptionInfo = {
    validityStartDate: "",
    validityEndDate: "",
    validityStartTimeHour: "",
    validityEndTimeHour: "",
    validityStartTimeMinute: "",
    validityEndTimeMinute: "",
    publishStartDate: "",
    publishEndDate: "",
    publishStartTimeHour: "",
    publishEndTimeHour: "",
    publishStartTimeMinute: "",
    publishEndTimeMinute: "",
};

const withInputs: DisruptionInfo = {
    validityStartDate: "01/01/2023",
    validityEndDate: "08/01/2023",
    validityStartTimeHour: "01",
    validityStartTimeMinute: "20",
    validityEndTimeHour: "11",
    validityEndTimeMinute: "30",
    publishStartDate: "10/01/2023",
    publishEndDate: "18/01/2023",
    publishStartTimeHour: "02",
    publishStartTimeMinute: "20",
    publishEndTimeHour: "15",
    publishEndTimeMinute: "45",
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
