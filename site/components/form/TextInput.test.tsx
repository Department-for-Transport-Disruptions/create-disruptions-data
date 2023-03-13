import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import renderer from "react-test-renderer";
import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import TextInput from "./TextInput";
import { TestInputs } from "../../interfaces";
import { setZodDefaultError } from "../../utils";

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

    it("should validate input on blur and display error", async () => {
        const { unmount } = render(
            <TextInput<TestInputs>
                inputName="field1"
                display="Test Field"
                stateUpdater={vi.fn()}
                widthClass="w-3/4"
                maxLength={50}
                schema={z.string(setZodDefaultError("Error: Test Error")).min(1)}
            />,
        );

        await userEvent.click(screen.getByLabelText("Test Field"));
        await userEvent.tab();

        expect(screen.getByText("Error: Test Error")).toBeTruthy();

        unmount();
    });

    it("should validate minLength and display error", async () => {
        const { unmount } = render(
            <TextInput<TestInputs>
                inputName="field2"
                display="Test Field"
                stateUpdater={vi.fn()}
                widthClass="w-3/4"
                maxLength={50}
                schema={z.string().min(15, "Error: Too Short")}
            />,
        );

        await userEvent.type(screen.getByLabelText("Test Field"), "texttooshort");
        await userEvent.tab();

        expect(screen.getByText("Error: Too Short")).toBeTruthy();

        unmount();
    });
});
