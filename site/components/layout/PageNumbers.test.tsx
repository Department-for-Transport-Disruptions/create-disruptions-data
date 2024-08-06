import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PageNumbers from "./PageNumbers";

describe("PageNumbers", () => {
    it("should not render anything when there are no pages", () => {
        const { asFragment } = render(<PageNumbers currentPage={0} numberOfPages={0} setCurrentPage={vi.fn()} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("should not render anything when there is one page", () => {
        const { asFragment } = render(<PageNumbers currentPage={1} numberOfPages={1} setCurrentPage={vi.fn()} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly when there are less than 10 pages", () => {
        const { asFragment } = render(<PageNumbers currentPage={1} numberOfPages={8} setCurrentPage={vi.fn()} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly when there are 10 pages and the current page is 1", () => {
        const { asFragment } = render(<PageNumbers currentPage={1} numberOfPages={10} setCurrentPage={vi.fn()} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly when there are 10 pages and the current page is 5", () => {
        const { asFragment } = render(<PageNumbers currentPage={5} numberOfPages={10} setCurrentPage={vi.fn()} />);
        expect(asFragment()).toMatchSnapshot();
    });
});
