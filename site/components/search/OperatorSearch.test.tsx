import { OperatorConsequence } from "@create-disruptions-data/shared-ts/disruptionTypes";
import renderer from "react-test-renderer";
import { describe, it, expect, vi } from "vitest";
import OperatorSearch from "./OperatorSearch";
import { mockOperators } from "../../testData/mockData";

describe("OperatorSearch", () => {
    it("should render correctly with no errors", () => {
        const tree = renderer
            .create(
                <OperatorSearch<OperatorConsequence>
                    display="Operators impacted"
                    displaySize="l"
                    operators={mockOperators}
                    selectedOperators={[]}
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
                <OperatorSearch<OperatorConsequence>
                    display="Operators impacted"
                    displaySize="l"
                    operators={mockOperators}
                    selectedOperators={[]}
                    stateUpdater={vi.fn()}
                    initialErrors={[{ errorMessage: "Select one or more operators", id: "consequence-operators" }]}
                    inputName="consequenceOperators"
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
