import renderer from "react-test-renderer";
import { describe, expect, it, vi } from "vitest";
import { TestInputs } from "../../interfaces";
import TimeSelector from "./TimeSelector";

describe("TimeSelector", () => {
    it("should render correctly with no inputs", () => {
        const tree = renderer
            .create(
                <TimeSelector<TestInputs>
                    display="Start time"
                    value={""}
                    disabled={false}
                    inputName="field1"
                    stateUpdater={vi.fn()}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with inputs", () => {
        const tree = renderer
            .create(
                <TimeSelector<TestInputs>
                    display="Start time"
                    value={"0900"}
                    disabled={false}
                    inputName="field1"
                    stateUpdater={vi.fn()}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with errors", () => {
        const tree = renderer
            .create(
                <TimeSelector<TestInputs>
                    display="Start time"
                    hint="Test Hint"
                    value={"three thirty"}
                    initialErrors={[{ errorMessage: "There was an error", id: "disruption-reason" }]}
                    disabled={false}
                    inputName="field1"
                    stateUpdater={vi.fn()}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly when disabled", () => {
        const tree = renderer
            .create(
                <TimeSelector<TestInputs>
                    display="Start time"
                    value={"three thirty"}
                    disabled
                    inputName="field1"
                    stateUpdater={vi.fn()}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
