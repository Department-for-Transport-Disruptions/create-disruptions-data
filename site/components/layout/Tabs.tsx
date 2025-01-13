import kebabCase from "lodash/kebabCase";
import { ReactElement } from "react";

interface TabsProps {
    tabs: Tab[];
    tabsTitle: string;
}

interface Tab {
    tabHeader: string;
    content: ReactElement;
    handleTabClick?: () => void;
}

const Tabs = ({ tabsTitle, tabs }: TabsProps): ReactElement => (
    <div className="govuk-tabs" data-module="govuk-tabs">
        <h2 className="govuk-tabs__title">{tabsTitle}</h2>
        <ul className="govuk-tabs__list">
            {tabs.map((tab, index) => (
                <li
                    key={`tab-${index + 1}`}
                    className={`govuk-tabs__list-item${index === 0 ? " govuk-tabs__list-item--selected" : ""}`}
                >
                    <a className="govuk-tabs__tab" href={`#${kebabCase(tab.tabHeader)}`} onClick={tab.handleTabClick}>
                        {tab.tabHeader}
                    </a>
                </li>
            ))}
        </ul>
        {tabs.map((tab, index) => (
            <div
                key={`tab-panel-${index + 1}`}
                className={`govuk-tabs__panel${index !== 0 ? " govuk-tabs__panel--hidden" : ""}`}
                id={kebabCase(tab.tabHeader)}
            >
                {tab.content}
            </div>
        ))}
    </div>
);

export default Tabs;
