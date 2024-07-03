import renderer from "react-test-renderer";
import { describe, it, expect, vi } from "vitest";
import ExportPopup from "./ExportPopup";

const confirmHandler = vi.fn();
const closePopUp = vi.fn();

describe("ExportPopup", () => {
    it("should render correctly", () => {
        const tree = renderer
            .create(<ExportPopup confirmHandler={confirmHandler} closePopUp={closePopUp} isOpen={true} />)
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
