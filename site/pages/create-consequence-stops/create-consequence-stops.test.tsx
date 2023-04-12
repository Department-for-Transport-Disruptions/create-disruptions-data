import { Severity } from "@create-disruptions-data/shared-ts/enums";
import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import CreateConsequenceStops, { CreateConsequenceStopsProps } from "./[disruptionId]/[consequenceIndex].page";

const blankInputs: CreateConsequenceStopsProps = {
    errors: [],
    inputs: {},
};

const withInputs: CreateConsequenceStopsProps = {
    errors: [],
    inputs: {
        stops: [
            {
                atcoCode: "0100BRP90310",
                commonName: "Temple Meads Stn",
                indicator: "T3",
                latitude: 51.44901,
                longitude: -2.58569,
            },
            {
                atcoCode: "0100BRP90311",
                commonName: "Temple Meads Stn",
                indicator: "T7",
                latitude: 51.45014,
                longitude: -2.5856,
            },
        ],
        description: "A truck broke down on a bridge",
        removeFromJourneyPlanners: "yes",
        disruptionDelay: "45",
        disruptionSeverity: Severity.severe,
    },
};

const withInputsAndErrors: CreateConsequenceStopsProps = {
    errors: [
        { errorMessage: "Enter a description for this disruption", id: "description" },
        { errorMessage: "Select at least one option", id: "removeFromJourneyPlanners" },
    ],
    inputs: {
        stops: [
            {
                atcoCode: "0100BRP90310",
                commonName: "Temple Meads Stn",
                indicator: "T3",
                latitude: 51.44901,
                longitude: -2.58569,
            },
            {
                atcoCode: "0100BRP90311",
                commonName: "Temple Meads Stn",
                indicator: "T7",
                latitude: 51.45014,
                longitude: -2.5856,
            },
        ],
        disruptionDelay: "45",
        disruptionSeverity: Severity.severe,
    },
};

describe("pages", () => {
    describe("CreateConsequenceStops", () => {
        it("should render correctly with no inputs", () => {
            const tree = renderer.create(<CreateConsequenceStops {...blankInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with inputs", () => {
            const tree = renderer.create(<CreateConsequenceStops {...withInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with errors and incorrect inputs", () => {
            const tree = renderer.create(<CreateConsequenceStops {...withInputsAndErrors} />).toJSON();
            expect(tree).toMatchSnapshot();
        });
    });
});
