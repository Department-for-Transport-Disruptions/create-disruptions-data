import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import CookieBanner from "../layout/CookieBanner";

describe("CookieBanner", () => {
    it("should render correctly", () => {
        const tree = renderer.create(<CookieBanner />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
