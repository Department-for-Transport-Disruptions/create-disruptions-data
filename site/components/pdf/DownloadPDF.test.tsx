import renderer from "react-test-renderer";
import { describe, expect, it } from "vitest";
import { exportDisruption } from "../../testData/mockData";
import DownloadPDF from "./DownloadPDF";

describe("DownloadPDF", () => {
    it("should render correctly", () => {
        const tree = renderer.create(<DownloadPDF disruptions={exportDisruption} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
