import * as React from "react";
import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import Contact from "./contact";

describe("contact", () => {
    it("should render correctly", () => {
        const tree = renderer.create(<Contact />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
