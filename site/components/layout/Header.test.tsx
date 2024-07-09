import renderer from "react-test-renderer";
import { describe, expect, it } from "vitest";
import { mockSession } from "../../testData/mockData";
import Header from "./Header";

describe("Header", () => {
    it("should render correctly without a session", () => {
        const tree = renderer.create(<Header session={null} csrfToken="" />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with a session", () => {
        const tree = renderer
            .create(
                <Header
                    session={{
                        ...mockSession,
                        isSystemAdmin: false,
                        isOrgPublisher: true,
                    }}
                    csrfToken=""
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
