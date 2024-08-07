import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PhaseBanner from "./PhaseBanner";

describe("PhaseBanner", () => {
    it("should render correctly", () => {
        const { asFragment } = render(<PhaseBanner />);
        expect(asFragment()).toMatchSnapshot();
    });
});
