import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Footer from "./Footer";

describe("Footer", () => {
    it("should render correctly", () => {
        const { asFragment } = render(<Footer />);
        expect(asFragment()).toMatchSnapshot();
    });
});
