import { Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import CreateConsequenceOperator, { ConsequenceOperatorPageInputs } from "./create-consequence-operator.page";
import { PageState } from "../interfaces";
import { ConsequenceType } from "../schemas/type-of-consequence.schema";

const blankInputs: PageState<Partial<ConsequenceOperatorPageInputs>> = {
    errors: [],
    inputs: {},
};

const withInputs: PageState<Partial<ConsequenceOperatorPageInputs>> = {
    errors: [],
    inputs: {
        consequenceOperator: "FSYO",
        description: "A truck broke down on a bridge",
        removeFromJourneyPlanners: "yes",
        disruptionDelay: "yes",
        disruptionSeverity: Severity.severe,
        disruptionDirection: "allDirections",
    },
};

const previousConsequenceInformation: ConsequenceType = {
    modeOfTransport: VehicleMode.ferryService,
    consequenceType: "operatorWide",
};

describe("pages", () => {
    describe("CreateConsequenceOperator", () => {
        it("should render correctly with no inputs", () => {
            const tree = renderer
                .create(
                    <CreateConsequenceOperator
                        inputs={blankInputs}
                        previousConsequenceInformation={previousConsequenceInformation}
                    />,
                )
                .toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with inputs", () => {
            const tree = renderer
                .create(
                    <CreateConsequenceOperator
                        inputs={withInputs}
                        previousConsequenceInformation={previousConsequenceInformation}
                    />,
                )
                .toJSON();
            expect(tree).toMatchSnapshot();
        });
    });
});
