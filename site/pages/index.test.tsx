import renderer from "react-test-renderer";
import { describe, expect, it } from "vitest";
import Index from "./index.page";

describe("index", () => {
    it("should render correctly", () => {
        const tree = renderer.create(<Index />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
