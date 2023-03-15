import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import renderer from "react-test-renderer";
import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import Select from "./Select";
import { DISRUPTION_REASONS } from "../../constants";
import { TestInputs } from "../../interfaces";
import { setZodDefaultError } from "../../utils";

describe("Select", () => {
    it("should render correctly with no errors", () => {
        const tree = renderer
            .create(
                <Select<TestInputs>
                    inputName="field1"
                    display="Reason for disruption"
                    defaultDisplay="Select a reason"
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
                <Select<TestInputs>
                    inputName="field1"
                    display="Reason for disruption"
                    defaultDisplay="Select a reason"
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
            <Select<TestInputs>
                inputName="field1"
                display="Reason for disruption"
                defaultDisplay="Select a reason"
                selectValues={DISRUPTION_REASONS}
                stateUpdater={vi.fn()}
                value={""}
                schema={z.literal("test", setZodDefaultError("Error: Select an option"))}
            />,
        );

        await userEvent.click(screen.getByText("Select a reason"));
        await userEvent.tab();

        expect(screen.getByText("Error: Select an option")).toBeTruthy();

        unmount();
    });
});
