import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import PDFRows from "./PDFRows";
import { exportDisruption } from "../../testData/mockData";

describe("PDFRows", () => {
    it("should render correctly", () => {
        const tree = renderer.create(<PDFRows disruptions={exportDisruption} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
