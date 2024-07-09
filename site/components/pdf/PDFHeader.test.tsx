import renderer from "react-test-renderer";
import { describe, expect, it } from "vitest";
import PDFHeader from "./PDFHeader";

describe("PDFHeader", () => {
    it("should render correctly", () => {
        const tree = renderer.create(<PDFHeader />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
