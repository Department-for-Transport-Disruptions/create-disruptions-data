import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Accessibility from "./accessibility.page";

describe("accessibility", () => {
    it("should render correctly", () => {
        const { container } = render(<Accessibility />);
        expect(container).toMatchSnapshot();
    });
});
