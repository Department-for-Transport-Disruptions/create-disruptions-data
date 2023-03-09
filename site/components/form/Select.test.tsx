import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import renderer from "react-test-renderer";
import { describe, it, expect, vi } from "vitest";
import Select from "./Select";
import { DISRUPTION_REASONS } from "../../constants";
import { PageInputs } from "../../pages/create-disruption";

describe("Select", () => {
    it("should render correctly with no errors", () => {
        const tree = renderer
            .create(
                <Select<PageInputs>
                    inputId="disruption-reason"
                    inputName="disruptionReason"
                    display="Reason for disruption"
                    defaultDisplay="Select a reason"
                    errorMessage="Select a reason from the dropdown"
                    selectValues={DISRUPTION_REASONS}
                    stateUpdater={vi.fn()}
                    value={""}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with errors", () => {
        const tree = renderer
            .create(
                <Select<PageInputs>
                    inputId="disruption-reason"
                    inputName="disruptionReason"
                    display="Reason for disruption"
                    defaultDisplay="Select a reason"
                    errorMessage="Select a reason from the dropdown"
                    selectValues={DISRUPTION_REASONS}
                    stateUpdater={vi.fn()}
                    value={""}
                    initialErrors={[{ errorMessage: "There was an error", id: "disruption-reason" }]}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should validate minLength and display error", async () => {
        const { unmount } = render(
            <Select<PageInputs>
                inputId="disruption-reason"
                inputName="disruptionReason"
                display="Reason for disruption"
                defaultDisplay="Select a reason"
                errorMessage="Select a reason from the dropdown"
                selectValues={DISRUPTION_REASONS}
                stateUpdater={vi.fn()}
                value={""}
            />,
        );

        await userEvent.click(screen.getByText("Select a reason"));
        await userEvent.tab();

        expect(screen.getByText("Select a reason")).toBeTruthy();

        unmount();
    });
});
