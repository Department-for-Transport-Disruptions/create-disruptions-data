import * as React from "react";
import renderer from "react-test-renderer";
import Index from "./index";
import { describe, it, expect } from "vitest";

describe("pages", () => {
    describe("operator", () => {
        it("should render correctly", () => {
            const tree = renderer.create(<Index />).toJSON();
            expect(tree).toMatchSnapshot();
        });

        it("should render correctly with no multiple operators", () => {
            const tree = renderer.create(<Index />).toJSON();
            expect(tree).toMatchSnapshot();
        });
    });
});
