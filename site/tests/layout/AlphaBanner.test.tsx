import * as React from "react";
import renderer from "react-test-renderer";
import PhaseBanner from "../../components/layout/PhaseBanner";
import { describe, it, expect } from "vitest";

describe("PhaseBanner", () => {
    it("should render correctly", () => {
        const tree = renderer.create(<PhaseBanner />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
