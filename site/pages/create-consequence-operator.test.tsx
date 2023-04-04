import { Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import CreateConsequenceOperator, { CreateConsequenceOperatorProps } from "./create-consequence-operator.page";
import { ConsequenceType } from "../schemas/type-of-consequence.schema";

const previousConsequenceInformation: ConsequenceType = {
    modeOfTransport: VehicleMode.ferryService,
    consequenceType: "operatorWide",
};

const blankInputs = {
    errors: [],
    inputs: {},
    previousConsequenceInformation,
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
    previousConsequenceInformation,
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
