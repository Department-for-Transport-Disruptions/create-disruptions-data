import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Privacy from "./privacy.page";

describe("privacy", () => {
    it("should render correctly", () => {
        const { container } = render(<Privacy />);
        expect(container).toMatchSnapshot();
    });
});
