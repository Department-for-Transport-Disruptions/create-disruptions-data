import * as React from "react";
import renderer from "react-test-renderer";
import Index from "./index";
import { describe, it, expect } from "vitest";

describe('index', () => {
    it("should render correctly", () => {
        const tree = renderer.create(<Index />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
