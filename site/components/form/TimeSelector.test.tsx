import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import renderer from "react-test-renderer";
import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import TimeSelector from "./TimeSelector";
import { TestInputs } from "../../interfaces";
import { setZodDefaultError } from "../../utils";

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

    it("should validate minLength and display error", async () => {
        const { unmount } = render(
            <TimeSelector<TestInputs>
                display="Start time"
                hint="Test Hint"
                value={""}
                disabled={false}
                inputName="field1"
                stateUpdater={vi.fn()}
                initialErrors={[]}
                schema={z.string(setZodDefaultError("Error: Test Error")).min(1)}
            />,
        );

        await userEvent.click(screen.getByLabelText("Start time"));
        await userEvent.tab();

        expect(screen.getByText("Error: Test Error")).toBeTruthy();

        unmount();
    });

    it("should not display error if the component is disabled", async () => {
        const { unmount } = render(
            <TimeSelector<TestInputs>
                display="Start time"
                hint="Test Hint"
                value={""}
                disabled
                inputName="field1"
                stateUpdater={vi.fn()}
                schema={z.string(setZodDefaultError("Error: Test Error")).min(1)}
            />,
        );

        await userEvent.click(screen.getByLabelText("Start time"));
        await userEvent.tab();

        expect(screen.queryByText("Error: Test Error")).toBeFalsy();

        unmount();
    });
});
