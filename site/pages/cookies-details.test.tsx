import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import CookieDetails from "./cookie-details.page";

describe("pages", () => {
    describe("cookieDetails", () => {
        it("should render correctly", () => {
            const tree = renderer.create(<CookieDetails />).toJSON();
            expect(tree).toMatchSnapshot();
        });
    });
});
