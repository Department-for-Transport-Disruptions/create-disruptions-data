import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Warning from "./Warning";

describe("Warning", () => {
    it("should render correctly", () => {
        const { asFragment } = render(<Warning text="Test Warning Message" />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with optional props", () => {
        const { asFragment } = render(<Warning text="Test Warning Message" symbol="?" title="WARNING!!!" />);
        expect(asFragment()).toMatchSnapshot();
    });
});
