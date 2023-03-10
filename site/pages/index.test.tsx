import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import Index from "./index.page";

describe("index", () => {
    it("should render correctly", () => {
        const tree = renderer.create(<Index />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
