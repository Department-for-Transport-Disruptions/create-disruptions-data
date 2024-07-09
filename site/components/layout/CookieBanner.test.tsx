import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import CookieBanner from "../layout/CookieBanner";

describe("CookieBanner", () => {
    it("should render correctly", () => {
        const { container } = render(<CookieBanner />);
        expect(container).toMatchSnapshot();
    });

    it("should render correctly when accept all is clicked", () => {
        const { container } = render(<CookieBanner />);
        const element = container.querySelector("#accept-all-button");
        if (element) {
            fireEvent.click(element);
        }
        expect(container).toMatchSnapshot();
    });

    afterEach(cleanup);
});
