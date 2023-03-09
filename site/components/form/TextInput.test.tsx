import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import renderer from "react-test-renderer";
import { describe, it, expect, vi } from "vitest";
import TextInput from "./TextInput";

interface PageInputs {
    field1: string;
    field2: boolean;
    field3: string;
    field4: string;
}

describe("TextInput", () => {
    it("should render correctly with no errors", () => {
        const tree = renderer
            .create(
                <TextInput<PageInputs>
                    inputId="field1"
                    inputName="testField"
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
                <TextInput<PageInputs>
                    initialErrors={[{ errorMessage: "There was an error", id: "summary" }]}
                    inputId="field1"
                    inputName="testField"
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
                <TextInput<PageInputs>
                    inputId="field1"
                    inputName="testField"
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

    it("should validate input on blur and display error", async () => {
        const { unmount } = render(
            <TextInput<PageInputs>
                inputId="field1"
                inputName="testField"
                display="Test Field"
                errorMessage="Test Error Message"
                stateUpdater={vi.fn()}
                widthClass="w-3/4"
                maxLength={50}
            />,
        );

        await userEvent.click(screen.getByLabelText("Test Field"));
        await userEvent.tab();

        expect(screen.getByText("Test Error Message")).toBeTruthy();

        unmount();
    });

    it("should validate minLength and display error", async () => {
        const { unmount } = render(
            <TextInput<PageInputs>
                inputId="field2"
                inputName="testField"
                display="Test Field"
                errorMessage="Test Error Message"
                stateUpdater={vi.fn()}
                widthClass="w-3/4"
                minLength={15}
                maxLength={50}
            />,
        );

        await userEvent.type(screen.getByLabelText("Test Field"), "texttooshort");
        await userEvent.tab();

        expect(screen.getByText("Test Error Message")).toBeTruthy();

        unmount();
    });
});
