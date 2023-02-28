import * as React from "react";
import renderer from "react-test-renderer";
import Footer from "../../components/layout/Footer";
import { describe, it, expect } from "vitest";

describe("Footer", () => {
    it("should render correctly", () => {
        const tree = renderer.create(<Footer />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
