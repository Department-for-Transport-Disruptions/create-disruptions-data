import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import Header from "./Header";
import { mockSession } from "../../testData/mockData";

describe("Header", () => {
    it("should render correctly without a session", () => {
        const tree = renderer.create(<Header session={null} csrfToken="" />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with a session", () => {
        const tree = renderer
            .create(<Header session={{ ...mockSession, isSystemAdmin: false, isOrgPublisher: true }} csrfToken="" />)
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
