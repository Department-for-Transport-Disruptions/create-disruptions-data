import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import CreateDisruption from "./create-disruption";
import { DisruptionInfo } from "../interfaces";
import { MiscellaneousReason } from "@create-disruptions-data/shared-ts/siriTypes";

const blankInputs: DisruptionInfo = {
    disruptionStartDate: "",
    disruptionEndDate: "",
    disruptionStartTime: "",
    disruptionEndTime: "",
    publishStartDate: "",
    publishEndDate: "",
    publishStartTime: "",
    publishEndTime: "",
    summary: "",
    description: "",
    associatedLink: "",
    disruptionRepeats: "",
    disruptionIsNoEndDateTime: "",
    publishIsNoEndDateTime: "",
};

const withInputs: DisruptionInfo = {
    typeOfDisruption: "planned",
    disruptionStartDate: "01/01/2023",
    disruptionEndDate: "08/01/2023",
    disruptionStartTime: "0900",
    disruptionEndTime: "2000",
    publishStartDate: "10/01/2023",
    publishEndDate: "18/01/2023",
    publishStartTime: "0200",
    publishEndTime: "2000",
    summary: "This is a summary",
    description: "This is a description",
    disruptionRepeats: "yes",
    disruptionIsNoEndDateTime: "disruptionNoEndDateTime",
    publishIsNoEndDateTime: "publishNoEndDateTime",
    disruptionReason: MiscellaneousReason.roadWorks,
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
