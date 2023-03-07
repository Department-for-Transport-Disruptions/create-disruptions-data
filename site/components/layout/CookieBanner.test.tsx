import renderer from "react-test-renderer";
import Cookies from "universal-cookie";
import { vi, describe, it, expect, afterEach } from "vitest";
import CookieBanner from "../layout/CookieBanner";

describe("CookieBanner", () => {
    Cookies.prototype.set = vi.fn();

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should render correctly", () => {
        const tree = renderer.create(<CookieBanner />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
