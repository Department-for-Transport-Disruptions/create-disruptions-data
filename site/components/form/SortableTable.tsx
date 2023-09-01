import { ReactElement, useEffect, useState } from "react";
import PageNumbers from "../layout/PageNumbers";

export interface TableColumn<T> {
    displayName: string;
    key: keyof T;
    sortable?: boolean;
}

interface SortableTableProps<T> {
    columns: TableColumn<T>[];
    rows: T[];
    sortFunction?: (rows: T[], sortField: keyof T, sortOrder: SortOrder) => T[];
}

export enum SortOrder {
    asc = "asc",
    desc = "desc",
}

const getPages = <T extends object>(pageNumber: number, rows: T[]): T[] => {
    const startPoint = (pageNumber - 1) * 10;
    const endPoint = pageNumber * 10;
    return rows.slice(startPoint, endPoint);
};

const formatRows = <T extends object>(rows: T[], currentPage: number) => {
    const pages = getPages(currentPage, rows);

    return pages;
};

const SortableTable = <T extends object>({ columns, rows, sortFunction }: SortableTableProps<T>): ReactElement => {
    const [sortedField, setSortedField] = useState<keyof T | null>(null);
    const [sortOrder, setSortOrder] = useState(SortOrder.asc);
    const [sortFlag, setSortFlag] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [displayRows, setDisplayRows] = useState<T[]>(rows);
    const numberOfPages = Math.ceil(rows.length / 10);

    const sortData = (field: keyof T) => {
        if (sortedField === field) {
            setSortOrder(sortOrder === SortOrder.asc ? SortOrder.desc : SortOrder.asc);
            setSortFlag(!sortFlag);
        } else {
            setSortedField(field);
            setSortOrder(SortOrder.asc);
            setSortFlag(!sortFlag);
        }
    };

    useEffect(() => {
        setDisplayRows(rows);
    }, [rows]);

    const getArrowHeads = (field: keyof T) => {
        if (!sortedField || sortedField !== field) {
            return (
                <div className="flex flex-col pl-1 text-arrow">
                    <span className="-mb-1">&#x25B2;</span>
                    <span>&#x25BC;</span>
                </div>
            );
        } else {
            return sortOrder === SortOrder.asc ? (
                <span className="pl-1 govuk-!-font-size-14">&#x25B2;</span>
            ) : (
                <span className="pl-1 govuk-!-font-size-14">&#x25BC;</span>
            );
        }
    };

    useEffect(() => {
        if (sortedField && sortFunction) {
            const sortedData = sortFunction(displayRows, sortedField, sortOrder);
            setDisplayRows([...sortedData]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortFlag]);

    return (
        <>
            <table className="govuk-table">
                <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                        {columns.map((column) => {
                            return column.sortable ? (
                                <th
                                    scope="col"
                                    className="govuk-table__header align-middle px-2"
                                    key={`header-${column.displayName}`}
                                    onClick={() => sortData(column.key)}
                                >
                                    <div className="flex flex-row items-center">
                                        {column.displayName}
                                        {getArrowHeads(column.key)}
                                    </div>
                                </th>
                            ) : (
                                <th
                                    scope="col"
                                    className="govuk-table__header align-middle px-2"
                                    key={`header-${column.displayName}`}
                                >
                                    {column.displayName}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody className="govuk-table__body">
                    {formatRows(displayRows, currentPage).map((row, index) => (
                        <tr className="govuk-table__row" key={`row-${index}`}>
                            {columns.map((column, i) => (
                                <td className={"govuk-table__cell align-middle px-2"} key={`row-${index}${i}`}>
                                    {row[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <PageNumbers numberOfPages={numberOfPages} currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </>
    );
};

export default SortableTable;
