import { Severity } from "@create-disruptions-data/shared-ts/enums";
import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import CreateConsequenceOperator, { CreateConsequenceOperatorProps } from "./[disruptionId]/[consequenceIndex].page";

const blankInputs = {
    errors: [],
    inputs: {},
};

const withInputs: CreateConsequenceOperatorProps = {
    errors: [],
    inputs: {
        consequenceOperator: "FSYO",
        description: "A truck broke down on a bridge",
        removeFromJourneyPlanners: "yes",
        disruptionDelay: "yes",
        disruptionSeverity: Severity.severe,
    },
};

describe("pages", () => {
    describe("CreateConsequenceOperator", () => {
        it("should render correctly with no inputs", () => {
            const tree = renderer.create(<CreateConsequenceOperator {...blankInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with inputs", () => {
            const tree = renderer.create(<CreateConsequenceOperator {...withInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });
    });
});
