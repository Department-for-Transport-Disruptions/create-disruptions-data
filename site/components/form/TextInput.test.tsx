import renderer from "react-test-renderer";
import { describe, it, expect, vi } from "vitest";
import TextInput from "./TextInput";
import { TestInputs } from "../../interfaces";

describe("TextInput", () => {
    it("should render correctly with no errors", () => {
        const tree = renderer
            .create(
                <TextInput<TestInputs>
                    inputName="field1"
                    display="Test Field"
                    stateUpdater={vi.fn()}
                    widthClass="w-3/4"
                    maxLength={50}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with errors", () => {
        const tree = renderer
            .create(
                <TextInput<TestInputs>
                    initialErrors={[{ errorMessage: "There was an error", id: "summary" }]}
                    inputName="field1"
                    display="Test Field"
                    stateUpdater={vi.fn()}
                    widthClass="w-3/4"
                    maxLength={50}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly as a text area with rows", () => {
        const tree = renderer
            .create(
                <TextInput<TestInputs>
                    inputName="field1"
                    display="Test Field"
                    stateUpdater={vi.fn()}
                    widthClass="w-3/4"
                    maxLength={50}
                    textArea
                    rows={3}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
