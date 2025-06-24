import { render } from "@testing-library/react";
import Link from "next/link";
import { describe, expect, it } from "vitest";
import Table from "../form/Table";
import Tabs from "./Tabs";

describe("Tabs", () => {
    it("should render correctly when given a table as the content", () => {
        const { asFragment } = render(
            <Tabs
                activeTabHeader={"live"}
                tabs={[
                    {
                        tabHeader: "Live",
                        content: (
                            <Table
                                caption={{ text: "Live disruptions", size: "l" }}
                                columns={["ID", "Summary", "Affected dates"]}
                                rows={[
                                    {
                                        header: (
                                            <Link className="govuk-link" href="/dashboard">
                                                1234
                                            </Link>
                                        ),
                                        cells: ["Test summary", "01/01/2023 onwards"],
                                    },
                                    {
                                        header: (
                                            <Link className="govuk-link" href="/dashboard">
                                                3211
                                            </Link>
                                        ),
                                        cells: ["Test summary", "02/01/2023 - 02/02-2024"],
                                    },
                                ]}
                            />
                        ),
                    },
                    {
                        tabHeader: "Upcoming",
                        content: (
                            <Table
                                caption={{ text: "Live disruptions", size: "l" }}
                                columns={["ID", "Summary", "Affected dates"]}
                                rows={[
                                    {
                                        header: (
                                            <Link className="govuk-link" href="/dashboard">
                                                1234
                                            </Link>
                                        ),
                                        cells: ["Test summary", "01/01/2023 onwards"],
                                    },
                                    {
                                        header: (
                                            <Link className="govuk-link" href="/dashboard">
                                                3211
                                            </Link>
                                        ),
                                        cells: ["Test summary", "02/01/2023 - 02/02-2024"],
                                    },
                                ]}
                            />
                        ),
                    },
                ]}
                tabsTitle="Disruptions"
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly when given simple text as the content", () => {
        const { asFragment } = render(
            <Tabs
                activeTabHeader={"live"}
                tabs={[
                    {
                        tabHeader: "Live",
                        content: <h1>Hello</h1>,
                    },
                    {
                        tabHeader: "Upcoming",
                        content: <h1>Test</h1>,
                    },
                ]}
                tabsTitle="Disruptions"
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
