import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import CreateDisruption from "./create-disruption";
import { DisruptionInfo } from "../interfaces";

const blankInputs: DisruptionInfo = {
    validityStartDateDay: "",
    validityEndDateDay: "",
    validityStartTimeHour: "",
    validityEndTimeHour: "",
    validityStartTimeMinute: "",
    validityEndTimeMinute: "",
    publishStartDateDay: "",
    publishEndDateDay: "",
    publishStartTimeHour: "",
    publishEndTimeHour: "",
    publishStartTimeMinute: "",
    publishEndTimeMinute: "",
    summary: "",
    description: "",
    associatedLink: "",
    disruptionRepeats: "",
    validityIsNoEndDateTime: "",
    publishIsNoEndDateTime: "",
};

const withInputs: DisruptionInfo = {
    validityStartDateDay: "01/01/2023",
    validityEndDateDay: "08/01/2023",
    validityStartTimeHour: "01",
    validityStartTimeMinute: "20",
    validityEndTimeHour: "11",
    validityEndTimeMinute: "30",
    publishStartDateDay: "10/01/2023",
    publishEndDateDay: "18/01/2023",
    publishStartTimeHour: "02",
    publishStartTimeMinute: "20",
    publishEndTimeHour: "15",
    publishEndTimeMinute: "45",
    summary: "This is a summary",
    description: "This is a description",
    associatedLink: "https://google.com",
    disruptionRepeats: "yes",
    validityIsNoEndDateTime: "validityNoEndDateTime",
    publishIsNoEndDateTime: "publishNoEndDateTime",
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
