import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import Table from "./Table";

describe("Table", () => {
    it("should render correctly", () => {
        const tree = renderer
            .create(
                <Table
                    caption={{ text: "test table", size: "l" }}
                    columns={["test col 1", "test col 2"]}
                    rows={[
                        {
                            header: "test row 1",
                            cells: ["1"],
                        },
                        {
                            header: "test row 2",
                            cells: ["2"],
                        },
                    ]}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
    it("should render correctly without a header", () => {
        const tree = renderer
            .create(
                <Table
                    caption={{ text: "test table", size: "l" }}
                    columns={["test col 1", "test col 2"]}
                    rows={[
                        {
                            cells: ["1"],
                        },
                        {
                            cells: ["2"],
                        },
                    ]}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
    it("should render correctly with jsx element", () => {
        const tree = renderer
            .create(
                <Table
                    caption={{ text: "test table", size: "l" }}
                    columns={["test col 1", "test col 2"]}
                    rows={[
                        {
                            header: "test row 1",
                            cells: [<p key="test">test 1</p>],
                        },
                        {
                            header: "test row 2",
                            cells: ["2"],
                        },
                    ]}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
