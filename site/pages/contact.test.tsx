import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Contact from "./contact.page";

describe("contact", () => {
    afterEach(cleanup);

    it("should render correctly", () => {
        const { asFragment } = render(<Contact />);
        expect(asFragment()).toMatchSnapshot();
    });
});
