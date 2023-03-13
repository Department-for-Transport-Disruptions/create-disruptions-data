import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import CreateConsequenceNetwork, { ConsequenceNetworkPageState } from "./create-consequence-network.page";

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

const previousConsequenceInformation = { modeOfTransport: "Bus", consequenceType: "Network wide" };

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
