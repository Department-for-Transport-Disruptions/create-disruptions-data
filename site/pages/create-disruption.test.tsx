import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import CreateDisruption from "./create-disruption.page";
import { DisruptionInfo } from "../interfaces";

const blankInputs: DisruptionInfo = {
    validityStartDate: "",
    validityEndDate: "",
    validityEndTime: "",
    validityStartTime: "",
    publishStartDate: "",
    publishEndDate: "",
    publishStartTime: "",
    publishEndTime: "",
};

const withInputs: DisruptionInfo = {
    validityStartDate: "01/01/2023",
    validityEndDate: "08/01/2023",
    validityStartTime: "0120",
    validityEndTime: "1130",
    publishStartDate: "10/01/2023",
    publishEndDate: "18/01/2023",
    publishStartTime: "0220",
    publishEndTime: "1545",
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
