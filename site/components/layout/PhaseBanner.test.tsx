import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import PhaseBanner from "./PhaseBanner";

describe("PhaseBanner", () => {
    it("should render correctly", () => {
        const tree = renderer.create(<PhaseBanner />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
