import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Table from "./Table";

describe("Table", () => {
    it("should render correctly", () => {
        const { asFragment } = render(
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
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly without a header", () => {
        const { asFragment } = render(
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
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with jsx element", () => {
        const { asFragment } = render(
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
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
