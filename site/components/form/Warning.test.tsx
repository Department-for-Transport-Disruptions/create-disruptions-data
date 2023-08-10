import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import Warning from "./Warning";

describe("Warning", () => {
    it("should render correctly", () => {
        const tree = renderer.create(<Warning text="Test Warning Message" />).toJSON();
        expect(tree).toMatchSnapshot();
    });
    it("should render correctly with optional props", () => {
        const tree = renderer.create(<Warning text="Test Warning Message" symbol="?" title="WARNING!!!" />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
