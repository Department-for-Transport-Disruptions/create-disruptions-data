import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AddOperator, { AddOperatorPageProps } from './add-operator.page';

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

describe("AddOperator", () => {
    it("should render correctly when there are no inputs", () => {
        const { asFragment } = render(<AddOperator {...blankInputs} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with inputs", () => {
        const { asFragment } = render(<AddOperator {...withInputs} />);
        expect(asFragment()).toMatchSnapshot();
    });
});
