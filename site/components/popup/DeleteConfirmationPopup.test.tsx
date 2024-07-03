import renderer from "react-test-renderer";
import { describe, it, expect, vi } from "vitest";
import DeleteConfirmationPopup from "./DeleteConfirmationPopup";

const cancelActionHandler = vi.fn();

describe("DeleteConfirmationPopup", () => {
    it("should render correctly", () => {
        const tree = renderer
            .create(
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
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
