import renderer from "react-test-renderer";
import { describe, expect, it } from "vitest";
import AddOperator, { AddOperatorPageProps } from "./add-operator.page";

const blankInputs: AddOperatorPageProps = {
    inputs: {},
    errors: [],
};

const withInputs: AddOperatorPageProps = {
    inputs: {
        operatorName: "dummy",
        nocCodes: [{ id: 1, operatorPublicName: "Test Operator", nocCode: "TEST" }],
    },
    errors: [],
};

describe("addOperator", () => {
    it("should render correctly when there are no inputs", () => {
        const tree = renderer.create(<AddOperator {...blankInputs} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with inputs", () => {
        const tree = renderer.create(<AddOperator {...withInputs} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
