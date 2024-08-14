import { render, screen, cleanup } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi, afterEach } from "vitest";
import DateSelector from "./DateSelector";
import { TestInputs } from "../../interfaces";

afterEach(cleanup);

describe("DateSelector", () => {
    it("should render correctly with no input", () => {
        const { asFragment } = render(
            <DateSelector<TestInputs>
                display="Start date"
                hint={{ hidden: false, text: "Enter in format DD/MM/YYYY" }}
                value=""
                disabled={false}
                disablePast={false}
                inputName="field1"
                stateUpdater={vi.fn()}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with hint hidden", () => {
        const { asFragment } = render(
            <DateSelector<TestInputs>
                display="Start date"
                hint={{ hidden: true, text: "Enter in format DD/MM/YYYY" }}
                value=""
                disabled={false}
                disablePast={false}
                inputName="field1"
                stateUpdater={vi.fn()}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with errors", () => {
        const { asFragment } = render(
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
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with an input", () => {
        const { asFragment } = render(
            <DateSelector<TestInputs>
                display="Start date"
                hint={{ hidden: false, text: "Enter in format DD/MM/YYYY" }}
                value="01/01/2024"
                disabled={false}
                disablePast={false}
                inputName="field1"
                stateUpdater={vi.fn()}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly when disabled", () => {
        const { asFragment } = render(
            <DateSelector<TestInputs>
                display="Start date"
                hint={{ hidden: false, text: "Enter in format DD/MM/YYYY" }}
                value="01/01/2024"
                disabled
                disablePast={false}
                inputName="field1"
                stateUpdater={vi.fn()}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("should not show error when the component is disabled", async () => {
        render(
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
    });
});
