import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestInputs } from "../../interfaces";
import TextInput from "./TextInput";

describe("TextInput", () => {
    it("should render correctly with no errors", () => {
        const { asFragment } = render(
            <TextInput<TestInputs>
                inputName="field1"
                display="Test Field"
                stateUpdater={vi.fn()}
                widthClass="w-3/4"
                maxLength={50}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with errors", () => {
        const { asFragment } = render(
            <TextInput<TestInputs>
                initialErrors={[{ errorMessage: "There was an error", id: "summary" }]}
                inputName="field1"
                display="Test Field"
                stateUpdater={vi.fn()}
                widthClass="w-3/4"
                maxLength={50}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly as a text area with rows", () => {
        const { asFragment } = render(
            <TextInput<TestInputs>
                inputName="field1"
                display="Test Field"
                stateUpdater={vi.fn()}
                widthClass="w-3/4"
                maxLength={50}
                textArea
                rows={3}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly if input is disabled", () => {
        const { asFragment } = render(
            <TextInput<TestInputs>
                inputName="field1"
                display="Test Field"
                stateUpdater={vi.fn()}
                widthClass="w-3/4"
                maxLength={50}
                disabled={true}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
