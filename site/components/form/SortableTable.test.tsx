import { render } from "@testing-library/react";
import Link from "next/link";
import { describe, expect, it } from "vitest";
import { DISRUPTION_DETAIL_PAGE_PATH, VIEW_ALL_DISRUPTIONS_PAGE_PATH } from "../../constants";
import SortableTable, { TableColumn } from "./SortableTable";

interface RandomTable {
    id: string | JSX.Element;
    name: string;
    start: string;
    role: string;
}

const defaultColumn: TableColumn<RandomTable>[] = [
    {
        displayName: "ID",
        key: "id",
    },
    {
        displayName: "Name",
        key: "name",
    },
    {
        displayName: "Start",
        key: "start",
        sortable: true,
    },
    {
        displayName: "Role",
        key: "role",
        sortable: true,
    },
];

const defaultData: RandomTable[] = [
    {
        id: (
            <Link
                className="govuk-link"
                href={{
                    pathname: `${DISRUPTION_DETAIL_PAGE_PATH}/id`,
                    query: { return: VIEW_ALL_DISRUPTIONS_PAGE_PATH },
                }}
                key="key-1"
            >
                aft62h
            </Link>
        ),
        name: "Random name1",
        start: "25/03/2023",
        role: "Engineer",
    },
    {
        id: (
            <Link
                className="govuk-link"
                href={{
                    pathname: `${DISRUPTION_DETAIL_PAGE_PATH}/id`,
                    query: { return: VIEW_ALL_DISRUPTIONS_PAGE_PATH },
                }}
                key="key-2"
            >
                aft62h
            </Link>
        ),
        name: "Random name4",
        start: "25/03/2023",
        role: "Architect",
    },
    {
        id: (
            <Link
                className="govuk-link"
                href={{
                    pathname: `${DISRUPTION_DETAIL_PAGE_PATH}/id`,
                    query: { return: VIEW_ALL_DISRUPTIONS_PAGE_PATH },
                }}
                key="key-3"
            >
                aft62h
            </Link>
        ),
        name: "Random name2",
        start: "20/04/2023",
        role: "Engineer",
    },
    {
        id: (
            <Link
                className="govuk-link"
                href={{
                    pathname: `${DISRUPTION_DETAIL_PAGE_PATH}/id`,
                    query: { return: VIEW_ALL_DISRUPTIONS_PAGE_PATH },
                }}
                key="key-4"
            >
                aft62h
            </Link>
        ),
        name: "Random name3",
        start: "25/03/2024",
        role: "Director",
    },
];

const defaultSortFunction = (rows: RandomTable[], sortField: keyof RandomTable) =>
    rows.sort((a, b) => a[sortField].toString().localeCompare(b[sortField].toString()));

describe("SortableTable", () => {
    it("should render correctly", () => {
        const { asFragment } = render(<SortableTable columns={defaultColumn} rows={defaultData} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly when empty arrays are passed", () => {
        const { asFragment } = render(<SortableTable columns={[]} rows={[]} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with pagination", () => {
        const { asFragment } = render(
            <SortableTable columns={defaultColumn} rows={Array.from({ length: 10 }, () => [...defaultData]).flat()} />,
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with sorting function", () => {
        const { asFragment } = render(
            <SortableTable
                columns={defaultColumn}
                rows={Array.from({ length: 10 }, () => [...defaultData]).flat()}
                sortFunction={defaultSortFunction}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
