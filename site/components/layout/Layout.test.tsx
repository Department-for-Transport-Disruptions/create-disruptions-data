import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Layout from "./Layout";

describe("Layout", () => {
    it("should render correctly", () => {
        const { asFragment } = render(<Layout title="title" description="description" />);
        expect(asFragment()).toMatchSnapshot();
    });
});
