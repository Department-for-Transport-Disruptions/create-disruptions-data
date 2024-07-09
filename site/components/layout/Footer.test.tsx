import renderer from "react-test-renderer";
import { describe, expect, it } from "vitest";
import Footer from "./Footer";

describe("Footer", () => {
    it("should render correctly", () => {
        const tree = renderer.create(<Footer />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
