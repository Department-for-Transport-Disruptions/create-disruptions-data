import Link from "next/link";
import { ReactNode } from "react";

interface SummaryListProps {
    rows: {
        header?: string;
        value: string | ReactNode;
        actions?: {
            link:
                | string
                | {
                      pathname: string;
                      query: { template?: string | undefined; return: string } | { template: string } | null;
                  };
            actionName: string;
        }[];
    }[];
}

const SummaryList = ({ rows }: SummaryListProps) => (
    <dl className="govuk-summary-list">
        {rows.map((row) => (
            <div className="govuk-summary-list__row" key={row.header}>
                <dt className="govuk-summary-list__key">{row.header}</dt>
                <dd className="govuk-summary-list__value">{row.value}</dd>
                <dd className="govuk-summary-list__actions">
                    <ul className="govuk-summary-list__actions-list">
                        {row.actions && row.actions.length > 0
                            ? row.actions.map((action) => (
                                  <li className="govuk-summary-list__actions-list-item" key={row.header}>
                                      <Link className="govuk-link" href={action.link}>
                                          {action.actionName}
                                          <span className="govuk-visually-hidden">{row.header}</span>
                                      </Link>
                                  </li>
                              ))
                            : null}
                    </ul>
                </dd>
            </div>
        ))}
    </dl>
);

export default SummaryList;
