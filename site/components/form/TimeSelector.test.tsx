import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TimeSelector from "./TimeSelector";
import { TestInputs } from "../../interfaces";

describe("TimeSelector", () => {
    it("should render correctly with no inputs", () => {
        const { asFragment } = render(
            <TimeSelector<TestInputs>
                display="Start time"
                value=""
                disabled={false}
                inputName="field1"
                stateUpdater={vi.fn()}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with inputs", () => {
        const { asFragment } = render(
            <TimeSelector<TestInputs>
                display="Start time"
                value="0900"
                disabled={false}
                inputName="field1"
                stateUpdater={vi.fn()}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with errors", () => {
        const { asFragment } = render(
            <TimeSelector<TestInputs>
                display="Start time"
                hint="Test Hint"
                value="three thirty"
                initialErrors={[{ errorMessage: "There was an error", id: "disruption-reason" }]}
                disabled={false}
                inputName="field1"
                stateUpdater={vi.fn()}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly when disabled", () => {
        const { asFragment } = render(
            <TimeSelector<TestInputs>
                display="Start time"
                value="three thirty"
                disabled
                inputName="field1"
                stateUpdater={vi.fn()}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
