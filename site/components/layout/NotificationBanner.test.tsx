import renderer from "react-test-renderer";
import { describe, expect, it } from "vitest";
import NotificationBanner from "./NotificationBanner";

describe("NotificationBanner", () => {
    it("should render correctly", () => {
        const tree = renderer.create(<NotificationBanner content={"Banner Text"} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
    it("should render correctly with link", () => {
        const tree = renderer
            .create(
                <NotificationBanner
                    title={"Very Important"}
                    content={"Banner Text"}
                    link={{ text: "look here", href: "www.google.com", afterLinkText: "." }}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
