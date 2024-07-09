import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import renderer from "react-test-renderer";
import { describe, expect, it, vi } from "vitest";
import { TestInputs } from "../../interfaces";
import DateSelector from "./DateSelector";

describe("DateSelector", () => {
    it("should render correctly with no input", () => {
        const tree = renderer
            .create(
                <DateSelector<TestInputs>
                    display="Start date"
                    hint={{ hidden: false, text: "Enter in format DD/MM/YYYY" }}
                    value=""
                    disabled={false}
                    disablePast={false}
                    inputName="field1"
                    stateUpdater={vi.fn()}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with no input and the hint is hidden", () => {
        const tree = renderer
            .create(
                <DateSelector<TestInputs>
                    display="Start date"
                    hint={{ hidden: true, text: "Enter in format DD/MM/YYYY" }}
                    value=""
                    disabled={false}
                    disablePast={false}
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
                <DateSelector<TestInputs>
                    display="Start date"
                    hint={{ hidden: false, text: "Enter in format DD/MM/YYYY" }}
                    initialErrors={[{ errorMessage: "There was an error", id: "field1" }]}
                    value="sss"
                    disabled={false}
                    disablePast={false}
                    inputName="field1"
                    stateUpdater={vi.fn()}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with an input", () => {
        const tree = renderer
            .create(
                <DateSelector<TestInputs>
                    display="Start date"
                    hint={{ hidden: false, text: "Enter in format DD/MM/YYYY" }}
                    value="01/01/2024"
                    disabled={false}
                    disablePast={false}
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
                <DateSelector<TestInputs>
                    display="Start date"
                    hint={{ hidden: false, text: "Enter in format DD/MM/YYYY" }}
                    value="01/01/2024"
                    disabled
                    disablePast={false}
                    inputName="field1"
                    stateUpdater={vi.fn()}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should not error when the component is disabled", async () => {
        const { unmount } = render(
            <DateSelector<TestInputs>
                display="Start date"
                hint={{ hidden: false, text: "Enter in format DD/MM/YYYY" }}
                value=""
                disabled
                disablePast={false}
                inputName="field1"
                stateUpdater={vi.fn()}
            />,
        );

        await userEvent.click(screen.getByLabelText("Start date"));
        await userEvent.tab();

        expect(screen.queryByText("Select a date")).toBeFalsy();

        unmount();
    });
});
