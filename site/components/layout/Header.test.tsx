import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import Header from "./Header";

describe("Header", () => {
    it("should render correctly without a session", () => {
        const tree = renderer.create(<Header session={null} csrfToken="" />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with a session", () => {
        const tree = renderer
            .create(<Header session={{ email: "test@example.com", username: "test", orgId: "org" }} csrfToken="" />)
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
