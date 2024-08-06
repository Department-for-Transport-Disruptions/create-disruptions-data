import renderer from "react-test-renderer";
import SummaryList from "./SummaryList";
import { describe, expect, it } from "vitest";

describe("SummaryList Component", () => {
    it("matches the snapshot with rows, headers, values, and actions", () => {
        const rows = [
            {
                header: "Header 1",
                value: "Value 1",
                actions: [
                    {
                        link: "/path1",
                        actionName: "Action 1",
                    },
                ],
            },
            {
                header: "Header 2",
                value: "Value 2",
                actions: [
                    {
                        link: "/path2",
                        actionName: "Action 2",
                    },
                ],
            },
        ];

        const tree = renderer.create(<SummaryList rows={rows} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("matches the snapshot with rows without actions", () => {
        const rows = [
            {
                header: "Header 1",
                value: "Value 1",
            },
        ];

        const tree = renderer.create(<SummaryList rows={rows} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("matches the snapshot with ReactNode as value", () => {
        const rows = [
            {
                header: "Header 1",
                value: <span>ReactNode Value</span>,
            },
        ];

        const tree = renderer.create(<SummaryList rows={rows} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("renders the correct href and text for actions", () => {
        const rows = [
            {
                header: "Header 1",
                value: "Value 1",
                actions: [
                    {
                        link: "/path1",
                        actionName: "Action 1",
                    },
                ],
            },
        ];

        const tree = renderer.create(<SummaryList rows={rows} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("renders visually-hidden text for each action", () => {
        const rows = [
            {
                header: "Header 1",
                value: "Value 1",
                actions: [
                    {
                        link: "/path1",
                        actionName: "Action 1",
                    },
                ],
            },
        ];

        const tree = renderer.create(<SummaryList rows={rows} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
