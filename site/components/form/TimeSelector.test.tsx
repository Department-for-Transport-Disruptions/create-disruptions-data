import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import renderer from "react-test-renderer";
import { describe, it, expect, vi } from "vitest";
import TimeSelector from "./TimeSelector";
import { TestInputs } from "../../interfaces";

describe("TimeSelector", () => {
    it("should render correctly with no inputs", () => {
        const tree = renderer
            .create(
                <TimeSelector<TestInputs>
                    display="Start time"
                    hint="Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm"
                    value={""}
                    errorMessage="Enter a start time for the disruption"
                    disabled={false}
                    inputId="field1"
                    inputName="disruptionStartTime"
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
                    hint="Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm"
                    value={"0900"}
                    errorMessage="Enter a start time for the disruption"
                    disabled={false}
                    inputId="field1"
                    inputName="disruptionStartTime"
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
                    hint="Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm"
                    value={"three thirty"}
                    initialErrors={[{ errorMessage: "There was an error", id: "disruption-reason" }]}
                    errorMessage="There was an error"
                    disabled={false}
                    inputId="field1"
                    inputName="disruptionStartTime"
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
                    hint="Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm"
                    value={"three thirty"}
                    errorMessage="There was an error"
                    disabled
                    inputId="field1"
                    inputName="disruptionStartTime"
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
                hint="Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm"
                value={""}
                errorMessage="Enter a start time for the disruption"
                disabled={false}
                inputId="field1"
                inputName="disruptionStartTime"
                stateUpdater={vi.fn()}
            />,
        );

        await userEvent.click(screen.getByLabelText("Start time"));
        await userEvent.tab();

        expect(screen.getByText("Enter a start time for the disruption")).toBeTruthy();

        unmount();
    });

    it("should not display error if the component is disabled", async () => {
        const { unmount } = render(
            <TimeSelector<TestInputs>
                display="Start time"
                hint="Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm"
                value={""}
                errorMessage="Enter a start time for the disruption"
                disabled
                inputId="field1"
                inputName="disruptionStartTime"
                stateUpdater={vi.fn()}
            />,
        );

        await userEvent.click(screen.getByLabelText("Start time"));
        await userEvent.tab();

        expect(screen.queryByText("Enter a start time for the disruption")).toBeFalsy();

        unmount();
    });
});
