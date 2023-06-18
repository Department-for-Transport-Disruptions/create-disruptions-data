import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import DownloadPDF from "./DownloadPDF";
import { exportDisruption } from "../../testData/mockData";

describe("DownloadPDF", () => {
    it("should render correctly", () => {
        const tree = renderer.create(<DownloadPDF disruptions={exportDisruption} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
