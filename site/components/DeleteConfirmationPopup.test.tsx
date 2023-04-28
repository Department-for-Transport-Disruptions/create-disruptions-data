import { cleanup, fireEvent, render } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import DeleteConfirmationPopup from "./DeleteConfirmationPopup";

const cancelActionHandler = vi.fn();

describe("DeleteConfirmationPopup", () => {
    it("should render correctly", () => {
        const { container } = render(
            <DeleteConfirmationPopup
                entityName="test"
                deleteUrl="https://test.com/api/delete"
                cancelActionHandler={cancelActionHandler}
                csrfToken="123"
                hiddenInputs={[
                    {
                        name: "id",
                        value: "acde070d-8c4c-4f0d-9d8a-162843c10333",
                    },
                ]}
            />,
        );
        expect(container).toMatchSnapshot();
    });

    it("should render correctly when delete is clicked", () => {
        const { container } = render(
            <DeleteConfirmationPopup
                entityName="test"
                deleteUrl="https://test.com/api/delete"
                cancelActionHandler={cancelActionHandler}
                csrfToken="123"
                hiddenInputs={[
                    {
                        name: "id",
                        value: "acde070d-8c4c-4f0d-9d8a-162843c10333",
                    },
                ]}
            />,
        );
        const element = container.querySelector("#popup-delete-button");
        if (element) {
            fireEvent.click(element);
        }
        expect(container).toMatchSnapshot();
    });

    it("should render correctly when return all is clicked", () => {
        const { container } = render(
            <DeleteConfirmationPopup
                entityName="test"
                deleteUrl="https://test.com/api/delete"
                cancelActionHandler={cancelActionHandler}
                csrfToken="123"
                hiddenInputs={[
                    {
                        name: "id",
                        value: "acde070d-8c4c-4f0d-9d8a-162843c10333",
                    },
                ]}
            />,
        );
        const element = container.querySelector("#popup-cancel-button");
        if (element) {
            fireEvent.click(element);
        }
        expect(container).toMatchSnapshot();
    });

    afterEach(cleanup);
});
