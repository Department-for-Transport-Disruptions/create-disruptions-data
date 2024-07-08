import renderer from "react-test-renderer";
import { describe, expect, it, vi } from "vitest";
import { DISRUPTION_REASONS } from "../../constants";
import { TestInputs } from "../../interfaces";
import Select from "./Select";

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
});
