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
