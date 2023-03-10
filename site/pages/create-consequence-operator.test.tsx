import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import CreateConsequenceOperator, { ConsequenceOperatorPageState } from "./create-consequence-operator.page";

const blankInputs: ConsequenceOperatorPageState = {
    errors: [],
    inputs: {
        "consequence-operator": "",
        description: "",
        "remove-from-journey-planners": "",
        "disruption-delay": "",
        "disruption-severity": "",
        "disruption-direction": "",
    },
};

const withInputs: ConsequenceOperatorPageState = {
    errors: [],
    inputs: {
        "consequence-operator": "FSYO",
        description: "A truck broke down on a bridge",
        "remove-from-journey-planners": "yes",
        "disruption-delay": "yes",
        "disruption-severity": "severe",
        "disruption-direction": "yes",
    },
};

const previousConsequenceInformation = { modeOfTransport: "Bus", consequenceType: "Operator wide" };

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
