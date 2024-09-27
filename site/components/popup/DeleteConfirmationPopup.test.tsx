import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DeleteConfirmationPopup from "./DeleteConfirmationPopup";

const cancelActionHandler = vi.fn();

describe("DeleteConfirmationPopup", () => {
    afterEach(() => {
        cleanup();
    });

    it("should render correctly", () => {
        const { asFragment } = render(
            <DeleteConfirmationPopup
                isOpen={true}
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
        expect(asFragment()).toMatchSnapshot();
    });
});
