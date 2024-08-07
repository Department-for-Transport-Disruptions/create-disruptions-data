import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { mockSession } from "../../testData/mockData";
import Header from "./Header";

describe("Header", () => {
    it("should render correctly without a session", () => {
        const { asFragment } = render(<Header session={null} csrfToken="" />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with a session", () => {
        const { asFragment } = render(
            <Header
                session={{
                    ...mockSession,
                    isSystemAdmin: false,
                    isOrgPublisher: true,
                }}
                csrfToken=""
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
