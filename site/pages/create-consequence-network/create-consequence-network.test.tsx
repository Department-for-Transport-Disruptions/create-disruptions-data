import { Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import CreateConsequenceNetwork, { CreateConsequenceNetworkProps } from "./[disruptionId]/index.page";
import { ConsequenceType } from "../../schemas/type-of-consequence.schema";

const previousConsequenceInformation: ConsequenceType = {
    id: "test",
    vehicleMode: VehicleMode.bus,
    consequenceType: "networkWide",
};

const blankInputs: CreateConsequenceNetworkProps = {
    errors: [],
    inputs: {},
    previousConsequenceInformation,
};

const withInputs: CreateConsequenceNetworkProps = {
    errors: [],
    inputs: {
        description: "A truck broke down on a bridge",
        removeFromJourneyPlanners: "yes",
        disruptionDelay: "yes",
        disruptionSeverity: Severity.severe,
    },
    previousConsequenceInformation,
};

describe("pages", () => {
    describe("CreateConsequenceNetwork", () => {
        it("should render correctly with no inputs", () => {
            const tree = renderer.create(<CreateConsequenceNetwork {...blankInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with inputs", () => {
            const tree = renderer.create(<CreateConsequenceNetwork {...withInputs} />).toJSON();
            expect(tree).toMatchSnapshot();
        });
    });
});
