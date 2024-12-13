import { describe, expect, it } from "vitest";
import { exportDisruption } from "../../testData/mockData";
import DownloadPDF from "./DownloadPDF";

describe("DownloadPDF", () => {
    it("should render correctly", () => {
        // biome-ignore lint/correctness/noRenderReturnValue: <explanation>
        const actual = ReactDOM.render(<DownloadPDF disruptions={exportDisruption} />, document.getElementById("root"));
        expect(actual).toMatchSnapshot();
    });
});
