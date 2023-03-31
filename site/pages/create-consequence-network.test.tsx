import { Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import CreateConsequenceNetwork, { ConsequenceNetworkPageInputs } from "./create-consequence-network.page";
import { PageState } from "../interfaces";
import { ConsequenceType } from "../schemas/type-of-consequence.schema";

const blankInputs: PageState<Partial<ConsequenceNetworkPageInputs>> = {
    errors: [],
    inputs: {},
};

const withInputs: PageState<Partial<ConsequenceNetworkPageInputs>> = {
    errors: [],
    inputs: {
        description: "A truck broke down on a bridge",
        removeFromJourneyPlanners: "yes",
        disruptionDelay: "yes",
        disruptionSeverity: Severity.severe,
    },
};

const previousConsequenceInformation: ConsequenceType = {
    modeOfTransport: VehicleMode.bus,
    consequenceType: "networkWide",
};

describe("pages", () => {
    describe("CreateConsequenceNetwork", () => {
        it("should render correctly with no inputs", () => {
            const tree = renderer
                .create(
                    <CreateConsequenceNetwork
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
                    <CreateConsequenceNetwork
                        inputs={withInputs}
                        previousConsequenceInformation={previousConsequenceInformation}
                    />,
                )
                .toJSON();
            expect(tree).toMatchSnapshot();
        });
    });
});
