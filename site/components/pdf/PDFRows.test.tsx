import renderer from "react-test-renderer";
import { describe, expect, it } from "vitest";
import { exportDisruption } from "../../testData/mockData";
import PDFRows from "./PDFRows";

describe("PDFRows", () => {
    it("should render correctly", () => {
        const tree = renderer.create(<PDFRows disruptions={exportDisruption} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
