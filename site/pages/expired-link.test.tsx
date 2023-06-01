import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import ExpiredLink from "./expired-link.page";

describe("expiredLink", () => {
    it("should render correctly", () => {
        const tree = renderer.create(<ExpiredLink />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
