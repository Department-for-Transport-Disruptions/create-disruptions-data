import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Changelog from "./changelog.page";

afterEach(() => {
    cleanup();
});

describe("Changelog", () => {
    it("should render correctly", () => {
        const { asFragment } = render(<Changelog />);
        expect(asFragment()).toMatchSnapshot();
    });
});
