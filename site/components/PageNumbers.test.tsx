import renderer from "react-test-renderer";
import { describe, it, expect, vi } from "vitest";
import PageNumbers from "./PageNumbers";

describe("PageNumbers", () => {
    it("should render correctly when there are less than 10 pages", () => {
        const tree = renderer
            .create(<PageNumbers currentPage={1} numberOfPages={8} setCurrentPage={vi.fn()} />)
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly when there are 10 pages and the current page is 1", () => {
        const tree = renderer
            .create(<PageNumbers currentPage={1} numberOfPages={10} setCurrentPage={vi.fn()} />)
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly when there are 10 pages and the current page is 5", () => {
        const tree = renderer
            .create(<PageNumbers currentPage={1} numberOfPages={10} setCurrentPage={vi.fn()} />)
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
