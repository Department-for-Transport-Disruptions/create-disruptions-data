import { describe, expect, it } from "vitest";
import renderer from "react-test-renderer";
import AddOperator, { AddOperatorPageProps } from "./add-operator.page";

const blankInputs: AddOperatorPageProps = {
    inputs: {},
    errors: [],
};

const withInputs: AddOperatorPageProps = {
    inputs: {
        operatorName: "dummy",
      nocCodes:
    },
    errors: [],
};

describe("addUser", () => {
    it("should render correctly when there are no inputs", () => {
        const tree = renderer.create(<AddOperator {...blankInputs} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with inputs", () => {
        const tree = renderer.create(<AddOperator {...withInputs} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
