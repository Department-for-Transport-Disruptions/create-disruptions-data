import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ExportPopup from "./ExportPopup";

const confirmHandler = vi.fn();
const closePopUp = vi.fn();

describe("ExportPopup", () => {
    it("should render correctly", () => {
        const { container } = render(<ExportPopup confirmHandler={confirmHandler} closePopUp={closePopUp} />);
        expect(container).toMatchSnapshot();
    });
});
