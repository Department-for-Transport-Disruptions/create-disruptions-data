import { MiscellaneousReason } from "@create-disruptions-data/shared-ts/enums";
import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import CreateDisruption, { DisruptionPageProps } from "./[disruptionId].page";

const blankInputs: DisruptionPageProps = {
    errors: [],
    inputs: {},
};

const withInputs: DisruptionPageProps = {
    errors: [],
    inputs: {
        disruptionType: "planned",
        summary: "New disruption",
        description: "A truck broke the bridge",
        associatedLink: "www.bbc.com",
        disruptionReason: MiscellaneousReason.routeDiversion,
        validity: [
            {
                disruptionStartDate: "01/04/2023",
                disruptionEndDate: "01/08/2023",
                disruptionStartTime: "0100",
                disruptionEndTime: "0200",
                disruptionNoEndDateTime: "",
            },
        ],
        publishStartDate: "01/03/2023",
        publishEndDate: "01/08/2023",
        publishStartTime: "0200",
        publishEndTime: "2300",
    },
};

describe("pages", () => {
    describe("CreateDisruption", () => {
        it("should render correctly with no inputs", () => {
            const tree = renderer.create(<CreateDisruption {...blankInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with inputs", () => {
            const tree = renderer.create(<CreateDisruption {...withInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });
    });
});
