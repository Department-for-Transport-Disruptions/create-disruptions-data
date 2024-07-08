import renderer from "react-test-renderer";
import { describe, expect, it } from "vitest";
import Contact from "./contact.page";

describe("contact", () => {
    it("should render correctly", () => {
        const tree = renderer.create(<Contact />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
