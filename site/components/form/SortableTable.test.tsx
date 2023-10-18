import Link from "next/link";
import renderer from "react-test-renderer";
import { describe, it, expect } from "vitest";
import SortableTable, { TableColumn } from "./SortableTable";
import { DISRUPTION_DETAIL_PAGE_PATH } from "../../constants";

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
                }}
                key="key-1"
            >
                aft62h
            </Link>
        ),
        name: "Random name3",
        start: "25/03/2024",
        role: "Director",
    },
];

const defaultSortFunction = (rows: RandomTable[], sortField: keyof RandomTable) => {
    return rows.sort((a, b) => {
        return a[sortField].toString().localeCompare(b[sortField].toString());
    });
};

describe("SortableTable", () => {
    it("should render correctly", () => {
        const tree = renderer.create(<SortableTable columns={defaultColumn} rows={defaultData} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly when empty arrays are passed", () => {
        const tree = renderer.create(<SortableTable columns={[]} rows={[]} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with pagination", () => {
        const tree = renderer
            .create(
                <SortableTable
                    columns={defaultColumn}
                    rows={Array.from({ length: 10 }, () => [...defaultData]).flat()}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should render correctly with sorting function", () => {
        const tree = renderer
            .create(
                <SortableTable
                    columns={defaultColumn}
                    rows={Array.from({ length: 10 }, () => [...defaultData]).flat()}
                    sortFunction={defaultSortFunction}
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
