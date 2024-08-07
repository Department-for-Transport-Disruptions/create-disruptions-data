import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DISRUPTION_REASONS } from "../../constants";
import { TestInputs } from "../../interfaces";
import Select from "./Select";

describe("Select", () => {
    it("should render correctly with no errors", () => {
        const { asFragment } = render(
            <Select<TestInputs>
                inputName="field1"
                display="Reason for disruption"
                defaultDisplay="Select a reason"
                selectValues={DISRUPTION_REASONS}
                stateUpdater={vi.fn()}
                value=""
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with errors", () => {
        const { asFragment } = render(
            <Select<TestInputs>
                inputName="field1"
                display="Reason for disruption"
                defaultDisplay="Select a reason"
                selectValues={DISRUPTION_REASONS}
                stateUpdater={vi.fn()}
                value=""
                initialErrors={[{ errorMessage: "There was an error", id: "disruption-reason" }]}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
