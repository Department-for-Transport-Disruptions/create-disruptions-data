import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ExportPopup from "./ExportPopup";

const confirmHandler = vi.fn();
const closePopUp = vi.fn();

describe("ExportPopup", () => {
    it("should render correctly", () => {
        const { asFragment } = render(
            <ExportPopup confirmHandler={confirmHandler} closePopUp={closePopUp} isOpen={true} isExporting={false} />,
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
