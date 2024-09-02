import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import CookieDetails from "./cookie-details.page";

describe("pages", () => {
    describe("cookieDetails", () => {
        afterEach(cleanup);

        it("should render correctly", () => {
            const { asFragment } = render(<CookieDetails />);
            expect(asFragment()).toMatchSnapshot();
        });
    });
});
