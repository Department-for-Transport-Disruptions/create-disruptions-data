import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import PDFRows from "./PDFRows";

const exportDisruption = [
    {
        id: 0,
        title: "Test summary",
        mode: "Bus",
        "operator wide": "yes",
        "network wide": "no",
        "services affected": 0,
        "stops affected": 5,
        start: "Tue 24 May 2023",
        end: "Tue 24 May 2023",
        severity: "Unknown",
        live: "yes",
        status: "Pending Approval",
    },
];
describe("PDFRows", () => {
    it("should render correctly", () => {
        const tree = renderer.create(<PDFRows disruptions={exportDisruption} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
