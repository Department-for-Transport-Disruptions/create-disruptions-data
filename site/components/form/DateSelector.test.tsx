import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import renderer from "react-test-renderer";
import { describe, it, expect, vi } from "vitest";
import DateSelector from "./DateSelector";
import { PageInputs } from "../../pages/create-disruption";

describe("DateSelector", () => {
    it("should render correctly with no input", () => {
        const tree = renderer
            .create(
                <DateSelector<PageInputs>
                    display="What is the start date?"
                    hiddenHint="Enter in format DD/MM/YYYY"
                    value=""
                    errorMessage="Select a date"
                    disabled={false}
                    disablePast={false}
                    inputId="disruption-start-date"
                    inputName="disruptionStartDate"
                    stateUpdater={vi.fn()}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with errors", () => {
        const tree = renderer
            .create(
                <DateSelector<PageInputs>
                    display="What is the start date?"
                    hiddenHint="Enter in format DD/MM/YYYY"
                    initialErrors={[{ errorMessage: "There was an error", id: "disruption-start-date" }]}
                    value="sss"
                    errorMessage="There was an error"
                    disabled={false}
                    disablePast={false}
                    inputId="disruption-start-date"
                    inputName="disruptionStartDate"
                    stateUpdater={vi.fn()}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with an input", () => {
        const tree = renderer
            .create(
                <DateSelector<PageInputs>
                    display="What is the start date?"
                    hiddenHint="Enter in format DD/MM/YYYY"
                    value="01/01/2024"
                    errorMessage="Select a date"
                    disabled={false}
                    disablePast={false}
                    inputId="disruption-start-date"
                    inputName="disruptionStartDate"
                    stateUpdater={vi.fn()}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly when disabled", () => {
        const tree = renderer
            .create(
                <DateSelector<PageInputs>
                    display="What is the start date?"
                    hiddenHint="Enter in format DD/MM/YYYY"
                    value="01/01/2024"
                    errorMessage="Select a date"
                    disabled
                    disablePast={false}
                    inputId="disruption-start-date"
                    inputName="disruptionStartDate"
                    stateUpdater={vi.fn()}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should validate minLength and display error", async () => {
        const { unmount } = render(
            <DateSelector<PageInputs>
                display="What is the start date?"
                hiddenHint="Enter in format DD/MM/YYYY"
                value=""
                errorMessage="Select a date"
                disabled={false}
                disablePast={false}
                inputId="disruption-start-date"
                inputName="disruptionStartDate"
                stateUpdater={vi.fn()}
            />,
        );

        await userEvent.click(screen.getByLabelText("What is the start date?"));
        await userEvent.tab();

        expect(screen.getByText("Select a date")).toBeTruthy();

        unmount();
    });
});
