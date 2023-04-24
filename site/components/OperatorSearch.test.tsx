import renderer from "react-test-renderer";
import { describe, it, expect, vi } from "vitest";
import { mockOperators } from "../testData/mockData";
import OperatorSearch from "./OperatorSearch";

describe("OperatorSearch", () => {
    it("should render correctly with no errors", () => {
        const tree = renderer
            .create(
                <OperatorSearch
                    display="Operators impacted"
                    displaySize="l"
                    operators={mockOperators}
                    selectedOperatorNocs={[]}
                    stateUpdater={vi.fn()}
                    initialErrors={[]}
                    inputName="consequenceOperators"
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with errors", () => {
        const tree = renderer
            .create(
                <OperatorSearch
                    display="Operators impacted"
                    displaySize="l"
                    operators={mockOperators}
                    selectedOperatorNocs={[]}
                    stateUpdater={vi.fn()}
                    initialErrors={[{ errorMessage: "Select one or more operators", id: "consequence-operators" }]}
                    inputName="consequenceOperators"
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
