import { ReactElement, useEffect, useState } from "react";

export interface TableColumn<T> {
    displayName: string;
    key: keyof T;
}

interface SortableTableProps<T> {
    columns: TableColumn<T>[];
    rows: T[];
}

enum SortOrder {
    asc = "asc",
    desc = "desc",
}
const SortableTable = <T extends object>({ columns, rows }: SortableTableProps<T>): ReactElement => {
    const [sortedField, setSortedField] = useState<keyof T | null>(null);
    const [sortOrder, setSortOrder] = useState(SortOrder.asc);
    const [sortFlag, setSortFlag] = useState(false);
    const [displayRows, setDisplayRows] = useState<T[]>(rows);

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
        const sortedData = displayRows.sort((a, b) => {
            if (sortedField) {
                const aValue = a[sortedField] as string;
                const bValue = b[sortedField] as string;
                if (sortOrder === SortOrder.asc) {
                    return aValue.localeCompare(bValue);
                } else {
                    return bValue.localeCompare(aValue);
                }
            } else {
                return -1;
            }
        });
        setDisplayRows(sortedData);
    }, [sortFlag]);

    return <></>;
};

export default SortableTable;
