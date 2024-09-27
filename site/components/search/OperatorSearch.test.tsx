import { OperatorConsequence } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mockOperators } from "../../testData/mockData";
import OperatorSearch from "./OperatorSearch";

describe("OperatorSearch", () => {
    afterEach(() => {
        cleanup();
    });

    it("should render correctly with no errors", () => {
        const { asFragment } = render(
            <OperatorSearch<OperatorConsequence>
                display="Operators impacted"
                displaySize="l"
                operators={mockOperators}
                selectedOperators={[]}
                stateUpdater={vi.fn()}
                initialErrors={[]}
                inputName="consequenceOperators"
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with errors", () => {
        const { asFragment } = render(
            <OperatorSearch<OperatorConsequence>
                display="Operators impacted"
                displaySize="l"
                operators={mockOperators}
                selectedOperators={[]}
                stateUpdater={vi.fn()}
                initialErrors={[{ errorMessage: "Select one or more operators", id: "consequence-operators" }]}
                inputName="consequenceOperators"
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
