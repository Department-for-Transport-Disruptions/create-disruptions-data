import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import Header from "./Header";

describe("Header", () => {
    it("should render correctly", () => {
        const tree = renderer.create(<Header />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
