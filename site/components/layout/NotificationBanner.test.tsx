import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NotificationBanner from "./NotificationBanner";

describe("NotificationBanner", () => {
    it("should render correctly", () => {
        const { asFragment } = render(<NotificationBanner content="Banner Text" />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with link", () => {
        const { asFragment } = render(
            <NotificationBanner
                title="Very Important"
                content="Banner Text"
                link={{ text: "look here", href: "www.google.com", afterLinkText: "." }}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
