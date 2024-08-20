import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SummaryList from "./SummaryList";

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

        const { asFragment } = render(<SummaryList rows={rows} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("matches the snapshot with rows without actions", () => {
        const rows = [
            {
                header: "Header 1",
                value: "Value 1",
            },
        ];

        const { asFragment } = render(<SummaryList rows={rows} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("matches the snapshot with ReactNode as value", () => {
        const rows = [
            {
                header: "Header 1",
                value: <span>ReactNode Value</span>,
            },
        ];

        const { asFragment } = render(<SummaryList rows={rows} />);
        expect(asFragment()).toMatchSnapshot();
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

        const { asFragment } = render(<SummaryList rows={rows} />);
        expect(asFragment()).toMatchSnapshot();
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

        const { asFragment } = render(<SummaryList rows={rows} />);
        expect(asFragment()).toMatchSnapshot();
    });
});