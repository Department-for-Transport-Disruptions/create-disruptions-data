import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import Index from "./index";

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
