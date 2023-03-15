import { VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import { z } from "zod";
import CreateConsequenceNetwork, { ConsequenceNetworkPageState } from "./create-consequence-network.page";
import { typeOfConsequenceSchema } from "../schemas/type-of-consequence.schema";

const blankInputs: ConsequenceNetworkPageState = {
    errors: [],
    inputs: {
        description: "",
        "remove-from-journey-planners": "",
        "disruption-delay": "",
        "disruption-severity": "",
        "disruption-direction": "",
    },
};

const withInputs: ConsequenceNetworkPageState = {
    errors: [],
    inputs: {
        description: "A truck broke down on a bridge",
        "remove-from-journey-planners": "yes",
        "disruption-delay": "yes",
        "disruption-severity": "severe",
        "disruption-direction": "yes",
    },
};

const previousConsequenceInformation: z.infer<typeof typeOfConsequenceSchema> = {
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
