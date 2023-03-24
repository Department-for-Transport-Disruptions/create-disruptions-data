import { ReactElement, ReactNode } from "react";

interface TableProps {
    caption?: string;
    columns?: string[];
    rows: { header?: string; cells: string[] | ReactNode[] }[];
}

const Table = ({ caption, columns = [], rows }: TableProps): ReactElement => {
    return (
        <table className="govuk-table">
            {caption ? <caption className="govuk-table__caption govuk-table__caption--l">{caption}</caption> : ""}
            <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                    {columns.map((column) => (
                        <th scope="col" className="govuk-table__header" key={column}>
                            {column}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="govuk-table__body">
                {rows.map((row, i) => (
                    <tr className="govuk-table__row" key={`row-${i}`}>
                        {row.header && (
                            <th scope="row" className="govuk-table__header">
                                {row.header}
                            </th>
                        )}
                        {row.cells.map((cell, i) => (
                            <td className="govuk-table__cell" key={i}>
                                {cell}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default Table;
