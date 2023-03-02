import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import Layout from "./Layout";

describe("Layout", () => {
    it("should render correctly", () => {
        const tree = renderer.create(<Layout title="title" description="description" />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
